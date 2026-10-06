import asyncio
import io
import os
import shutil
import tempfile
import logging
import pymupdf as fitz
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pdf2docx import Converter
import pdfplumber
import pandas as pd

router = APIRouter(prefix="/api/convert", tags=["Conversion & PDF Tools"])
logger = logging.getLogger(__name__)

@router.post("/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
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
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception:
        logger.exception("PDF-to-DOCX conversion failed")
        raise HTTPException(status_code=503, detail="The conversion service is temporarily unavailable. Please try again shortly.")
    finally:
        if os.path.exists(in_path):
            try:
                os.remove(in_path)
            except Exception:
                pass


@router.post("/pdf-to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
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
                raise HTTPException(status_code=400, detail="No tables found in the PDF. Please upload a PDF that contains tables.")
                
        output.seek(0)
        
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
            
        out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".docx", ".pdf"))
        if not os.path.exists(out_path):
            out_path = os.path.join(out_dir, os.path.basename(in_path).replace(".doc", ".pdf"))
             
        if not os.path.exists(out_path):
            raise Exception("Output PDF not found")
             
        return FileResponse(
            out_path, 
            filename=file.filename.rsplit(".", 1)[0] + ".pdf",
            media_type="application/pdf"
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Word-to-PDF conversion failed")
        raise HTTPException(status_code=503, detail="The conversion service is temporarily unavailable. Please try again shortly.")
    finally:
        if os.path.exists(in_path):
            try:
                os.remove(in_path)
            except Exception:
                pass


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
    
    try:
        pdf_bytes = await file.read()
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
            media_type="application/pdf"
        )
    except Exception:
        logger.exception("PDF protection failed")
        raise HTTPException(status_code=503, detail="The document service is temporarily unavailable. Please try again shortly.")

@router.post("/voice-changer")
async def voice_changer(
    file: UploadFile = File(...),
    mode: str = Form(...),
):
    import tempfile
    import os
    
    ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg'}
    ALLOWED_MIMES = {'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/ogg'}
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_MIMES:
        raise HTTPException(status_code=400, detail="Invalid audio format. Please upload MP3, WAV, M4A, or OGG.")

    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB limit
    
    # Read the file with size limit
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Audio file too large. Maximum size is 10MB.")
        
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        from pedalboard import Pedalboard, PitchShift, Gain, Reverb, Compressor, HighpassFilter, LowpassFilter
        from pedalboard.io import AudioFile
    except ImportError:
        logger.error("Audio libraries not installed (pedalboard).")
        raise HTTPException(status_code=503, detail="Voice changer service is temporarily unavailable.")

    # High-quality natural voice modes
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
    
    in_path = None
    out_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as in_f:
            in_f.write(file_bytes)
            in_path = in_f.name

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as out_f:
            out_path = out_f.name

        # Read with pedalboard io
        try:
            with AudioFile(in_path) as f:
                # Basic duration check - limit to 3 minutes
                duration = f.frames / f.samplerate
                if duration > 180:
                    raise HTTPException(status_code=413, detail="Audio duration exceeds 3 minutes limit.")
                
                audio = f.read(f.frames)
                samplerate = f.samplerate
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to read audio file: {e}")
            raise HTTPException(status_code=400, detail="Corrupt or unreadable audio file.")

        # Build pedalboard
        plugins = [PitchShift(semitones=params["pitch"])]
        if params["vol"] != 0:
            plugins.append(Gain(gain_db=params["vol"]))
        plugins.extend(params["fx"])
        board = Pedalboard(plugins)

        # Process audio
        effected = board(audio, samplerate, reset=False)

        # Write back to wav (more reliable than mp3 with pedalboard)
        with AudioFile(out_path, 'w', samplerate, effected.shape[0]) as f:
            f.write(effected)

        from starlette.background import BackgroundTask
        
        def cleanup():
            if in_path and os.path.exists(in_path):
                try: os.remove(in_path)
                except Exception: pass
            if out_path and os.path.exists(out_path):
                try: os.remove(out_path)
                except Exception: pass

        return FileResponse(
            out_path,
            filename=file.filename.rsplit('.', 1)[0] + f"_{mode}.wav",
            media_type="audio/wav",
            background=BackgroundTask(cleanup)
        )
    except HTTPException:
        if in_path and os.path.exists(in_path): os.remove(in_path)
        if out_path and os.path.exists(out_path): os.remove(out_path)
        raise
    except Exception as e:
        if in_path and os.path.exists(in_path): os.remove(in_path)
        if out_path and os.path.exists(out_path): os.remove(out_path)
        logger.exception("Voice conversion failed")
        raise HTTPException(status_code=500, detail="Voice conversion processing failed.")
