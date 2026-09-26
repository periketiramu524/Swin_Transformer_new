# -*- coding: utf-8 -*-
"""
Clinical Consistency Module (CCM)
=================================
A rule-based post-prediction module that checks whether a patient's reported
symptoms are consistent with the Swin Transformer's predicted thoracic findings.

It does NOT alter model predictions. It provides an evidence label:
  - Supportive        (score >= 0.6)
  - Partially Supportive (0.3 <= score < 0.6)
  - Insufficient      (score > 0 but < 0.3, or no symptoms reported)
  - Conflicting        (score == 0 and symptoms were reported)

References: Harrison's Principles of Internal Medicine, Mayo Clinic,
            WHO clinical guidelines, Radiopaedia.
"""

# ─── Disease → Expected Symptoms Knowledge Base ──────────────────────────────
# Each key is a disease label (matching labels.json / ChestX-ray14).
# Each value is a set of canonical symptom strings (lowercased).

DISEASE_SYMPTOM_KB: dict[str, set[str]] = {
    "Atelectasis": {
        "shortness of breath", "cough", "chest pain", "fever",
    },
    "Cardiomegaly": {
        "shortness of breath", "fatigue", "chest pain", "wheezing",
    },
    "Consolidation": {
        "cough", "fever", "shortness of breath", "chest pain", "fatigue",
    },
    "Edema": {
        "shortness of breath", "cough", "fatigue", "chest pain", "wheezing",
    },
    "Effusion": {
        "shortness of breath", "chest pain", "cough", "fatigue",
    },
    "Emphysema": {
        "shortness of breath", "wheezing", "cough", "fatigue", "chest pain",
    },
    "Fibrosis": {
        "shortness of breath", "cough", "fatigue", "chest pain",
    },
    "Hernia": {
        "chest pain", "shortness of breath", "fatigue",
    },
    "Infiltration": {
        "cough", "fever", "shortness of breath", "chest pain", "fatigue",
    },
    "Mass": {
        "cough", "chest pain", "weight loss", "fatigue", "shortness of breath",
    },
    "No Finding": set(),  # No symptoms expected
    "Nodule": {
        "cough", "chest pain", "weight loss", "fatigue",
    },
    "Pleural_Thickening": {
        "shortness of breath", "chest pain", "cough",
    },
    "Pneumonia": {
        "cough", "fever", "shortness of breath", "chest pain", "fatigue",
    },
    "Pneumothorax": {
        "chest pain", "shortness of breath", "fatigue",
    },
}


def normalize_symptom(symptom: str) -> str:
    """Normalize a symptom string for matching."""
    return symptom.strip().lower()


def compute_evidence(disease: str, reported_symptoms: list[str]) -> dict:
    """
    Compute the clinical consistency evidence for a single disease prediction.

    Parameters
    ----------
    disease : str
        The predicted disease label (must match a key in DISEASE_SYMPTOM_KB).
    reported_symptoms : list[str]
        List of symptom strings reported by the patient (from UI checkboxes).

    Returns
    -------
    dict with keys:
        - score      : float   (0.0 – 1.0)
        - label      : str     ("Supportive" | "Partially Supportive" | "Insufficient" | "Conflicting" | "N/A")
        - matched    : list[str]  symptoms that matched
        - expected   : list[str]  all expected symptoms for this disease
        - explanation: str        human-readable sentence
    """
    expected = DISEASE_SYMPTOM_KB.get(disease, set())

    # "No Finding" — no consistency check needed
    if not expected:
        return {
            "score": 1.0,
            "label": "N/A",
            "matched": [],
            "expected": [],
            "explanation": "No clinical symptoms are expected for this label.",
        }

    normalized_reported = {normalize_symptom(s) for s in reported_symptoms}

    matched = expected & normalized_reported
    score = len(matched) / len(expected) if len(expected) > 0 else 0.0

    # No symptoms were reported at all
    if len(normalized_reported) == 0:
        label = "Insufficient"
        explanation = (
            f"No symptoms were reported. Cannot assess clinical consistency for {disease}."
        )
    elif score >= 0.6:
        label = "Supportive"
        explanation = (
            f"Patient symptoms ({', '.join(sorted(matched))}) are consistent with {disease}. "
            f"Evidence score: {score:.0%}."
        )
    elif score >= 0.3:
        label = "Partially Supportive"
        explanation = (
            f"Some symptoms match {disease} ({', '.join(sorted(matched)) or 'none'}), "
            f"but key symptoms may be absent. Evidence score: {score:.0%}."
        )
    elif score > 0:
        label = "Insufficient"
        explanation = (
            f"Very few symptoms match {disease} ({', '.join(sorted(matched))}). "
            f"Clinical evidence is weak. Score: {score:.0%}."
        )
    else:
        label = "Conflicting"
        explanation = (
            f"None of the expected symptoms for {disease} "
            f"({', '.join(sorted(expected))}) were reported by the patient. "
            f"The imaging finding may warrant closer review."
        )

    return {
        "score": round(score, 4),
        "label": label,
        "matched": sorted(matched),
        "expected": sorted(expected),
        "explanation": explanation,
    }


def run_ccm(predictions: list[dict], reported_symptoms: list[str]) -> list[dict]:
    """
    Run the Clinical Consistency Module on the full set of model predictions.

    Parameters
    ----------
    predictions : list[dict]
        Each dict has at least {"disease": str, "probability": float, "detected": bool}.
    reported_symptoms : list[str]
        Patient-reported symptoms from the UI.

    Returns
    -------
    list[dict]
        The same predictions list, with an added "ccm" key on each item containing
        the evidence dict from compute_evidence().
    """
    enriched = []
    for pred in predictions:
        ccm_result = compute_evidence(pred["disease"], reported_symptoms)
        enriched.append({**pred, "ccm": ccm_result})
    return enriched
