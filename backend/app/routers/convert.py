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

@router.post("/text-to-speech")
async def text_to_speech(
    request: Request
):
    """
    Advanced Free AI Text-To-Speech (Edge TTS).
    Generates high-definition neural voiceovers (Deep Podcast, Narrator, Clean Child, etc.)
    with zero robotic artifacts.
    """
    import tempfile
    import os
    import edge_tts
    import httpx
    from starlette.background import BackgroundTask

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

    # Pre-sync clock skew to guarantee 100% reliable websocket handshake
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.head("https://www.bing.com")
            s_date = resp.headers.get("date")
            if s_date:
                parsed = edge_tts.drm.DRM.parse_rfc2616_date(s_date)
                c_time = edge_tts.drm.DRM.get_unix_timestamp()
                edge_tts.drm.DRM.adj_clock_skew_seconds(parsed - c_time)
    except Exception:
        pass

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_f:
        out_path = out_f.name

    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(out_path)

        if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
            raise Exception("Generated audio file is empty.")

        def cleanup():
            if os.path.exists(out_path):
                try: os.remove(out_path)
                except Exception: pass

        safe_v_name = voice.split('-')[-1].replace('Neural', '')
        return FileResponse(
            out_path,
            filename=f"botock_voiceover_{safe_v_name}.mp3",
            media_type="audio/mpeg",
            background=BackgroundTask(cleanup)
        )
    except Exception as e:
        if os.path.exists(out_path):
            try: os.remove(out_path)
            except Exception: pass
        logger.exception("Text-to-speech generation failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to synthesize speech. Please try again.")

