from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove

app = FastAPI()

# Next.js (Frontend) ko Python API se connect karne ki ijazat dene ke liye CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Development ke liye sab allowed hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test karne ke liye simple route
@app.get("/")
def read_root():
    return {"status": "success", "message": "Ameer bhai, aapka AI SaaS Backend Live Hai!"}

# Background Remover Route
@app.post("/api/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    try:
        # User ki image file ko read karna
        input_image_bytes = await file.read()
        
        # rembg se background remove karna
        output_image_bytes = remove(input_image_bytes)
        
        # Processed transparent PNG image ko wapis frontend bhej dena
        return Response(content=output_image_bytes, media_type="image/png")
    
    except Exception as e:
        return {"error": str(e)}
