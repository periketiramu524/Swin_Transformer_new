# CliniFusionX: NIH ChestX-ray14 Swin Multimodal Clinical Report Generator

## Overview
CliniFusionX is a complete, multimodal AI-assisted clinical decision-support tool. It integrates an advanced Vision Transformer (Swin Transformer) trained on the NIH ChestX-ray14 dataset with a Large Language Model (Google Gemini) for extracting clinical text and fusing it into a cohesive diagnostic report.

## Architecture
The application is structured into a unified FastAPI backend that serves a highly responsive vanilla HTML/CSS/JS frontend dashboard. 

1. **Chest X-ray Analysis:** The Swin Transformer processes the image to identify 15 lung pathologies using validation-optimized per-class thresholds.
2. **Clinical Extraction:** The LLM extracts structured clinical data from user-provided notes or PDF clinical reports.
3. **Multimodal Fusion:** Findings from the X-ray are fused with the patient's clinical history to generate AI reasoning and clinical correlation.
4. **Explainability:** Grad-CAM (using Transformer-compatible EigenCAM on the target normalization layer) generates interpretable attention maps overlaid on the original X-ray.

## Features
- **15 Disease Classes:** Predicts Atelectasis, Cardiomegaly, Consolidation, Edema, Effusion, Emphysema, Fibrosis, Hernia, Infiltration, Mass, No Finding, Nodule, Pleural Thickening, Pneumonia, and Pneumothorax.
- **Multi-label Classification:** Supports multiple concurrent findings.
- **Per-class Thresholds:** Utilizes strict optimized thresholds, not a generic 0.5.
- **Swin Transformer Core:** Automatically falls back to CPU if CUDA is unavailable. The 105MB checkpoint is loaded *once* at startup.
- **Professional Dashboard:** Glassmorphism, dynamic animations, and responsive layout built for clinical utility.

## Model Performance
The Swin Transformer achieved the following performance on the NIH ChestX-ray14 dataset:
- Validation Macro AUROC: 0.8280
- Validation Micro AUROC: 0.8956
- Test Macro AUROC: 0.8250
- Test Micro AUROC: 0.8950

*(Note: AUROC is an evaluation of the model's ability to distinguish between classes, not an absolute accuracy metric.)*

## Installation & Configuration

### Prerequisites
- Python 3.10+
- Docker & Docker Compose (optional)
- A Google Gemini API Key

### Configuration
1. Clone or download the repository.
2. Ensure the required `.pth` and `.json` model files exist in the root directory.
3. Set your LLM API Key in your environment:
   ```bash
   export LLM_API_KEY="your-gemini-api-key"
   ```

### Running Locally (Python)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
3. Open `http://localhost:8000` in your browser.

### Running with Docker
1. Provide the API key via environment variable:
   ```bash
   LLM_API_KEY="your-gemini-api-key" docker-compose up --build
   ```

## Limitations & Medical Disclaimer
**This system is an AI-assisted clinical decision-support tool and does not replace evaluation or diagnosis by a qualified healthcare professional.** The LLM models may occasionally hallucinate or output inaccurate text; however, strict prompting is employed to minimize these occurrences and clearly delineate AI-generated findings from established medical facts.
