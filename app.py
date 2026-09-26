import os
import io
import base64

# Load .env file manually
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                key, value = line.strip().split("=", 1)
                os.environ[key] = value.strip('"\'')

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from PIL import Image

# ML Modules
from inference import InferenceEngine
from explainability import Explainer
from clinical_extractor import ClinicalExtractor
from report_generator import ReportGenerator
from ccm import run_ccm

app = FastAPI(title="CliniFusionX API")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models once at startup
engine = None
explainer = None
clinical_extractor = None
report_generator = None

@app.on_event("startup")
def load_models():
    global engine, explainer, clinical_extractor, report_generator
    try:
        print("Loading Swin Transformer...")
        engine = InferenceEngine()
        explainer = Explainer(engine.model, engine.device)
        print("Loading LLM Modules...")
        clinical_extractor = ClinicalExtractor()
        report_generator = ReportGenerator()
        print("All models loaded successfully.")
    except Exception as e:
        print(f"Error during startup: {e}")

# Mount static files for the UI
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r") as f:
        return f.read()

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "model": "Swin Tiny Patch4 Window7 224",
        "checkpoint": "best_swin_chestxray14.pth",
        "classes": 15,
        "device": str(engine.device) if engine else "cpu",
        "loaded": engine is not None
    }

import json

@app.post("/api/analyze")
async def analyze_xray(
    image: UploadFile = File(...),
    clinical_text: str = Form(""),
    clinical_pdf: UploadFile = File(None),
    symptoms_json: str = Form("[]")
):
    try:
        # Load image
        img_bytes = await image.read()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # 1. Image Inference
        image_findings = engine.predict(pil_img)
        
        # 2. Extract PDF text locally
        from clinical_extractor import extract_text_from_pdf
        pdf_path = None
        pdf_text = ""
        if clinical_pdf and clinical_pdf.filename:
            pdf_path = f"temp_{clinical_pdf.filename}"
            with open(pdf_path, "wb") as f:
                f.write(await clinical_pdf.read())
            pdf_text = extract_text_from_pdf(pdf_path)
            os.remove(pdf_path)
            
        # Combine clinical text
        combined_clinical = clinical_text + f"\n{pdf_text}"
        
        # 3. Run Clinical Consistency Module (CCM)
        try:
            reported_symptoms = json.loads(symptoms_json)
        except (json.JSONDecodeError, TypeError):
            reported_symptoms = []
        
        enriched_findings = run_ccm(image_findings, reported_symptoms)
        
        # 4. Generate Single-Pass Report
        report = report_generator.generate_report(image_findings, combined_clinical)
        
        return {
            "findings": enriched_findings,
            "report": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExplainRequest(BaseModel):
    class_idx: int

@app.post("/api/explain")
async def explain_finding(
    class_idx: int = Form(...),
    image: UploadFile = File(...),
    cam_method: str = Form("gradcam")
):
    try:
        img_bytes = await image.read()
        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        input_tensor = engine.preprocess_image(pil_img).to(engine.device)
        
        heatmap_img = explainer.generate_heatmap(input_tensor, pil_img, class_idx, cam_method)
        
        # Convert numpy array back to image to send to frontend
        heatmap_pil = Image.fromarray(heatmap_img)
        buffered = io.BytesIO()
        heatmap_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"heatmap_base64": img_str}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