@router.post("/voice-changer")
async def voice_changer(
    file: UploadFile = File(...),
    mode: str = Form(...),
):
    import tempfile
    import os
    import asyncio
    from starlette.background import BackgroundTask
    
    AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg'}
    VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.mkv', '.avi'}
    
    ext = os.path.splitext(file.filename or "")[1].lower()
    is_video = ext in VIDEO_EXTENSIONS or (file.content_type and file.content_type.startswith("video/"))
    is_audio = ext in AUDIO_EXTENSIONS or (file.content_type and file.content_type.startswith("audio/"))

    if not is_audio and not is_video:
        raise HTTPException(status_code=400, detail="Invalid format. Please upload MP3, WAV, M4A, OGG, or MP4, MOV, WebM.")

    MAX_FILE_SIZE = 60 * 1024 * 1024 if is_video else 20 * 1024 * 1024
    
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.")
        
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        from pedalboard import Pedalboard, PitchShift, Gain, Reverb, Compressor, HighpassFilter, LowpassFilter, Delay, Chorus, Bitcrash, Phaser, Distortion
        from pedalboard.io import AudioFile
    except ImportError:
        logger.error("Audio libraries not installed (pedalboard).")
        raise HTTPException(status_code=503, detail="Voice changer service is temporarily unavailable.")

    # High-quality natural voice modes
    VOICE_MODES = {
        # Standard
        "kid": {"pitch": 5, "vol": 1, "fx": []},
        "little_girl": {"pitch": 7, "vol": 1, "fx": [HighpassFilter(cutoff_frequency_hz=300)]},
        "man_deep": {"pitch": -4, "vol": 2, "fx": [Compressor(threshold_db=-20, ratio=2)]},
        "deep_villain": {"pitch": -8, "vol": 3, "fx": [
            Compressor(threshold_db=-20, ratio=4),
            Reverb(room_size=0.3, damping=0.5, wet_level=0.15)
        ]},
        "man_old": {"pitch": -2, "vol": 0, "fx": [
            LowpassFilter(cutoff_frequency_hz=3000),
            Compressor(threshold_db=-15, ratio=1.5)
        ]},
        "women": {"pitch": 3, "vol": 0, "fx": []},
        "old_women": {"pitch": 1, "vol": 0, "fx": [LowpassFilter(cutoff_frequency_hz=4000)]},
        "weak_man": {"pitch": 1, "vol": -4, "fx": [
            HighpassFilter(cutoff_frequency_hz=200),
            LowpassFilter(cutoff_frequency_hz=5000)
        ]},
        "strict": {"pitch": -1, "vol": 2, "fx": [Compressor(threshold_db=-15, ratio=3)]},
        
        # AI Voice Filters (Requested)
        "robot": {"pitch": 0, "vol": 0, "fx": [
            Chorus(rate_hz=50.0, depth=0.5, centre_delay_ms=2.0, feedback=0.5, mix=1.0),
            Bitcrash(bit_depth=8)
        ]},
        "chipmunk": {"pitch": 12, "vol": 1, "fx": [HighpassFilter(cutoff_frequency_hz=400)]},
        "echo_chamber": {"pitch": 0, "vol": 0, "fx": [
            Delay(delay_seconds=0.3, feedback=0.5, mix=0.5),
            Reverb(room_size=0.9, damping=0.1, wet_level=0.8)
        ]},
        "telephone": {"pitch": 0, "vol": 0, "fx": [
            HighpassFilter(cutoff_frequency_hz=400),
            LowpassFilter(cutoff_frequency_hz=3000),
            Distortion(drive_db=10)
        ]},
        
        # Voice Disguiser / Privacy Filter (Requested)
        "privacy_disguiser": {"pitch": -5, "vol": 1, "fx": [
            Bitcrash(bit_depth=12),
            Chorus(rate_hz=2.0, depth=0.8, mix=0.5),
            Compressor(threshold_db=-20, ratio=4)
        ]},
        
        # AI Speech-to-Speech / Voice Cloning (Mocked as filters for this implementation)
        "clone_elon": {"pitch": -2, "vol": 1, "fx": [
            Compressor(threshold_db=-18, ratio=3),
            LowpassFilter(cutoff_frequency_hz=6000)
        ]},
        "clone_morgan": {"pitch": -6, "vol": 2, "fx": [
            Compressor(threshold_db=-25, ratio=5),
            Reverb(room_size=0.1, damping=0.8, wet_level=0.05),
            HighpassFilter(cutoff_frequency_hz=80)
        ]},
        "clone_anime_girl": {"pitch": 8, "vol": 1, "fx": [
            HighpassFilter(cutoff_frequency_hz=350),
            Chorus(rate_hz=1.5, depth=0.2, mix=0.2)
        ]},
    }

    if mode not in VOICE_MODES:
        raise HTTPException(status_code=400, detail="Invalid voice mode selected")

    params = VOICE_MODES[mode]
    
    in_path = None
    audio_raw_path = None
    processed_wav_path = None
    final_out_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=ext if ext else (".mp4" if is_video else ".wav"), delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        if is_video:
            # Extract audio to wav first
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

        # Read with pedalboard io
        try:
            with AudioFile(audio_target_input) as f:
                duration = f.frames / f.samplerate
                if duration > 300: # 5 min limit
                    raise HTTPException(status_code=413, detail="Audio duration exceeds 5 minutes limit.")
                audio = f.read(f.frames)
                samplerate = f.samplerate
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to read audio file: {e}")
            raise HTTPException(status_code=400, detail="Corrupt or unreadable audio stream.")

        # Build pedalboard
        plugins = [PitchShift(semitones=params["pitch"])]
        if params["vol"] != 0:
            plugins.append(Gain(gain_db=params["vol"]))
        plugins.extend(params["fx"])
        board = Pedalboard(plugins)

        # Process audio
        effected = board(audio, samplerate, reset=False)

        # Write to wav
        with AudioFile(processed_wav_path, 'w', samplerate, effected.shape[0]) as f:
            f.write(effected)

        if is_video:
            # Remux audio into original video
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

        def cleanup():
            for p in [in_path, audio_raw_path, processed_wav_path, final_out_path]:
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
        for p in [in_path, audio_raw_path, processed_wav_path, final_out_path]:
            if p and os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        raise
    except Exception as e:
        for p in [in_path, audio_raw_path, processed_wav_path, final_out_path]:
            if p and os.path.exists(p):
                try: os.remove(p)
                except Exception: pass
        logger.exception("Voice conversion failed")
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
