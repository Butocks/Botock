import asyncio
import io
import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
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
