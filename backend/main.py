import asyncio
import io
import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter
import pdfplumber
import pandas as pd

app = FastAPI(title="Botock Backend Tools API")

# Allow Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Botock Backend is running"}

@app.post("/api/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as in_f:
        in_f.write(await file.read())
        in_path = in_f.name
        
    out_path = in_path.replace(".pdf", ".docx")
    
    try:
        cv = Converter(in_path)
        cv.convert(out_path, start=0, end=None)
        cv.close()
        
        return FileResponse(
            out_path, 
            filename=file.filename.replace(".pdf", ".docx"),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            background=None # Ideally, we'd clean up temp files in a background task
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@app.post("/api/convert/pdf-to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        pdf_bytes = await file.read()
        output = io.BytesIO()
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf, \
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
                raise HTTPException(status_code=400, detail="No tables found in the PDF")
                
        output.seek(0)
        
        # Save to temp file for FileResponse
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as out_f:
            out_f.write(output.getvalue())
            out_path = out_f.name
            
        return FileResponse(
            out_path, 
            filename=file.filename.replace(".pdf", ".xlsx"),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@app.post("/api/convert/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.doc', '.docx')):
        raise HTTPException(status_code=400, detail="File must be a Word document")
    
    # Check if libreoffice is available
    if not shutil.which("libreoffice") and not shutil.which("soffice"):
        raise HTTPException(status_code=501, detail="LibreOffice is not installed on the server")
        
    soffice_cmd = "soffice" if shutil.which("soffice") else "libreoffice"
    
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as in_f:
        in_f.write(await file.read())
        in_path = in_f.name
        
    out_dir = tempfile.mkdtemp()
    
    try:
        proc = await asyncio.create_subprocess_exec(
            soffice_cmd, "--headless", "--convert-to", "pdf",
            "--outdir", out_dir, in_path
        )
        await proc.communicate()
        
        if proc.returncode != 0:
            raise Exception("LibreOffice conversion process failed")
            
        # Find the generated pdf
        out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".docx", ".pdf"))
        if not os.path.exists(out_path):
             out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".doc", ".pdf"))
             
        if not os.path.exists(out_path):
             raise Exception("Output PDF not found")
             
        return FileResponse(
            out_path, 
            filename=file.filename.rsplit('.', 1)[0] + ".pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@app.post("/api/convert/pdf-protect")
async def protect_pdf(file: UploadFile = File(...), password: str = Form(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        from PyPDF2 import PdfReader, PdfWriter
    except ImportError:
        try:
            from pypdf import PdfReader, PdfWriter
        except ImportError:
            raise HTTPException(status_code=500, detail="PDF library not installed in backend")

    try:
        pdf_bytes = await file.read()
        reader = PdfReader(io.BytesIO(pdf_bytes))
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)
        
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as out_f:
            out_f.write(output.getvalue())
            out_path = out_f.name
            
        return FileResponse(
            out_path, 
            filename=file.filename.replace(".pdf", "-protected.pdf"),
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")

from starlette.background import BackgroundTask

def combine_chunks(chunks, crossfade=10):
    if not chunks:
        return None
    if len(chunks) == 1:
        return chunks[0]
    mid = len(chunks) // 2
    left = combine_chunks(chunks[:mid], crossfade)
    right = combine_chunks(chunks[mid:], crossfade)
    if left is None: return right
    if right is None: return left
    return left.append(right, crossfade=crossfade)


from starlette.background import BackgroundTask
import numpy as np

@app.post("/api/convert/voice-changer")
async def voice_changer(file: UploadFile = File(...), mode: str = Form(...)):
    if not file.filename.lower().endswith(('.mp3', '.wav', '.m4a')):
        raise HTTPException(status_code=400, detail="File must be an audio file (.mp3, .wav, .m4a)")

    try:
        from pedalboard import Pedalboard, PitchShift, Gain, Reverb, Compressor, HighpassFilter, LowpassFilter
        from pedalboard.io import AudioFile
    except ImportError:
        raise HTTPException(status_code=500, detail="Advanced audio library (pedalboard) not installed on the server")

    # High-quality natural voice modes using pedalboard
    # pitch is in semitones (e.g. -12 is one octave down)
    VOICE_MODES = {
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
    }

    if mode not in VOICE_MODES:
        raise HTTPException(status_code=400, detail="Invalid voice mode selected")

    params = VOICE_MODES[mode]

    try:
        audio_bytes = await file.read()

        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(file.filename)[1], delete=False) as in_f:
            in_f.write(audio_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_f:
            out_path = out_f.name

        # Read with pedalboard io
        with AudioFile(in_path) as f:
            audio = f.read(f.frames)
            samplerate = f.samplerate

        # Build pedalboard
        plugins = [PitchShift(semitones=params["pitch"])]
        if params["vol"] != 0:
            plugins.append(Gain(gain_db=params["vol"]))

        plugins.extend(params["fx"])

        board = Pedalboard(plugins)

        # Process audio (highly optimized C++ under the hood)
        effected = board(audio, samplerate, reset=False)

        # Write back to mp3
        # pedalboard currently has limited mp3 export support in some builds, but let's try pydub for export if needed, or soundfile for wav.
        # Actually pedalboard.io uses libsndfile and libav, so it supports common formats if compiled with them.
        try:
            with AudioFile(out_path, 'w', samplerate, effected.shape[0]) as f:
                f.write(effected)
        except Exception:
            # Fallback to wav if mp3 export fails, or pydub
            import soundfile as sf
            wav_path = out_path.replace(".mp3", ".wav")
            sf.write(wav_path, effected.T, samplerate)

            from pydub import AudioSegment
            snd = AudioSegment.from_file(wav_path)
            snd.export(out_path, format="mp3")
            os.remove(wav_path)

        # Clean up input file
        try:
            os.remove(in_path)
        except Exception:
            pass

        def cleanup_out():
            try:
                os.remove(out_path)
            except Exception:
                pass

        return FileResponse(
            out_path,
            filename=file.filename.rsplit('.', 1)[0] + f"_{mode}.mp3",
            media_type="audio/mpeg",
            background=BackgroundTask(cleanup_out)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice conversion failed: {str(e)}")
