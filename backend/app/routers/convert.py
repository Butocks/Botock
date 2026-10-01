import asyncio
import io
import os
import shutil
import tempfile
import logging
import pymupdf as fitz
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pdf2docx import Converter
import pdfplumber
import pandas as pd

router = APIRouter(prefix="/api/convert", tags=["Conversion & PDF Tools"])
logger = logging.getLogger(__name__)

def remove_file_or_dir(path: str):
    """Utility to clean up a file or a directory structure."""
    if not os.path.exists(path):
        return
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
    except Exception as e:
        logger.error("Failed to clean up %s: %s", path, e)

@router.post("/pdf-to-docx")
async def convert_pdf_to_docx(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
        
        background_tasks.add_task(remove_file_or_dir, out_path)
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
            remove_file_or_dir(in_path)


@router.post("/pdf-to-excel")
async def convert_pdf_to_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
            
        background_tasks.add_task(remove_file_or_dir, out_path)
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
async def convert_docx_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
             
        background_tasks.add_task(remove_file_or_dir, out_dir)
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
            remove_file_or_dir(in_path)


@router.post("/pdf-protect")
async def protect_pdf(
    background_tasks: BackgroundTasks,
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
        
        background_tasks.add_task(remove_file_or_dir, out_path)
        return FileResponse(
            out_path,
            filename=file.filename.replace(".pdf", "-protected.pdf"),
            media_type="application/pdf"
        )
    except Exception:
        logger.exception("PDF protection failed")
        raise HTTPException(status_code=503, detail="The document service is temporarily unavailable. Please try again shortly.")
