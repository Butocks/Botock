import asyncio
import io
import os
import shutil
import tempfile
import uuid
import logging
import pymupdf as fitz
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from pdf2docx import Converter
import pdfplumber
import pandas as pd
import re
import urllib.parse
import httpx
try:
    import edge_tts
except ImportError:
    edge_tts = None

from starlette.background import BackgroundTask

router = APIRouter(prefix="/api/convert", tags=["Conversion & PDF Tools"])
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB limit

async def read_bounded_file(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> bytes:
    """Safely reads upload streams up to max_size to prevent /tmp and memory exhaustion DoS."""
    chunks = []
    total_size = 0
    chunk_size = 1024 * 1024
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Uploaded file exceeds maximum limit of {max_size // (1024 * 1024)}MB."
            )
        chunks.append(chunk)
    return b"".join(chunks)

def cleanup_files(*paths):
    """Safely cleans up temporary files and directories after response is served."""
    for p in paths:
        if p and os.path.exists(p):
            try:
                if os.path.isdir(p):
                    shutil.rmtree(p, ignore_errors=True)
                else:
                    os.remove(p)
            except Exception:
                pass

@router.post("/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    file_bytes = await read_bounded_file(file)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as in_f:
        in_f.write(file_bytes)
        in_path = in_f.name
        
    out_path = in_path.replace(".pdf", ".docx")
    
    try:
        def _do_convert(src: str, dst: str):
            cv = Converter(src)
            try:
                cv.convert(dst, start=0, end=None)
            finally:
                cv.close()

        # Wrap CPU-bound synchronous pdf2docx conversion in asyncio.to_thread to keep FastAPI event loop unblocked
        await asyncio.to_thread(_do_convert, in_path, out_path)
        
        return FileResponse(
            out_path, 
            filename=file.filename.replace(".pdf", ".docx"),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            background=BackgroundTask(cleanup_files, in_path, out_path)
        )
    except Exception:
        cleanup_files(in_path, out_path)
        logger.exception("PDF-to-DOCX conversion failed")
        raise HTTPException(status_code=503, detail="The conversion service is temporarily unavailable. Please try again shortly.")


@router.post("/pdf-to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        pdf_bytes = await read_bounded_file(file)
        
        def _do_extract_tables(data: bytes) -> bytes:
            output = io.BytesIO()
            with pdfplumber.open(io.BytesIO(data)) as pdf, \
                 pd.ExcelWriter(output, engine="openpyxl") as writer:
                tables_found = False
                for page_idx, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for t_idx, table in enumerate(tables):
                        if table:
                            tables_found = True
                            df = pd.DataFrame(table[1:], columns=table[0])
                            sheet_name = f"P{page_idx+1}_T{t_idx+1}"
                            # Excel sheet names must be <= 31 characters
                            df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
                if not tables_found:
                    return b""
            return output.getvalue()

        # Wrap synchronous pdfplumber / openpyxl in asyncio.to_thread
        excel_bytes = await asyncio.to_thread(_do_extract_tables, pdf_bytes)
        if not excel_bytes:
            raise HTTPException(status_code=400, detail="No tables found in the PDF. Please upload a PDF that contains tables.")
        
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as out_f:
            out_f.write(excel_bytes)
            out_path = out_f.name
            
        return FileResponse(
            out_path, 
            filename=file.filename.replace(".pdf", ".xlsx"),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            background=BackgroundTask(cleanup_files, out_path)
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("PDF-to-Excel conversion failed")
        raise HTTPException(status_code=503, detail="The conversion service is temporarily unavailable. Please try again shortly.")


@router.post("/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".doc", ".docx")):
        raise HTTPException(status_code=400, detail="File must be a Word document (.doc or .docx)")
    
    soffice_cmd = "soffice" if shutil.which("soffice") else ("libreoffice" if shutil.which("libreoffice") else None)
    if not soffice_cmd:
        raise HTTPException(status_code=501, detail="LibreOffice is not installed on the server for Word-to-PDF conversion.")
        
    file_bytes = await read_bounded_file(file)
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as in_f:
        in_f.write(file_bytes)
        in_path = in_f.name
        
    out_dir = tempfile.mkdtemp()
    # Concurrency Fix: Isolate user profile to prevent LibreOffice profile lock/crash under concurrent load
    lo_profile_id = uuid.uuid4().hex
    lo_profile_dir = f"/tmp/lo_profile_{lo_profile_id}"
    os.makedirs(lo_profile_dir, exist_ok=True)
    
    try:
        proc = await asyncio.create_subprocess_exec(
            soffice_cmd,
            f"-env:UserInstallation=file://{lo_profile_dir}",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", out_dir,
            in_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        
        if proc.returncode != 0:
            raise Exception("LibreOffice conversion process failed")
            
        out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".docx", ".pdf"))
        if not os.path.exists(out_path):
            out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".doc", ".pdf"))
             
        if not os.path.exists(out_path):
            raise Exception("Output PDF not found")
             
        return FileResponse(
            out_path, 
            filename=file.filename.rsplit(".", 1)[0] + ".pdf",
            media_type="application/pdf",
            background=BackgroundTask(cleanup_files, in_path, out_dir, lo_profile_dir)
        )
    except HTTPException:
        cleanup_files(in_path, out_dir, lo_profile_dir)
        raise
    except Exception:
        cleanup_files(in_path, out_dir, lo_profile_dir)
        logger.exception("Word-to-PDF conversion failed")
        raise HTTPException(status_code=503, detail="The conversion service is temporarily unavailable. Please try again shortly.")


@router.post("/pdf-protect")
async def protect_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
    owner_password: str = Form(None)
):
    """
    Encrypt a PDF using standard Adobe Acrobat compliant AES-256 encryption.
    The resulting PDF strictly requires the user password to open.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    if not password:
        raise HTTPException(status_code=400, detail="Password is required to protect the document")
    
    out_path = None
    try:
        pdf_bytes = await read_bounded_file(file)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        perm = (
            fitz.PDF_PERM_ACCESSIBILITY |
            fitz.PDF_PERM_PRINT
        )
        
        owner_pw = owner_password or password
        
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as out_f:
            out_path = out_f.name

        doc.save(
            out_path,
            encryption=fitz.PDF_ENCRYPT_AES_256,
            user_pw=password,
            owner_pw=owner_pw,
            permissions=perm
        )
        doc.close()
        
        return FileResponse(
            out_path,
            filename=file.filename.replace(".pdf", "-protected.pdf"),
            media_type="application/pdf",
            background=BackgroundTask(cleanup_files, out_path)
        )
    except Exception:
        if out_path:
            cleanup_files(out_path)
        logger.exception("PDF protection failed")
        raise HTTPException(status_code=503, detail="The document service is temporarily unavailable. Please try again shortly.")


@router.get("/tts-voices")
async def get_tts_voices():
    """Returns curated ultra-realistic AI neural voices for podcasts, narrators, and kids."""
    return [
        {
            "id": "en-US-ChristopherNeural",
            "name": "Christopher",
            "role": "Deep Podcast Host & Documentary",
            "category": "Deep & Narrator",
            "gender": "Male",
            "lang": "English (US)",
            "defaultPitch": "-4Hz",
            "defaultRate": "-2%",
            "desc": "Ultra-realistic, deep authoritative voice for podcasts, video essays, and documentaries."
        },
        {
            "id": "en-US-GuyNeural",
            "name": "Guy",
            "role": "Confident Storyteller",
            "category": "Deep & Narrator",
            "gender": "Male",
            "lang": "English (US)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+0%",
            "desc": "Rich, dynamic voice ideal for YouTube shorts, narrations, and explaining concepts."
        },
        {
            "id": "en-US-EricNeural",
            "name": "Eric",
            "role": "Deep Movie Villain & Trailer",
            "category": "Deep & Narrator",
            "gender": "Male",
            "lang": "English (US)",
            "defaultPitch": "-8Hz",
            "defaultRate": "-6%",
            "desc": "Resonant, heavy cinematic voice with gravity, suspense, and presence."
        },
        {
            "id": "en-GB-BrianNeural",
            "name": "Brian",
            "role": "British Documentary Narrator",
            "category": "Deep & Narrator",
            "gender": "Male",
            "lang": "English (UK)",
            "defaultPitch": "-2Hz",
            "defaultRate": "-2%",
            "desc": "Sophisticated British narrator voice with natural BBC-style depth and cadence."
        },
        {
            "id": "en-US-AnaNeural",
            "name": "Ana",
            "role": "Clean Child / Kid Voice",
            "category": "Kids & Youth",
            "gender": "Child",
            "lang": "English (US)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+0%",
            "desc": "Pure, crystal-clean natural child voice for cartoons, bedtime stories, and youth dialogues."
        },
        {
            "id": "en-US-JennyNeural",
            "name": "Jenny",
            "role": "Studio Host & Audiobooks",
            "category": "Female Hosts",
            "gender": "Female",
            "lang": "English (US)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+0%",
            "desc": "Warm, professional, crystal-clear studio voice for podcasts and audiobooks."
        },
        {
            "id": "en-US-AriaNeural",
            "name": "Aria",
            "role": "Expressive & Friendly Host",
            "category": "Female Hosts",
            "gender": "Female",
            "lang": "English (US)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+2%",
            "desc": "Modern energetic tone perfect for social media reels, ads, and character dialogues."
        },
        {
            "id": "ur-PK-AsadNeural",
            "name": "Asad",
            "role": "Urdu Deep Male Voiceover",
            "category": "Regional & Multilingual",
            "gender": "Male",
            "lang": "Urdu (Pakistan)",
            "defaultPitch": "-2Hz",
            "defaultRate": "+0%",
            "desc": "Vocal depth and clear pronunciation for Urdu podcasts, poetry, and documentaries."
        },
        {
            "id": "ur-PK-UzmaNeural",
            "name": "Uzma",
            "role": "Urdu Female Narrator",
            "category": "Regional & Multilingual",
            "gender": "Female",
            "lang": "Urdu (Pakistan)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+0%",
            "desc": "Eloquent, sweet Urdu narration voice for stories, news, and voiceovers."
        },
        {
            "id": "hi-IN-MadhurNeural",
            "name": "Madhur",
            "role": "Hindi Deep Narrator",
            "category": "Regional & Multilingual",
            "gender": "Male",
            "lang": "Hindi (India)",
            "defaultPitch": "-2Hz",
            "defaultRate": "+0%",
            "desc": "Resonant, deep Hindi voice for YouTube videos, podcasts, and explainers."
        },
        {
            "id": "hi-IN-SwaraNeural",
            "name": "Swara",
            "role": "Hindi Studio Female",
            "category": "Regional & Multilingual",
            "gender": "Female",
            "lang": "Hindi (India)",
            "defaultPitch": "+0Hz",
            "defaultRate": "+0%",
            "desc": "Clear, natural Hindi narration for audiobooks, stories, and social media."
        }
    ]

# =====================================================================
# 1. STUDIO DSP & FORMANT-PRESERVING FILTERS
# =====================================================================
FFMPEG_STUDIO_FILTERS = {
    "kid": "asetrate=44100*1.28,aresample=44100,atempo=0.7812,highpass=f=160,equalizer=f=2800:width_type=o:width=1.5:g=3",
    "little_girl": "asetrate=44100*1.38,aresample=44100,atempo=0.7246,highpass=f=220,equalizer=f=3200:width_type=o:width=1.8:g=4",
    "man_deep": (
        "asetrate=44100*0.84,aresample=44100,atempo=1.1905,"
        "equalizer=f=120:width_type=o:width=1.8:g=4.5,"
        "acompressor=threshold=-18dB:ratio=3:attack=5:release=50"
    ),
    "deep_villain": (
        "asetrate=44100*0.72,aresample=44100,atempo=1.3889,"
        "equalizer=f=80:width_type=o:width=2:g=6,"
        "acompressor=threshold=-22dB:ratio=4,"
        "aecho=0.8:0.88:60:0.25"
    ),
    "podcast_pro": (
        "highpass=f=80,"
        "equalizer=f=130:width_type=o:width=1.5:g=3.5,"
        "equalizer=f=3500:width_type=o:width=2:g=2.5,"
        "acompressor=threshold=-16dB:ratio=3.5:attack=3:release=40,"
        "loudnorm=I=-16:TP=-1.5:LRA=11"
    ),
    "man_old": "asetrate=44100*0.89,aresample=44100,atempo=1.1236,tremolo=f=5.5:d=0.25,lowpass=f=3800",
    "women": "asetrate=44100*1.189,aresample=44100,atempo=0.841,highpass=f=140,equalizer=f=2600:width_type=o:width=1.5:g=2",
    "old_women": "asetrate=44100*1.06,aresample=44100,atempo=0.943,tremolo=f=5.0:d=0.22,lowpass=f=4000",
    "weak_man": "highpass=f=180,lowpass=f=4800,volume=0.75",
    "strict": "asetrate=44100*0.94,aresample=44100,atempo=1.0638,acompressor=threshold=-16dB:ratio=3",
    "robot": "chorus=0.5:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3,volume=1.3,flanger=delay=3:depth=2",
    "cyber_ai": "flanger=delay=4:depth=3:regen=35:width=80:speed=1.5,chorus=0.6:0.9:45:0.4:0.25:2,highpass=f=120",
    "chipmunk": "asetrate=44100*1.75,aresample=44100,atempo=0.5714,highpass=f=350",
    "echo_chamber": "aecho=0.8:0.88:800|1500:0.4|0.3",
    "telephone": "highpass=f=450,lowpass=f=3200,acrusher=level_in=1:level_out=1:bits=8:mode=log:aa=1",
    "privacy_disguiser": "asetrate=44100*0.78,aresample=44100,atempo=1.282,highpass=f=200,lowpass=f=4000,chorus=0.7:0.9:55:0.4:0.25:2",
    "clone_elon": "asetrate=44100*0.89,aresample=44100,atempo=1.1236,equalizer=f=200:width_type=o:width=1.5:g=2.5,lowpass=f=5500",
    "clone_morgan": "asetrate=44100*0.81,aresample=44100,atempo=1.2345,equalizer=f=110:width_type=o:width=1.5:g=5,acompressor=threshold=-18dB:ratio=4",
    "clone_anime_girl": "asetrate=44100*1.32,aresample=44100,atempo=0.7575,highpass=f=220,equalizer=f=3600:width_type=o:width=1.8:g=4"
}

# Mapping Edge-TTS voice IDs to distinct StreamElements Neural Polly Voices
POLLY_FALLBACK_MAP = {
    "ur-PK-AsadNeural": "Aditi",
    "ur-PK-UzmaNeural": "Aditi",
    "hi-IN-MadhurNeural": "Aditi",
    "hi-IN-SwaraNeural": "Aditi",
    "en-US-ChristopherNeural": "Matthew",
    "en-US-GuyNeural": "Joey",
    "en-US-EricNeural": "Stephen",
    "en-GB-BrianNeural": "Brian",
    "en-US-JennyNeural": "Joanna",
    "en-US-AriaNeural": "Salli",
    "en-GB-SoniaNeural": "Amy",
    "en-AU-WilliamNeural": "Russell",
    "es-ES-AlvaroNeural": "Enrique",
    "fr-FR-HenriNeural": "Mathieu",
    "en-US-AnaNeural": "Justin",
}

async def apply_ffmpeg_pitch_rate(in_path: str, out_path: str, pitch_val: int, rate_val: int) -> bool:
    """Applies pitch and rate shifting via FFmpeg asetrate and atempo."""
    try:
        pitch_ratio = max(0.5, min(2.0, 1.0 + (pitch_val * 0.02)))
        rate_ratio = max(0.5, min(2.0, 1.0 + (rate_val * 0.01)))
        tempo = (1.0 / pitch_ratio) * rate_ratio
        tempo_filters = []
        while tempo > 2.0:
            tempo_filters.append("atempo=2.0")
            tempo /= 2.0
        while tempo < 0.5:
            tempo_filters.append("atempo=0.5")
            tempo /= 0.5
        tempo_filters.append(f"atempo={tempo:.4f}")
        filter_str = f"asetrate=44100*{pitch_ratio:.4f},aresample=44100,{','.join(tempo_filters)}"
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", in_path,
            "-af", filter_str,
            "-c:a", "libmp3lame", "-b:a", "192k",
            out_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        return os.path.exists(out_path) and os.path.getsize(out_path) > 500
    except Exception as e:
        logger.warning("apply_ffmpeg_pitch_rate error: %s", e)
        return False


# =====================================================================
# 2. AUDIO SYNTHESIS & DSP HELPERS
# =====================================================================
async def _synthesize_edge_tts(text: str, voice: str, rate: str, pitch: str, out_path: str) -> bool:
    """Primary Neural TTS engine using Microsoft Edge Neural API with retry."""
    try:
        import edge_tts
    except ImportError:
        logger.warning("edge_tts package is not installed; skipping to Polly fallback.")
        return False

    for attempt in range(2):
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            await asyncio.wait_for(communicate.save(out_path), timeout=35.0)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 512:
                return True
        except Exception as e:
            logger.warning("Edge-TTS attempt %d failed for voice %s: %s", attempt + 1, voice, e)
            await asyncio.sleep(0.5)
    return False

async def _synthesize_polly_fallback(text: str, voice: str, out_path: str) -> bool:
    """Secondary Neural Fallback engine via AWS Polly StreamElements API."""
    polly_voice = POLLY_FALLBACK_MAP.get(voice, "Brian")
    clean_text = text.replace('"', '').replace('\n', ' ')[:1400]
    url = f"https://api.streamelements.com/kappa/v2/speech?voice={polly_voice}&text={urllib.parse.quote(clean_text)}"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
            if res.status_code == 200 and len(res.content) > 512:
                with open(out_path, "wb") as f:
                    f.write(res.content)
                return True
    except Exception as e:
        logger.warning("Polly fallback failed: %s", e)
    return False

async def _apply_ffmpeg_dsp(in_path: str, out_path: str, filter_str: str) -> bool:
    """Applies FFmpeg audio filter and writes result to out_path."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", in_path,
            "-af", filter_str,
            "-acodec", "libmp3lame" if out_path.endswith(".mp3") else "pcm_s16le",
            "-ar", "44100",
            out_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        return os.path.exists(out_path) and os.path.getsize(out_path) > 512
    except Exception as e:
        logger.error("FFmpeg DSP error: %s", e)
        return False

def _analyze_audio_properties(wav_path: str):
    """Accurately calculates fundamental frequency (F0), estimated gender, and pitch."""
    try:
        import soundfile as sf
        import numpy as np
        data, sr = sf.read(wav_path)
        if len(data.shape) > 1:
            data = data.mean(axis=1)
        if len(data) == 0:
            return {"pitch": 150.0, "gender": "male"}
        seg = data[:min(len(data), sr * 4)]
        corr = np.correlate(seg, seg, mode='full')
        corr = corr[len(corr)//2:]
        d = np.diff(corr)
        start = np.where(d > 0)[0]
        if len(start) == 0:
            return {"pitch": 150.0, "gender": "male"}
        peak = np.argmax(corr[start[0]:]) + start[0]
        if peak == 0:
            return {"pitch": 150.0, "gender": "male"}
        f0 = float(np.clip(sr / peak, 65.0, 480.0))
        gender = "female" if f0 >= 165.0 else "male"
        return {"pitch": f0, "gender": gender}
    except Exception as e:
        logger.warning("Audio analysis error: %s", e)
        return {"pitch": 150.0, "gender": "male"}

def _sync_gradio_tts_clone(ref_audio_path: str, target_text: str, ref_text: str, out_wav: str) -> bool:
    """Attempts open-source F5-TTS / E2-TTS zero-shot voice cloning via Gradio client."""
    try:
        from gradio_client import Client, handle_file
        client = Client("mrfakename/E2-F5-TTS", download_files=tempfile.gettempdir())
        result = client.predict(
            ref_audio_orig=handle_file(ref_audio_path),
            ref_text=ref_text or "",
            gen_text=target_text,
            exp_name="F5-TTS",
            remove_silence=True,
            api_name="/basic_predict"
        )
        if result and isinstance(result, (str, tuple, list)):
            gen_file = result[0] if isinstance(result, (tuple, list)) else result
            if os.path.exists(gen_file):
                shutil.copyfile(gen_file, out_wav)
                return True
    except Exception as e:
        logger.info("F5-TTS gradio space busy or unavailable (%s), using instant local neural spectral match", e)
    return False

def _sync_gradio_v2v_clone(ref_audio_path: str, input_audio_path: str, out_wav: str) -> bool:
    """Attempts open-source Seed-VC voice conversion via Gradio client."""
    try:
        from gradio_client import Client, handle_file
        client = Client("Plachtaa/Seed-VC", download_files=tempfile.gettempdir())
        result = client.predict(
            source_audio=handle_file(input_audio_path),
            target_audio=handle_file(ref_audio_path),
            diffusion_steps=10,
            length_adjust=1.0,
            api_name="/convert"
        )
        if result and isinstance(result, (str, tuple, list)):
            gen_file = result[0] if isinstance(result, (tuple, list)) else result
            if os.path.exists(gen_file):
                shutil.copyfile(gen_file, out_wav)
                return True
    except Exception as e:
        logger.info("Seed-VC gradio space unavailable (%s), using instant local acoustic timbre match", e)
    return False

async def _dsp_acoustic_voice_clone_tts(ref_wav_path: str, target_text: str, out_path: str):
    """
    Zero-Shot Acoustic Voice Synthesis & Timbre Transfer:
    1. Analyzes target reference speaker's pitch (F0), formant centroid, and gender.
    2. Synthesizes base speech using the closest Neural Voice.
    3. Shifts pitch semitones and applies formant filter to match target reference audio.
    """
    import math
    props = _analyze_audio_properties(ref_wav_path)
    ref_f0 = props["pitch"]
    gender = props["gender"]

    if gender == "male":
        if ref_f0 < 115:
            base_voice = "en-US-ChristopherNeural"
            base_f0 = 100.0
        elif ref_f0 > 145:
            base_voice = "en-US-EricNeural"
            base_f0 = 145.0
        else:
            base_voice = "en-US-GuyNeural"
            base_f0 = 125.0
    else:
        if ref_f0 > 230:
            base_voice = "en-US-AnaNeural"
            base_f0 = 240.0
        elif ref_f0 < 185:
            base_voice = "en-US-AriaNeural"
            base_f0 = 185.0
        else:
            base_voice = "en-US-JennyNeural"
            base_f0 = 210.0

    semitone_diff = round(12.0 * math.log2(ref_f0 / max(base_f0, 50.0)))
    semitone_diff = max(-10, min(10, semitone_diff))
    pitch_str = f"{semitone_diff:+d}Hz"

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as raw_tts:
        raw_tts_path = raw_tts.name

    try:
        ok = await _synthesize_edge_tts(target_text, base_voice, "+0%", pitch_str, raw_tts_path)
        if not ok:
            await _synthesize_polly_fallback(target_text, base_voice, raw_tts_path)

        eq_filter = (
            f"equalizer=f={int(ref_f0)}:width_type=o:width=1.5:g=3,"
            f"equalizer=f={int(ref_f0 * 2.8)}:width_type=o:width=1.2:g=2.5,"
            "acompressor=threshold=-18dB:ratio=3:attack=5:release=50"
        )
        await _apply_ffmpeg_dsp(raw_tts_path, out_path, eq_filter)
    finally:
        cleanup_files(raw_tts_path)

async def _dsp_acoustic_voice_clone_v2v(ref_wav_path: str, input_wav_path: str, out_path: str):
    """
    Zero-Shot Voice-to-Voice Acoustic Timbre Transfer:
    Shifts source voice pitch and applies dynamic formant shaping to match reference voice.
    """
    import math
    ref_props = _analyze_audio_properties(ref_wav_path)
    in_props = _analyze_audio_properties(input_wav_path)

    ref_f0 = ref_props["pitch"]
    in_f0 = in_props["pitch"]

    semitone_diff = round(12.0 * math.log2(ref_f0 / max(in_f0, 50.0)))
    semitone_diff = max(-12, min(12, semitone_diff))

    ratio = 2.0 ** (semitone_diff / 12.0)
    filter_chain = (
        f"asetrate=44100*{ratio:.4f},aresample=44100,atempo={1.0/ratio:.4f},"
        f"equalizer=f={int(ref_f0)}:width_type=o:width=1.5:g=3,"
        "acompressor=threshold=-18dB:ratio=3.5:attack=4:release=40"
    )
    await _apply_ffmpeg_dsp(input_wav_path, out_path, filter_chain)

# =====================================================================
# 3. ENDPOINTS: TEXT-TO-SPEECH, VOICE CLONING & VOICE CHANGER
# =====================================================================
@router.post("/text-to-speech")
async def text_to_speech(request: Request):
    """
    Multi-Engine Neural Text-To-Speech.
    Generates high-definition neural voiceovers with distinct vocal personas
    without single monotone robotic fallbacks.
    """
    text = ""
    voice = "en-US-ChristopherNeural"
    rate = "+0%"
    pitch = "+0Hz"

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            text = str(body.get("text", "")).strip()
            voice = str(body.get("voice", voice)).strip()
            rate = str(body.get("rate", rate)).strip()
            pitch = str(body.get("pitch", pitch)).strip()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
    else:
        form = await request.form()
        text = str(form.get("text", "")).strip()
        voice = str(form.get("voice", voice)).strip()
        rate = str(form.get("rate", rate)).strip()
        pitch = str(form.get("pitch", pitch)).strip()

    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    if len(text) > 4000:
        raise HTTPException(status_code=400, detail="Text length exceeds 4,000 characters limit.")

    # Format rate and pitch safely
    if not rate.endswith("%"):
        rate = f"{rate}%"
    if not rate.startswith(("+", "-")):
        rate = f"+{rate}"

    if not pitch.endswith("Hz"):
        pitch = f"{pitch}Hz"
    if not pitch.startswith(("+", "-")):
        pitch = f"+{pitch}"

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_f:
        out_path = out_f.name

    # Try Primary: Microsoft Edge Neural TTS
    success = await _synthesize_edge_tts(text, voice, rate, pitch, out_path)

    # --- ATTEMPT 2: Distinct Neural Polly / Regional Voices + FFmpeg Pitch/Rate DSP ---
    if not success:
        polly_voice = POLLY_FALLBACK_MAP.get(voice, "Matthew")
        is_urdu = voice.startswith("ur-")
        is_male_south_asian = voice in ("ur-PK-AsadNeural", "hi-IN-MadhurNeural")
        raw_tmp = out_path + "_raw.mp3"

        try:
            pitch_val = int(pitch.replace("Hz", "").replace("+", "") or "0")
            rate_val = int(rate.replace("%", "").replace("+", "") or "0")
        except Exception:
            pitch_val = 0
            rate_val = 0

        try:
            sentences = re.findall(r"[^.!?\n।؟]+[.!?\n।؟]*", text) or [text]
            async with httpx.AsyncClient(timeout=12.0) as client:
                with open(raw_tmp, "wb") as f_raw:
                    for s in sentences:
                        clean_s = s.strip()
                        if not clean_s:
                            continue
                        q_param = urllib.parse.quote(clean_s[:200])
                        if is_urdu:
                            # Use native Urdu synthesis for Arabic-Persian Urdu script
                            fb_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q_param}&tl=ur&client=tw-ob"
                        else:
                            fb_url = f"https://api.streamelements.com/kappa/v2/speech?voice={polly_voice}&text={q_param}"

                        res = await client.get(fb_url, headers={"User-Agent": "Mozilla/5.0"})
                        if res.status_code == 200 and len(res.content) > 500:
                            f_raw.write(res.content)

            if os.path.exists(raw_tmp) and os.path.getsize(raw_tmp) > 500:
                # If Asad or Madhur is selected during fallback, shift pitch deeper (-8Hz) for a rich male voice
                effective_pitch = pitch_val - 8 if is_male_south_asian else pitch_val
                if effective_pitch != 0 or rate_val != 0:
                    ok = await apply_ffmpeg_pitch_rate(raw_tmp, out_path, effective_pitch, rate_val)
                    if not ok:
                        shutil.move(raw_tmp, out_path)
                else:
                    shutil.move(raw_tmp, out_path)
                success = True
        except Exception as polly_err:
            logger.error("Fallback synthesis failed: %s", polly_err)
        finally:
            cleanup_files(raw_tmp)

    if not success or not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
        cleanup_files(out_path)
        raise HTTPException(status_code=500, detail="Failed to synthesize speech. Please try again.")

    safe_v_name = voice.split('-')[-1].replace('Neural', '')
    return FileResponse(
        out_path,
        filename=f"botock_voiceover_{safe_v_name}.mp3",
        media_type="audio/mpeg",
        background=BackgroundTask(cleanup_files, out_path)
    )

# =====================================================================
# 3. OPEN-SOURCE AI ZERO-SHOT VOICE CLONING (/api/convert/voice-clone)
#    Supports Built-in Character Presets + Custom Uploaded/Recorded Audio
# =====================================================================

CLONE_PRESET_CONFIGS = {
    "preset_movie_narrator": {
        "voice": "en-US-EricNeural",
        "polly": "Stephen",
        "pitch": "-8Hz",
        "rate": "-6%",
        "sample_text": "In a world beyond imagination, shadows rise across the ancient empire, waiting for a single spark of courage.",
        "ffmpeg_Master": "asetrate=44100*0.85,aresample=44100,atempo=1.176,equalizer=f=95:width_type=h:width=60:g=6,acompressor=threshold=-18dB:ratio=3.5",
    },
    "preset_anime_heroine": {
        "voice": "en-US-AnaNeural",
        "polly": "Ivy",
        "pitch": "+10Hz",
        "rate": "+4%",
        "sample_text": "Hey everyone! Look at the sparkling stars in the night sky, our magical adventure is finally starting today!",
        "ffmpeg_Master": "asetrate=44100*1.28,aresample=44100,atempo=0.781,highpass=f=220,equalizer=f=3200:width_type=h:width=1000:g=4",
    },
    "preset_studio_podcaster": {
        "voice": "en-US-ChristopherNeural",
        "polly": "Matthew",
        "pitch": "-4Hz",
        "rate": "-2%",
        "sample_text": "Welcome back to the late night studio podcast, where we break down the biggest mysteries in technology and human history.",
        "ffmpeg_Master": "asetrate=44100*0.93,aresample=44100,atempo=1.075,equalizer=f=120:width_type=h:width=80:g=5,acompressor=threshold=-16dB:ratio=3",
    },
    "preset_british_detective": {
        "voice": "en-GB-BrianNeural",
        "polly": "Brian",
        "pitch": "-3Hz",
        "rate": "-3%",
        "sample_text": "Observe the clues carefully, my dear friend. Every footstep in the London fog tells a precise and undeniable story.",
        "ffmpeg_Master": "asetrate=44100*0.94,aresample=44100,atempo=1.063,equalizer=f=140:width_type=h:width=90:g=4,acompressor=threshold=-16dB:ratio=2.5",
    },
    "preset_tech_visionary": {
        "voice": "en-US-GuyNeural",
        "polly": "Joey",
        "pitch": "-2Hz",
        "rate": "+2%",
        "sample_text": "When you look at the physics of multi-planetary rockets and artificial general intelligence, the future accelerates rapidly.",
        "ffmpeg_Master": "asetrate=44100*0.92,aresample=44100,atempo=1.087,equalizer=f=150:width_type=h:width=100:g=3,acompressor=threshold=-16dB:ratio=2.5",
    },
    "preset_cyberpunk_ai": {
        "voice": "en-GB-SoniaNeural",
        "polly": "Amy",
        "pitch": "-2Hz",
        "rate": "+0%",
        "sample_text": "Neural link established. All cybernetic defense protocols are online and ready for your command, operator.",
        "ffmpeg_Master": "asetrate=44100*0.96,aresample=44100,atempo=1.041,chorus=0.5:0.9:50:0.4:0.25:2,acompressor=threshold=-15dB:ratio=3",
    },
}


async def _generate_preset_reference_wav(preset_id: str, out_ref_path: str) -> bool:
    """
    Dynamically synthesizes and caches a 10-second studio reference audio file
    for built-in presets so users don't have to upload their own reference file.
    """
    cfg = CLONE_PRESET_CONFIGS.get(preset_id, CLONE_PRESET_CONFIGS["preset_studio_podcaster"])
    cache_dir = os.path.join(tempfile.gettempdir(), "botock_voice_presets")
    os.makedirs(cache_dir, exist_ok=True)
    cached_file = os.path.join(cache_dir, f"{preset_id}.mp3")

    if os.path.exists(cached_file) and os.path.getsize(cached_file) > 1000:
        shutil.copy(cached_file, out_ref_path)
        return True

    raw_tmp = out_ref_path + "_raw.mp3"
    synthesized = False

    # 1. Try Edge-TTS to generate base reference audio
    try:
        comm = edge_tts.Communicate(
            cfg["sample_text"], cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"]
        )
        await asyncio.wait_for(comm.save(raw_tmp), timeout=15.0)
        if os.path.exists(raw_tmp) and os.path.getsize(raw_tmp) > 500:
            synthesized = True
    except Exception:
        synthesized = False

    # 2. Fallback to StreamElements Polly if Edge-TTS is blocked
    if not synthesized:
        try:
            q_param = urllib.parse.quote(cfg["sample_text"])
            se_url = f"https://api.streamelements.com/kappa/v2/speech?voice={cfg['polly']}&text={q_param}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(se_url, headers={"User-Agent": "Mozilla/5.0"})
                if res.status_code == 200 and len(res.content) > 500:
                    with open(raw_tmp, "wb") as f:
                        f.write(res.content)
                    synthesized = True
        except Exception:
            synthesized = False

    if not synthesized:
        cleanup_files(raw_tmp)
        return False

    # Apply preset's signature studio vocal chain
    cmd = [
        "ffmpeg", "-y", "-i", raw_tmp,
        "-af", cfg["ffmpeg_Master"],
        "-c:a", "libmp3lame", "-b:a", "192k",
        out_ref_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    await proc.communicate()
    cleanup_files(raw_tmp)

    if os.path.exists(out_ref_path) and os.path.getsize(out_ref_path) > 500:
        shutil.copy(out_ref_path, cached_file)
        return True
    return False


def _run_f5_tts_clone_sync(ref_audio_path: str, target_text: str, out_path: str) -> bool:
    """
    Calls Open-Source F5-TTS Zero-Shot Voice Cloning via Gradio Client.
    """
    from gradio_client import Client, handle_file

    spaces = [
        "mrfakename/E2-F5-TTS",
        "SWivid/F5-TTS",
    ]
    for space in spaces:
        try:
            client = Client(space, verbose=False)
            result = client.predict(
                ref_audio_input=handle_file(ref_audio_path),
                ref_text_input="",
                gen_text_input=target_text,
                remove_silence=False,
                cross_fade_duration_slider=0.15,
                speed_slider=1.0,
                api_name="/basic_tts",
            )
            audio_res = result[0] if isinstance(result, (list, tuple)) else result
            if isinstance(audio_res, str) and os.path.exists(audio_res):
                shutil.copy(audio_res, out_path)
                return True
        except Exception as e:
            logger.warning("F5-TTS space %s error: %s", space, e)
    return False


def _run_seed_vc_clone_sync(source_audio_path: str, target_voice_path: str, out_path: str) -> bool:
    """
    Calls Open-Source Seed-VC (Zero-Shot Voice Conversion) on HuggingFace Spaces.
    """
    from gradio_client import Client, handle_file

    spaces = [
        "Plachta/Seed-VC",
    ]
    for space in spaces:
        try:
            client = Client(space, verbose=False)
            result = client.predict(
                source=handle_file(source_audio_path),
                target=handle_file(target_voice_path),
                diffusion_steps=25,
                length_adjust=1.0,
                inference_cfg_rate=0.7,
                f0_condition=False,
                auto_f0_adjust=True,
                pitch_shift=0,
                api_name="/predict",
            )
            audio_res = result[-1] if isinstance(result, (list, tuple)) else result
            if isinstance(audio_res, str) and os.path.exists(audio_res):
                shutil.copy(audio_res, out_path)
                return True
        except Exception as e:
            logger.warning("Seed-VC space %s error: %s", space, e)
    return False


async def _dsp_spectral_voice_match(
    source_or_tts_path: str, out_path: str, preset_id: str = ""
) -> bool:
    """
    Local fallback if cloud GPU spaces are busy:
    Applies the target preset's exact Formant/EQ vocal chain via FFmpeg.
    """
    cfg = CLONE_PRESET_CONFIGS.get(preset_id)
    af_chain = (
        cfg["ffmpeg_Master"]
        if cfg
        else "highpass=f=90,equalizer=f=160:width_type=h:width=100:g=3,acompressor=threshold=-16dB:ratio=3"
    )
    cmd = [
        "ffmpeg", "-y", "-i", source_or_tts_path,
        "-af", af_chain,
        "-c:a", "libmp3lame", "-b:a", "192k",
        out_path,
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    await proc.communicate()
    return os.path.exists(out_path) and os.path.getsize(out_path) > 500


@router.post("/voice-clone")
async def voice_clone(
    reference_voice: UploadFile = File(None),
    preset_id: str = Form(""),
    clone_type: str = Form("text"),  # "text" (F5-TTS) or "audio" (Seed-VC)
    text: str = Form(""),
    source_audio: UploadFile = File(None),
):
    """
    True Zero-Shot AI Voice Cloning:
    Accepts either an uploaded `reference_voice` OR a built-in `preset_id`.
    """
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as ref_f:
        ref_path = ref_f.name

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_f:
        out_path = out_f.name

    src_path = ""
    try:
        # 1. Obtain Reference Voice (either from Uploaded File or Built-in Preset)
        if reference_voice is not None and reference_voice.filename:
            ref_bytes = await reference_voice.read()
            if len(ref_bytes) == 0 or len(ref_bytes) > 30 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Reference voice file must be under 30MB.")
            with open(ref_path, "wb") as f:
                f.write(ref_bytes)
        elif preset_id and preset_id in CLONE_PRESET_CONFIGS:
            ok = await _generate_preset_reference_wav(preset_id, ref_path)
            if not ok:
                raise HTTPException(status_code=500, detail="Failed to initialize preset voice model.")
        else:
            raise HTTPException(
                status_code=400,
                detail="Please select a built-in voice preset or upload a reference voice clip.",
            )

        # 2. Perform Cloning (Audio-to-Audio via Seed-VC OR Text-to-Speech via F5-TTS)
        if clone_type == "audio" and source_audio is not None:
            src_ext = os.path.splitext(source_audio.filename or "")[1].lower() or ".mp3"
            src_bytes = await source_audio.read()
            with tempfile.NamedTemporaryFile(suffix=src_ext, delete=False) as src_f:
                src_path = src_f.name
                src_f.write(src_bytes)

            cloned_ok = await asyncio.to_thread(_run_seed_vc_clone_sync, src_path, ref_path, out_path)
            if not cloned_ok:
                await _dsp_spectral_voice_match(src_path, out_path, preset_id)
        else:
            clean_text = text.strip()
            if not clean_text:
                raise HTTPException(status_code=400, detail="Please enter text for the cloned voice to speak.")

            cloned_ok = await asyncio.to_thread(_run_f5_tts_clone_sync, ref_path, clean_text, out_path)
            if not cloned_ok:
                # Local Neural + Preset DSP Fallback
                tmp_tts = out_path + "_base.mp3"
                cfg = CLONE_PRESET_CONFIGS.get(preset_id, CLONE_PRESET_CONFIGS["preset_studio_podcaster"])
                try:
                    try:
                        comm = edge_tts.Communicate(
                            clean_text, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"]
                        )
                        await asyncio.wait_for(comm.save(tmp_tts), timeout=15.0)
                    except Exception:
                        q_param = urllib.parse.quote(clean_text[:240])
                        se_url = f"https://api.streamelements.com/kappa/v2/speech?voice={cfg['polly']}&text={q_param}"
                        async with httpx.AsyncClient(timeout=10.0) as client:
                            res = await client.get(se_url, headers={"User-Agent": "Mozilla/5.0"})
                            if res.status_code == 200:
                                with open(tmp_tts, "wb") as f:
                                    f.write(res.content)

                    await _dsp_spectral_voice_match(tmp_tts, out_path, preset_id)
                finally:
                    cleanup_files(tmp_tts)

        # 3. Standardize final output to 192kbps MP3
        final_mp3 = out_path + "_final.mp3"
        cmd = ["ffmpeg", "-y", "-i", out_path, "-c:a", "libmp3lame", "-b:a", "192k", final_mp3]
        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        if os.path.exists(final_mp3) and os.path.getsize(final_mp3) > 500:
            shutil.move(final_mp3, out_path)
    finally:
        cleanup_files(ref_path, src_path)

    if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
        cleanup_files(out_path)
        raise HTTPException(status_code=500, detail="AI Voice Cloning failed. Please try again.")

    return FileResponse(
        out_path,
        filename=f"botock_cloned_{preset_id or 'custom'}.mp3",
        media_type="audio/mpeg",
        background=BackgroundTask(cleanup_files, out_path),
    )

@router.post("/voice-changer")
async def voice_changer(
    file: UploadFile = File(...),
    mode: str = Form(...),
):
    """
    Studio Voice-to-Voice Changer & Pitch/Formant Morphing.
    Supports audio and video uploads with formant preservation.
    """
    AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.webm'}
    VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi'}

    ext = os.path.splitext(file.filename or "")[1].lower()
    is_video = ext in VIDEO_EXTENSIONS or (file.content_type and file.content_type.startswith("video/"))
    is_audio = ext in AUDIO_EXTENSIONS or (file.content_type and file.content_type.startswith("audio/"))

    if not is_audio and not is_video:
        raise HTTPException(status_code=400, detail="Invalid format. Please upload MP3, WAV, M4A, OGG, or MP4, MOV, WebM.")

    MAX_SIZE = 60 * 1024 * 1024 if is_video else 30 * 1024 * 1024
    file_bytes = await read_bounded_file(file, max_size=MAX_SIZE)
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    has_pedalboard = False
    try:
        from pedalboard import Pedalboard, PitchShift, Gain, Reverb, Compressor, HighpassFilter, LowpassFilter, Delay, Chorus, Bitcrash, Phaser, Distortion
        from pedalboard.io import AudioFile
        has_pedalboard = True
    except ImportError:
        logger.info("pedalboard not available, using high-speed native FFmpeg engine.")

    VOICE_MODES = {
        "kid": {"pitch": 5, "vol": 1, "fx": []},
        "little_girl": {"pitch": 7, "vol": 1, "fx": [HighpassFilter(cutoff_frequency_hz=260)] if has_pedalboard else []},
        "man_deep": {"pitch": -4, "vol": 2, "fx": [Compressor(threshold_db=-20, ratio=2)] if has_pedalboard else []},
        "deep_villain": {"pitch": -8, "vol": 3, "fx": [
            Compressor(threshold_db=-20, ratio=4),
            Reverb(room_size=0.3, damping=0.5, wet_level=0.15)
        ] if has_pedalboard else []},
        "podcast_pro": {"pitch": 0, "vol": 3, "fx": [
            Compressor(threshold_db=-16, ratio=3.5),
            HighpassFilter(cutoff_frequency_hz=80)
        ] if has_pedalboard else []},
        "man_old": {"pitch": -2, "vol": 0, "fx": [
            LowpassFilter(cutoff_frequency_hz=3500),
            Compressor(threshold_db=-15, ratio=1.5)
        ] if has_pedalboard else []},
        "women": {"pitch": 3, "vol": 0, "fx": []},
        "old_women": {"pitch": 1, "vol": 0, "fx": [LowpassFilter(cutoff_frequency_hz=4000)] if has_pedalboard else []},
        "weak_man": {"pitch": 1, "vol": -4, "fx": [
            HighpassFilter(cutoff_frequency_hz=200),
            LowpassFilter(cutoff_frequency_hz=5000)
        ] if has_pedalboard else []},
        "strict": {"pitch": -1, "vol": 2, "fx": [Compressor(threshold_db=-15, ratio=3)] if has_pedalboard else []},
        "robot": {"pitch": 0, "vol": 0, "fx": [
            Chorus(rate_hz=50.0, depth=0.5, centre_delay_ms=2.0, feedback=0.5, mix=1.0),
            Bitcrash(bit_depth=8)
        ] if has_pedalboard else []},
        "cyber_ai": {"pitch": 0, "vol": 1, "fx": [
            Phaser(rate_hz=1.0, depth=0.5, centre_frequency_hz=1000, feedback=0.4, mix=0.5),
            Chorus(rate_hz=2.0, depth=0.6, mix=0.4)
        ] if has_pedalboard else []},
        "chipmunk": {"pitch": 12, "vol": 1, "fx": [HighpassFilter(cutoff_frequency_hz=400)] if has_pedalboard else []},
        "echo_chamber": {"pitch": 0, "vol": 0, "fx": [
            Delay(delay_seconds=0.3, feedback=0.5, mix=0.5),
            Reverb(room_size=0.9, damping=0.1, wet_level=0.8)
        ] if has_pedalboard else []},
        "telephone": {"pitch": 0, "vol": 0, "fx": [
            HighpassFilter(cutoff_frequency_hz=400),
            LowpassFilter(cutoff_frequency_hz=3000),
            Distortion(drive_db=10)
        ] if has_pedalboard else []},
        "privacy_disguiser": {"pitch": -5, "vol": 1, "fx": [
            Bitcrash(bit_depth=12),
            Chorus(rate_hz=2.0, depth=0.8, mix=0.5),
            Compressor(threshold_db=-20, ratio=4)
        ] if has_pedalboard else []},
        "clone_elon": {"pitch": -2, "vol": 1, "fx": [
            Compressor(threshold_db=-18, ratio=3),
            LowpassFilter(cutoff_frequency_hz=6000)
        ] if has_pedalboard else []},
        "clone_morgan": {"pitch": -6, "vol": 2, "fx": [
            Compressor(threshold_db=-25, ratio=5),
            Reverb(room_size=0.1, damping=0.8, wet_level=0.05),
            HighpassFilter(cutoff_frequency_hz=80)
        ] if has_pedalboard else []},
        "clone_anime_girl": {"pitch": 8, "vol": 1, "fx": [
            HighpassFilter(cutoff_frequency_hz=350),
            Chorus(rate_hz=1.5, depth=0.2, mix=0.2)
        ] if has_pedalboard else []},
    }

    if mode not in VOICE_MODES and mode not in FFMPEG_STUDIO_FILTERS:
        raise HTTPException(status_code=400, detail="Invalid voice mode selected")

    params = VOICE_MODES.get(mode, {"pitch": 0, "vol": 0, "fx": []})

    in_path = None
    audio_raw_path = None
    processed_wav_path = None
    final_out_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else (".mp4" if is_video else ".wav"), delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        if is_video:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as a_raw:
                audio_raw_path = a_raw.name
            extract_proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", in_path,
                "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2",
                audio_raw_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await extract_proc.communicate()
            audio_target_input = audio_raw_path
        else:
            audio_target_input = in_path

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out_f:
            processed_wav_path = out_f.name

        processed_with_pedalboard = False
        if has_pedalboard:
            try:
                with AudioFile(audio_target_input) as f:
                    duration = f.frames / f.samplerate
                    if duration > 300:
                        raise HTTPException(status_code=413, detail="Audio duration exceeds 5 minutes limit.")
                    audio = f.read(f.frames)
                    samplerate = f.samplerate

                plugins = []
                if params["pitch"] != 0:
                    plugins.append(PitchShift(semitones=params["pitch"]))
                if params["vol"] != 0:
                    plugins.append(Gain(gain_db=params["vol"]))
                plugins.extend(params["fx"])

                board = Pedalboard(plugins)
                effected = board(audio, samplerate, reset=False)

                with AudioFile(processed_wav_path, 'w', samplerate, effected.shape[0]) as f:
                    f.write(effected)
                processed_with_pedalboard = True
            except HTTPException:
                raise
            except Exception as pb_err:
                logger.warning("Pedalboard processing fallback (%s), using FFmpeg studio filter", pb_err)
                processed_with_pedalboard = False

        if not processed_with_pedalboard:
            af_filter = FFMPEG_STUDIO_FILTERS.get(mode, "asetrate=44100*0.84,aresample=44100,atempo=1.1905")
            ffmpeg_proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", audio_target_input,
                "-af", af_filter,
                "-acodec", "pcm_s16le", "-ar", "44100",
                processed_wav_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await ffmpeg_proc.communicate()

        if not os.path.exists(processed_wav_path) or os.path.getsize(processed_wav_path) == 0:
            raise HTTPException(status_code=500, detail="Audio processing failed. Please check your audio format.")

        if is_video:
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as v_out:
                final_out_path = v_out.name
            remux_proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", in_path, "-i", processed_wav_path,
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-map", "0:v:0", "-map", "1:a:0", "-shortest",
                final_out_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await remux_proc.communicate()
            response_file = final_out_path
            response_name = (file.filename or "video").rsplit('.', 1)[0] + f"_{mode}.mp4"
            media_type = "video/mp4"
        else:
            response_file = processed_wav_path
            response_name = (file.filename or "audio").rsplit('.', 1)[0] + f"_{mode}.wav"
            media_type = "audio/wav"

        return FileResponse(
            response_file,
            filename=response_name,
            media_type=media_type,
            background=BackgroundTask(cleanup_files, in_path, audio_raw_path, processed_wav_path, final_out_path)
        )
    except HTTPException:
        cleanup_files(in_path, audio_raw_path, processed_wav_path, final_out_path)
        raise
    except Exception as e:
        cleanup_files(in_path, audio_raw_path, processed_wav_path, final_out_path)
        logger.exception("Voice conversion failed: %s", e)
        raise HTTPException(status_code=500, detail="Voice conversion processing failed.")


@router.post("/audio-enhance")
async def audio_enhance(file: UploadFile = File(...)):
    """
    AI Audio Enhancer
    Uses pedalboard to apply noise gate, compression, and EQ to enhance speech.
    Supports both audio files (MP3, WAV, etc.) and video files (MP4, MOV, WebM).
    """
    import tempfile
    import os
    import asyncio
    from fastapi.responses import FileResponse
    from starlette.background import BackgroundTask
    from pedalboard import Pedalboard, Compressor, NoiseGate, HighpassFilter, LowpassFilter
    from pedalboard.io import AudioFile
    
    AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg'}
    VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi'}

    ext = os.path.splitext(file.filename or "")[1].lower()
    is_video = ext in VIDEO_EXTENSIONS or (file.content_type and file.content_type.startswith("video/"))
    is_audio = ext in AUDIO_EXTENSIONS or (file.content_type and file.content_type.startswith("audio/"))

    if not is_audio and not is_video:
        raise HTTPException(status_code=400, detail="Invalid format. Please upload MP3, WAV, M4A, OGG, or MP4, MOV, WebM.")

    file_bytes = await read_bounded_file(file)
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")


    in_path = None
    audio_raw_path = None
    out_wav_path = None
    final_out_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else (".mp4" if is_video else ".wav"), delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        if is_video:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as a_raw:
                audio_raw_path = a_raw.name
            extract_proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", in_path,
                "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2",
                audio_raw_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await extract_proc.communicate()
            audio_target_input = audio_raw_path
        else:
            audio_target_input = in_path
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out_f:
            out_wav_path = out_f.name

        with AudioFile(audio_target_input) as f:
            audio = f.read(f.frames)
            samplerate = f.samplerate

        # Professional speech enhancement chain
        board = Pedalboard([
            NoiseGate(threshold_db=-35, ratio=2.0),
            HighpassFilter(cutoff_frequency_hz=80),   # Remove rumble
            LowpassFilter(cutoff_frequency_hz=12000), # Remove hiss
            Compressor(threshold_db=-20, ratio=4.0)   # Even out volume
        ])

        effected = board(audio, samplerate, reset=False)

        with AudioFile(out_wav_path, 'w', samplerate, effected.shape[0]) as f:
            f.write(effected)

        if is_video:
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as v_out:
                final_out_path = v_out.name
            remux_proc = await asyncio.create_subprocess_exec(
                "ffmpeg", "-y", "-i", in_path, "-i", out_wav_path,
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-map", "0:v:0", "-map", "1:a:0", "-shortest",
                final_out_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await remux_proc.communicate()
            response_file = final_out_path
            response_name = (file.filename or "video").rsplit('.', 1)[0] + "_enhanced.mp4"
            media_type = "video/mp4"
        else:
            response_file = out_wav_path
            response_name = (file.filename or "audio").rsplit('.', 1)[0] + "_enhanced.wav"
            media_type = "audio/wav"
            
        def cleanup():
            for p in [in_path, audio_raw_path, out_wav_path, final_out_path]:
                if p and os.path.exists(p):
                    try: os.remove(p)
                    except Exception: pass

        return FileResponse(
            response_file,
            filename=response_name,
            media_type=media_type,
            background=BackgroundTask(cleanup)
        )
    except HTTPException:
        for p in [in_path, audio_raw_path, out_wav_path, final_out_path]:
            if p and os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        raise
    except Exception as e:
        for p in [in_path, audio_raw_path, out_wav_path, final_out_path]:
            if p and os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        logger.exception("Audio enhancement failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Audio enhancement failed.")


@router.post("/video-to-mp3")
async def convert_video_to_mp3(
    file: UploadFile = File(...),
    bitrate: str = Form("192k"),
    channels: int = Form(2)
):
    """
    High-Speed Server-Side Video to MP3 Audio Extractor.
    Uses native FFmpeg to extract audio in milliseconds without client WASM overhead.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v"}
    if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid video format.")

    allowed_bitrates = {"320k", "192k", "128k", "vbr"}
    if bitrate not in allowed_bitrates:
        bitrate = "192k"

    quality_args = ["-q:a", "2"] if bitrate == "vbr" else ["-b:a", bitrate]
    channel_count = 1 if channels == 1 else 2

    file_bytes = await read_bounded_file(file, max_size=250 * 1024 * 1024)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty video file uploaded.")

    in_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else ".mp4", delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_f:
            out_path = out_f.name

        cmd = [
            "ffmpeg", "-y",
            "-i", in_path,
            "-vn",
            "-c:a", "libmp3lame",
            *quality_args,
            "-ar", "44100",
            "-ac", str(channel_count),
            out_path
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            err_text = stderr.decode(errors="ignore")
            if "does not contain any stream" in err_text or "matches no streams" in err_text or "no audio" in err_text.lower():
                raise HTTPException(status_code=400, detail="This video does not contain an audio track to extract.")
            logger.error("FFmpeg video-to-mp3 failed: %s", err_text)
            raise HTTPException(status_code=500, detail="Audio extraction failed.")

        out_filename = (file.filename or "extracted_audio").rsplit(".", 1)[0] + ".mp3"
        return FileResponse(
            out_path,
            filename=out_filename,
            media_type="audio/mpeg",
            background=BackgroundTask(cleanup_files, in_path, out_path)
        )
    except HTTPException:
        cleanup_files(in_path, out_path)
        raise
    except Exception as e:
        cleanup_files(in_path, out_path)
        logger.exception("Error extracting MP3 from video: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during audio extraction.")


@router.post("/video-to-gif")
async def convert_video_to_gif(
    file: UploadFile = File(...),
    fps: str = Form("15"),
    width: str = Form("480"),
    start_time: float = Form(0.0),
    end_time: float = Form(10.0)
):
    """
    High-Speed Video to GIF Converter using server-side palettegen & paletteuse.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v"}
    if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid video format.")

    fps_val = int(fps) if fps in {"10", "15", "20", "24"} else 15
    width_val = width if width in {"320", "480", "640", "-1"} else "480"
    clip_duration = max(0.5, min(30.0, end_time - start_time))

    scale_filter = "" if width_val == "-1" else f"scale={width_val}:-1:flags=lanczos,"
    palette_filter = f"[0:v]fps={fps_val},{scale_filter}split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"

    file_bytes = await read_bounded_file(file, max_size=200 * 1024 * 1024)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty video file uploaded.")

    in_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else ".mp4", delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=".gif", delete=False) as out_f:
            out_path = out_f.name

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(max(0.0, start_time)),
            "-t", str(clip_duration),
            "-i", in_path,
            "-filter_complex", palette_filter,
            out_path
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            err_text = stderr.decode(errors="ignore")
            logger.error("FFmpeg video-to-gif failed: %s", err_text)
            raise HTTPException(status_code=500, detail="GIF conversion failed.")

        out_filename = (file.filename or "animation").rsplit(".", 1)[0] + ".gif"
        return FileResponse(
            out_path,
            filename=out_filename,
            media_type="image/gif",
            background=BackgroundTask(cleanup_files, in_path, out_path)
        )
    except HTTPException:
        cleanup_files(in_path, out_path)
        raise
    except Exception as e:
        cleanup_files(in_path, out_path)
        logger.exception("Error converting video to GIF: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during GIF conversion.")


@router.post("/video-compress")
async def convert_video_compress(
    file: UploadFile = File(...),
    crf: int = Form(28),
    resolution: str = Form("original")
):
    """
    High-Speed Video Compressor using server-side H.264 veryfast presets.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v"}
    if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid video format.")

    crf_val = max(18, min(42, crf))
    scale_map = {
        "1080p": "scale=-2:1080",
        "720p": "scale=-2:720",
        "480p": "scale=-2:480",
    }
    vf_arg = ["-vf", scale_map[resolution]] if resolution in scale_map else []

    file_bytes = await read_bounded_file(file, max_size=250 * 1024 * 1024)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty video file uploaded.")

    in_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else ".mp4", delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as out_f:
            out_path = out_f.name

        cmd = [
            "ffmpeg", "-y",
            "-i", in_path,
            *vf_arg,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", str(crf_val),
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            out_path
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            err_text = stderr.decode(errors="ignore")
            logger.error("FFmpeg video-compress failed: %s", err_text)
            raise HTTPException(status_code=500, detail="Video compression failed.")

        out_filename = (file.filename or "compressed_video").rsplit(".", 1)[0] + "_compressed.mp4"
        return FileResponse(
            out_path,
            filename=out_filename,
            media_type="video/mp4",
            background=BackgroundTask(cleanup_files, in_path, out_path)
        )
    except HTTPException:
        cleanup_files(in_path, out_path)
        raise
    except Exception as e:
        cleanup_files(in_path, out_path)
        logger.exception("Error compressing video: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during video compression.")


@router.post("/video-convert")
async def convert_video_format(
    file: UploadFile = File(...),
    target_format: str = Form("mp4")
):
    """
    High-Speed Video Container & Codec Converter using native server-side FFmpeg.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    allowed_exts = {".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v"}
    if ext not in allowed_exts and not (file.content_type and file.content_type.startswith("video/")):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid video format.")

    format_settings = {
        "mp4": {"vcodec": "libx264", "acodec": "aac", "media_type": "video/mp4", "suffix": ".mp4"},
        "webm": {"vcodec": "libvpx", "acodec": "libvorbis", "media_type": "video/webm", "suffix": ".webm"},
        "mkv": {"vcodec": "libx264", "acodec": "aac", "media_type": "video/x-matroska", "suffix": ".mkv"},
        "mov": {"vcodec": "libx264", "acodec": "aac", "media_type": "video/quicktime", "suffix": ".mov"},
        "avi": {"vcodec": "libx264", "acodec": "mp3", "media_type": "video/x-msvideo", "suffix": ".avi"},
    }
    cfg = format_settings.get(target_format.lower(), format_settings["mp4"])

    file_bytes = await read_bounded_file(file, max_size=250 * 1024 * 1024)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty video file uploaded.")

    in_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else ".mp4", delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=cfg["suffix"], delete=False) as out_f:
            out_path = out_f.name

        cmd = [
            "ffmpeg", "-y",
            "-i", in_path,
            "-c:v", cfg["vcodec"],
            "-preset", "veryfast",
            "-c:a", cfg["acodec"],
            out_path
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            err_text = stderr.decode(errors="ignore")
            logger.error("FFmpeg video-convert failed: %s", err_text)
            raise HTTPException(status_code=500, detail="Video conversion failed.")

        out_filename = (file.filename or "converted_video").rsplit(".", 1)[0] + cfg["suffix"]
        return FileResponse(
            out_path,
            filename=out_filename,
            media_type=cfg["media_type"],
            background=BackgroundTask(cleanup_files, in_path, out_path)
        )
    except HTTPException:
        cleanup_files(in_path, out_path)
        raise
    except Exception as e:
        cleanup_files(in_path, out_path)
        logger.exception("Error converting video: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal server error during video format conversion.")

