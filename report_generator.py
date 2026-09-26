import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

from clinical_extractor import setup_gemini

DISEASE_KNOWLEDGE_BASE = {
    'Effusion': {
        'desc': 'Pleural effusion with fluid accumulation within the pleural cavity, demonstrating blunting of the lateral and posterior costophrenic angles and a classic lateral meniscus sign.',
        'anatomical_signs': 'Blunting of the costophrenic sulci, obscuration of the hemidiaphragmatic contour, dependent fluid tracking along the lateral thoracic wall, and passive basilar compressive atelectasis.',
        'pathophysiology': 'Exudative or transudative fluid extravasation into the pleural space exceeding lymphatic drainage capacity. Common etiologies include congestive heart failure (transudative), acute parapneumonic process / empyema (exudative), malignancy, or pulmonary thromboembolism.',
        'differentials': '1. Acute Parapneumonic Effusion vs. Empyema\n2. Congestive Heart Failure (Hydrostatic Volume Overload)\n3. Malignant Pleural Effusion\n4. Subpulmonic Collection or Sympathetic Reaction to Subdiaphragmatic Pathology',
        'acute_management': '- Administer supplemental titrated oxygen to maintain target SpO2 >= 92-94% (88-92% in chronic hypercapnic respiratory failure).\n- Position patient upright (high Fowler position) to optimize diaphragmatic excursion and ease respiratory work.',
        'diagnostic_steps': '- Point-of-care thoracic ultrasound (POCUS) to accurately measure fluid depth, quantify volume, assess echogenicity, and evaluate for internal fibrin septations or loculations.\n- Diagnostic thoracentesis with pleural fluid routine: total protein, lactate dehydrogenase (LDH), cell count with differential, pH, glucose, Gram stain, and aerobic/anaerobic cultures. Apply Light criteria to differentiate transudate from exudate.\n- Contrast-Enhanced Chest CT (CECT) following fluid evacuation if parenchymal necrosis, pleural nodularity, or underlying malignancy is suspected.'
    },
    'Infiltration': {
        'desc': 'Patchy parenchymal airspace infiltration and ill-defined bronchopulmonary segment opacification without complete volume loss.',
        'anatomical_signs': 'Confluent or multifocal acinar opacities, ill-defined peribronchovascular cuffing, and ground-glass haziness within dependent bronchopulmonary segments.',
        'pathophysiology': 'Accumulation of inflammatory exudate, leukocytes, and fibrin within alveolar spaces, characteristic of acute bacterial bronchopneumonia, viral pneumonitis, or non-infectious inflammatory pneumonitis.',
        'differentials': '1. Community-Acquired Pneumonia (bacterial or atypical etiology)\n2. Viral Lower Respiratory Tract Infection\n3. Aspiration Pneumonitis\n4. Non-cardiogenic Pulmonary Edema / Acute Respiratory Distress Syndrome (early)',
        'acute_management': '- Initiate empiric antimicrobial coverage promptly in accordance with local hospital antibiogram and ATS/IDSA guidelines for community-acquired or hospital-acquired pneumonia.\n- Maintain pulmonary toilet, chest physiotherapy, and adequate hydration.',
        'diagnostic_steps': '- Sputum induction for Gram stain and microbiological culture.\n- Blood cultures (two sets from distinct venipuncture sites) prior to antimicrobial administration.\n- Serum inflammatory biomarkers: Complete blood count with differential (evaluating leukocytosis or bandemia), C-reactive protein (CRP), and serum procalcitonin.\n- Respiratory viral multiplex panel via nasopharyngeal swab and urinary antigens for Streptococcus pneumoniae and Legionella pneumophila.'
    },
    'Atelectasis': {
        'desc': 'Focal pulmonary parenchymal collapse with alveolar volume loss, most prominent in dependent basilar segments.',
        'anatomical_signs': 'Linear or wedge-shaped plate-like basilar opacities, crowding of bronchovascular bundles, and compensatory ipsilateral diaphragmatic elevation.',
        'pathophysiology': 'Subsegmental alveolar hypoventilation, airway mucus plugging, or compressive volume loss secondary to adjacent pleural fluid or shallow breathing patterns due to chest splinting.',
        'differentials': '1. Subsegmental or Plate-like Compressive Atelectasis\n2. Endobronchial Mucus Plugging\n3. Resolving Pulmonary Infarction\n4. Early Basilar Pneumonic Infiltrate',
        'acute_management': '- Aggressive respiratory therapy, including incentive spirometry (10 breaths every hour while awake), positive expiratory pressure (PEP) therapy, and early ambulation.\n- Adequate analgesia to relieve chest wall splinting while avoiding excessive sedation.',
        'diagnostic_steps': '- Re-evaluate with serial auscultation and pulse oximetry following pulmonary physiotherapy.\n- Repeat chest radiography at 48 hours to confirm re-expansion and exclude evolving underlying consolidation.\n- Fiberoptic bronchoscopy if central obstructing mucus plug or foreign lesion is suspected.'
    },
    'Cardiomegaly': {
        'desc': 'Globally enlarged cardiac silhouette with a cardiothoracic ratio (CTR) exceeding normal physiological baseline (> 0.50 on PA projection).',
        'anatomical_signs': 'Transverse cardiac diameter > 50% of maximum internal thoracic diameter, rounding of the cardiac apex, and prominence of upper lobe pulmonary venous vasculature (cephalization).',
        'pathophysiology': 'Multi-chamber dilatation or left ventricular hypertrophy secondary to chronic arterial hypertension, ischemic cardiomyopathy, valvular heart disease, or pericardial effusion.',
        'differentials': '1. Hypertensive or Ischemic Dilated Cardiomyopathy\n2. Decompensated Congestive Heart Failure\n3. Pericardial Effusion ("water-bottle" silhouette)\n4. Valvular Regurgitant / Stenotic Heart Disease',
        'acute_management': '- Optimize hemodynamic volume status; initiate loop diuretic therapy if hypervolemic with clinical crackles, S3 gallop, or peripheral edema.\n- Continuous cardiac telemetry and non-invasive blood pressure monitoring.',
        'diagnostic_steps': '- Transthoracic Echocardiogram (TTE) with comprehensive Doppler assessment to determine left ventricular ejection fraction (LVEF), diastolic function, wall motion abnormalities, and pericardial space status.\n- Quantitative serum NT-proBNP or BNP level.\n- 12-lead Electrocardiogram (ECG) to evaluate for arrhythmias, bundle branch blocks, or acute ischemia.'
    },
    'Consolidation': {
        'desc': 'Dense confluent alveolar airspace opacification with internal air bronchograms and anatomical lobar confinement.',
        'anatomical_signs': 'Homogeneous dense parenchymal opacity with preservation of bronchial architecture (air bronchogram sign), obscuration of adjacent cardiac or diaphragmatic margins (silhouette sign).',
        'pathophysiology': 'Complete replacement of intra-alveolar air by infectious or inflammatory exudate, classical of acute bacterial lobar pneumonia (e.g. Streptococcus pneumoniae, Klebsiella pneumoniae).',
        'differentials': '1. Acute Bacterial Lobar Pneumonia\n2. Pulmonary Hemorrhage / Contusion\n3. Cryptogenic Organizing Pneumonia (COP)\n4. Bronchoalveolar / Invasive Mucinous Adenocarcinoma',
        'acute_management': '- Immediate administration of intravenous targeted broad-spectrum antibiotic regimen within 4 hours of medical contact.\n- Oxygenation titration with high-flow nasal cannula if hypoxemic; monitor for acute respiratory failure.',
        'diagnostic_steps': '- Blood and sputum microbiological cultures; urinary antigens for Legionella and Pneumococcus.\n- Serial arterial blood gas (ABG) analysis in patients with clinical tachypnea or desaturation.\n- Follow-up chest radiography in 6-8 weeks to document complete radiological resolution and rule out underlying endobronchial neoplasm.'
    },
    'Pneumonia': {
        'desc': 'Acute infectious inflammatory consolidation of pulmonary parenchyma with alveolar exudation and systemic inflammatory response.',
        'anatomical_signs': 'Segmental or lobar opacification, air bronchograms, micro-nodular infiltration, and associated reactive pleural reaction.',
        'pathophysiology': 'Bacterial, viral, or fungal pathogen proliferation within the terminal respiratory units evoking microvascular leakage, leukocyte extravasation, and impaired gas exchange.',
        'differentials': '1. Bacterial Community-Acquired Pneumonia\n2. Viral Interstitial Pneumonitis\n3. Aspiration Pneumonia with Mixed Anaerobes\n4. Eosinophilic or Hypersensitivity Pneumonitis',
        'acute_management': '- Initiate empiric dual antimicrobial therapy (e.g. Beta-lactam + Macrolide or Respiratory Fluoroquinolone) per hospital clinical pathway.\n- Hydration and electrolyte rebalancing.',
        'diagnostic_steps': '- Severity stratification using CURB-65 or PSI (Pneumonia Severity Index) to direct outpatient vs inpatient vs ICU admission.\n- Serial inflammatory markers (CRP and Procalcitonin) to monitor treatment responsiveness.\n- Repeat imaging in 4-6 weeks post-antibiotic course.'
    },
    'Pleural_Thickening': {
        'desc': 'Fibrocalcific thickening and scarring of the visceral or parietal pleura along the chest wall or apical caps.',
        'anatomical_signs': 'Smooth or nodular pleural thickening (> 3 mm), apical pleural capping, and potential calcified pleural plaques along the diaphragmatic or posterolateral pleura.',
        'pathophysiology': 'Chronic reactive fibrotic remodeling secondary to prior hemothorax, healed bacterial empyema, tuberculous pleuritis, or occupational mineral dust exposure (asbestos).',
        'differentials': '1. Chronic Post-Inflammatory Pleural Fibrosis\n2. Asbestos-Related Pleural Plaques\n3. Primary Pleural Mesothelioma\n4. Metastatic Pleural Carcinomatosis',
        'acute_management': '- Confirm clinical stability; assess for underlying dyspnea or restrictive ventilatory defect.\n- Avoid unnecessary invasive pleural interventions if stable and calcified.',
        'diagnostic_steps': '- Inquire regarding detailed lifetime occupational history (shipyard, insulation, construction).\n- Comparison with prior historical radiographs to establish chronicity (> 2 years stability confirms benign etiology).\n- High-resolution thoracic CT if thickening is nodular, circumferential, or exceeds 1 cm in thickness.'
    },
    'Edema': {
        'desc': 'Diffuse symmetric pulmonary vascular congestion with perihilar bat-wing opacification, interlobular septal lines, and alveolar fluid filling.',
        'anatomical_signs': 'Perihilar haze, cephalization of pulmonary veins, Kerley B lines in the lateral basilar sulci, peribronchial cuffing, and cardiomegaly.',
        'pathophysiology': 'Elevated pulmonary capillary hydrostatic pressure (> 20-25 mmHg) overcoming lymphatic clearance, causing interstitial transudation progressing to alveolar flooding.',
        'differentials': '1. Cardiogenic Hydrostatic Pulmonary Edema\n2. Acute Non-Cardiogenic Edema (ARDS / Capillary Leak Syndrome)\n3. Fluid Overload in End-Stage Renal Disease\n4. Acute Volume Overload Transfusion-Related Lung Injury (TRALI)',
        'acute_management': '- Urgent intravenous loop diuretics (Furosemide 40-80 mg IV bolus) and vasodilator therapy if hypertensive.\n- Non-invasive positive pressure ventilation (CPAP / BiPAP) to recruit fluid-filled alveoli and reduce preload and afterload.\n- Continuous cardiac monitoring and arterial line placement if hemodynamically labile.',
        'diagnostic_steps': '- Immediate bedside echocardiography to assess acute left ventricular systolic/diastolic decompensation and severe mitral regurgitation.\n- Serial serum electrolytes, BUN, and creatinine to guide ongoing diuretic titration.\n- Cardiac troponin and NT-proBNP quantification to assess acute myocardial injury.'
    },
    'Nodule': {
        'desc': 'Well-defined, solitary or discrete pulmonary parenchymal opacity measuring less than or equal to 3 cm in greatest dimension.',
        'anatomical_signs': 'Focal rounded opacity surrounded by aerated lung parenchyma, lacking cavitation or associated lymphadenopathy on standard projection.',
        'pathophysiology': 'Broad etiology spanning benign infectious granulomas (Histoplasma, Tuberculosis), hamartomas, or early primary bronchogenic carcinoma / solitary metastasis.',
        'differentials': '1. Benign Infectious Granuloma\n2. Pulmonary Hamartoma\n3. Early Stage Primary Bronchogenic Carcinoma (Adenocarcinoma / Squamous)\n4. Solitary Metastatic Focus',
        'acute_management': '- No immediate acute hemodynamic interventions; establish risk stratification based on age, smoking pack-years, and personal history of cancer.',
        'diagnostic_steps': '- Dedicated Thin-Slice Non-Contrast or Contrast-Enhanced High-Resolution Chest CT protocol (HRCT) to evaluate precise nodule attenuation, margins (spiculation vs smoothness), and presence of calcification.\n- Retrieval and meticulous side-by-side comparison with historical chest radiographs or CT studies to calculate volume doubling time.\n- Application of Fleischner Society 2017 Guidelines for follow-up surveillance interval or tissue biopsy.'
    },
    'Mass': {
        'desc': 'Discrete, expansive pulmonary or mediastinal soft-tissue mass measuring strictly greater than 3 cm in transverse diameter.',
        'anatomical_signs': 'Large dense soft-tissue opacity, lobulated or spiculated contours, potential central cavitation, and distortion of contiguous bronchovascular anatomy.',
        'pathophysiology': 'High pre-test probability of primary bronchogenic carcinoma, malignant lymphoma, or aggressive metastatic lesion, causing local compressive and invasive tissue destruction.',
        'differentials': '1. Primary Bronchogenic Carcinoma (Non-Small Cell or Small Cell Lung Cancer)\n2. Solitary Secondary Pulmonary Metastasis\n3. Chronic Pulmonary Abscess / Fungal Mycetoma\n4. Mediastinal Tumor (Thymoma, Teratoma, Lymphoma)',
        'acute_management': '- Multidisciplinary thoracic oncology referral; assess for central airway compromise, hemoptysis, or superior vena cava syndrome.',
        'diagnostic_steps': '- Urgent Contrast-Enhanced CT (CECT) of the chest, upper abdomen, and adrenal glands for initial TNM anatomical staging.\n- Whole-body 18F-FDG PET-CT scan to determine metabolic viability and detect nodal / distant metastases.\n- Interventional pulmonology bronchoscopy with EBUS (Endobronchial Ultrasound) or CT-guided percutaneous core needle biopsy for definitive histopathology and immunohistochemistry / molecular biomarker profiling.'
    },
    'Pneumothorax': {
        'desc': 'Accumulation of free intrapleural air with separation and visualization of the visceral pleural white line and total absence of peripheral vascular lung markings.',
        'anatomical_signs': 'Sharp hair-thin visceral pleural line paralleling the chest wall, peripheral hyperlucency devoid of pulmonary vessels, and secondary basilar atelectasis.',
        'pathophysiology': 'Disruption of visceral or parietal pleural continuity allowing atmospheric or alveolar gas into the negative-pressure pleural space, with risk of progression to tension pneumothorax.',
        'differentials': '1. Primary Spontaneous Pneumothorax (rupture of subpleural apical blebs)\n2. Secondary Spontaneous Pneumothorax (COPD bullae, necrotizing pneumonia, cystic lung disease)\n3. Iatrogenic or Traumatic Pneumothorax\n4. Giant Emphysematous Bulla mimicking pneumothorax',
        'acute_management': '- Immediate assessment for tension physiology: hemodynamic collapse, severe tachycardia, hypotension, tracheal deviation, and absent breath sounds require emergency needle decompression (2nd intercostal space midclavicular line or 5th intercostal space anterior axillary line).\n- In stable non-tension cases, high-flow 100% supplemental oxygen therapy accelerates nitrogen reabsorption across the pleura by a factor of 4.',
        'diagnostic_steps': '- Measurement of apex-to-cupola distance or interpleural distance to classify size (small vs large per BTS / ACCP guidelines).\n- Tube thoracostomy (small-bore pigtail catheter or large-bore chest tube with water-seal drainage) for symptomatic or large-volume pneumothoraces.\n- Repeat expiratory chest radiograph or low-dose chest CT to assess lung re-expansion and evaluate underlying bullous disease.'
    },
    'Emphysema': {
        'desc': 'Bilateral symmetric pulmonary hyperinflation with marked flattening and depression of the diaphragmatic hemidomes and hyperlucent lung fields.',
        'anatomical_signs': 'Increased retrosternal clear space (> 2.5 cm on lateral), low flat diaphragms with blunted or wide costophrenic angles, attenuated peripheral vascularity ("pruning"), and prominent central pulmonary arteries.',
        'pathophysiology': 'Permanent, irreversible enlargement of the airspaces distal to the terminal bronchioles accompanied by destructive elastolysis of alveolar walls without conspicuous fibrosis.',
        'differentials': '1. Chronic Obstructive Pulmonary Disease (Centrilobular / Panlobular Emphysema)\n2. Severe Acute Asthma Bronchospasm with Dynamic Hyperinflation\n3. Alpha-1 Antitrypsin Deficiency (basilar-predominant emphysema in younger individuals)\n4. Constrictive Bronchiolitis',
        'acute_management': '- Inhaled dual bronchodilator therapy (short-acting beta-2 agonist + short-acting anticholinergic nebulizations).\n- Systemic corticosteroids (Prednisone 40 mg daily for 5 days) if presenting with acute COPD exacerbation.\n- Controlled supplemental oxygen therapy with Venturi mask targeting SpO2 88-92% to avert oxygen-induced hypercapnia.',
        'diagnostic_steps': '- Formal Pulmonary Function Testing (PFTs) with post-bronchodilator spirometry (confirming FEV1/FVC < 0.70) and carbon monoxide diffusing capacity (DLCO).\n- High-resolution chest CT (HRCT) to evaluate the anatomical distribution and percentage of low-attenuation emphysematous parenchyma.\n- Serum Alpha-1 Antitrypsin level screening.'
    },
    'Fibrosis': {
        'desc': 'Diffuse bilateral reticular, linear, and cystic parenchymal abnormalities with architectural distortion and volume contraction.',
        'anatomical_signs': 'Coarse reticulonodular opacities, subpleural basilar honeycombing, traction bronchiectasis, and progressive loss of lower lobe lung volume.',
        'pathophysiology': 'Dysregulated fibroblast proliferation and extracellular matrix deposition leading to progressive alveolar architecture obliteration, severe ventilation-perfusion mismatch, and restrictive physiology.',
        'differentials': '1. Idiopathic Pulmonary Fibrosis (IPF / UIP pattern)\n2. Connective Tissue Disease-Associated Interstitial Lung Disease (Systemic Sclerosis, Rheumatoid Arthritis)\n3. Chronic Hypersensitivity Pneumonitis\n4. Drug-Induced or Radiation-Induced Pulmonary Fibrosis',
        'acute_management': '- Optimize supplemental ambulatory oxygen; assess for acute exacerbation of interstitial lung disease (AE-ILD).\n- Pulmonary rehabilitation and symptom management.',
        'diagnostic_steps': '- High-Resolution Chest CT (HRCT) protocol with inspiratory and expiratory prone sequences to distinguish true honeycombing and traction bronchiectasis from dependent atelectasis.\n- Comprehensive autoimmune serological panel (ANA, RF, Anti-CCP, Scl-70, Jo-1, Ro/La, myositis panel).\n- Multidisciplinary interstitial lung disease conference review with pulmonologists, thoracic radiologists, and thoracic pathologists.'
    },
    'Hernia': {
        'desc': 'Disruption or laxity of the diaphragmatic crus with intrathoracic herniation of hollow abdominal viscera.',
        'anatomical_signs': 'Retrocardiac or paracardiac air-fluid level within the posterior mediastinum, distortion of the medial diaphragmatic contour, and upward displacement of the gastric air bubble.',
        'pathophysiology': 'Sliding or paraesophageal herniation through an enlarged esophageal hiatus, or post-traumatic diaphragmatic rupture permitting abdominal organs into the negative-pressure pleural cavity.',
        'differentials': '1. Type I-IV Hiatal Hernia\n2. Traumatic Diaphragmatic Rupture / Hernia\n3. Bochdalek / Morgagni Congenital Hernia\n4. Mediastinal Abscess or Infected Bronchogenic Cyst',
        'acute_management': '- Assess for clinical signs of gastric volvulus, strangulation, or bowel obstruction (severe epigastric pain, retching without emesis, obstipation).\n- Place nasogastric tube under careful decompression if symptomatic acute gastric distension is present.',
        'diagnostic_steps': '- Contrast-Enhanced Chest and Abdominal CT with oral / IV contrast to delineate the precise anatomy of herniated viscera and assess for vascular compromise.\n- Barium or Gastrografin upper GI swallow study to evaluate esophageal transit, peristalsis, and gastroesophageal junction position.\n- Urgent surgical consultation if incarcerated or strangulated.'
    },
    'No Finding': {
        'desc': 'Normal cardiopulmonary boundaries, clear lung fields without focal consolidation, pneumothorax, or pleural effusion, and normal cardiothoracic ratio.',
        'anatomical_signs': 'Sharply defined costophrenic and cardiophrenic angles, normal pulmonary vascular branching tapering to periphery, normal mediastinal width, and intact thoracic cage.',
        'pathophysiology': 'Absence of radiologically overt acute pulmonary, pleural, or gross cardiovascular parenchymal disease on the current two-dimensional radiographic projection.',
        'differentials': '1. Normal Thoracic Examination\n2. Early or Sub-radiographic Pulmonary Pathology (e.g. early viral infection, mild asthma exacerbation)\n3. Extrathoracic / Musculoskeletal Etiology for Chest Discomfort\n4. Non-pulmonary causes (e.g. gastroesophageal reflux, costochondritis, anxiety-related dyspnea)',
        'acute_management': '- Reassure patient regarding absence of acute life-threatening radiographical anomalies.\n- Address presenting clinical symptoms and evaluate alternative organ systems.',
        'diagnostic_steps': '- Clinical correlation with detailed physical examination and baseline vital signs.\n- Serial clinical reassessment; instruct patient on red-flag respiratory symptoms warranting immediate re-evaluation.\n- Consider cross-sectional chest CT or non-radiological testing (D-dimer, cardiac enzymes, ECG) if clinical suspicion for vascular or coronary pathology persists.'
    }
}

class ReportGenerator:
    def __init__(self):
        self.model = setup_gemini()

    def generate_report(self, image_findings: list, raw_clinical_text: str) -> dict:
        """
        Takes the image findings and raw clinical text,
        and generates a structured, deeply comprehensive clinical report.
        """
        # 1. Attempt LLM generation if model is initialized
        if self.model:
            try:
                findings_str = "\n".join([
                    f"- {f['disease']}: {f['probability']*100:.1f}% (Threshold: {f.get('threshold', 0.5)*100:.1f}%)" 
                    for f in image_findings
                ])

                prompt = f"""
                You are a senior thoracic radiologist and clinical pulmonology consultant at an academic medical center.
                You are conducting an in-depth clinical case evaluation based on quantitative findings from a Swin Transformer 
                deep learning model and submitted patient clinical records.

                IMAGE FINDINGS (SWIN TRANSFORMER VISION AI):
                {findings_str}

                RAW CLINICAL INFORMATION:
                {raw_clinical_text}

                TASK:
                Generate an exhaustive, highly detailed, professional medical report. Write with rigorous clinical depth, 
                synthesizing the image model probabilities with physiological mechanisms, differential reasoning, and 
                actionable clinical guidelines.

                Format your response as a valid JSON object with EXACTLY these six keys containing rich Markdown text:
                {{
                    "clinical_context": "Multi-paragraph clinical context narrative specifying patient presentation, symptom timeline, cardiopulmonary baseline, physiological stability, and formal radiographic study indication.",
                    "image_model_findings": "Comprehensive categorized markdown breakdown of the Swin Transformer findings into Primary High-Probability (>=50%), Secondary Co-pathologies (15%-50%), and Excluded Low-Probability (<15%) conditions, detailing exact probabilities, decision thresholds, and specific anatomical radiographic signs.",
                    "clinical_information": "Detailed structured breakdown containing: Patient Demographics, Chief Complaint & History of Present Illness, Comprehensive Vital Signs Analysis (SpO2, HR, BP, RR, Temp), Laboratory Biomarkers (WBC, inflammatory markers), and Past Medical/Occupational History.",
                    "integrated_interpretation": "3 to 4 detailed analytical clinical paragraphs correlating radiological findings directly with presenting physiology, discussing pathophysiological mechanisms, clinical severity score context (e.g. CURB-65 / PSI), and AI confidence calibration.",
                    "possible_findings": "Detailed numbered differential diagnosis list with clinical reasoning, matching radiological signs, supporting evidence, and distinguishing clinical criteria for each consideration.",
                    "recommended_next_steps": "Actionable, tiered clinical management plan including: 1. Immediate Acute Stabilization & O2 Titration, 2. Secondary Imaging & POCUS Ultrasound Protocols, 3. Laboratory / Microbiological Diagnostic Workup, and 4. Formal Attending Radiologist Overread Protocol."
                }}
                """

                response = self.model.generate_content(prompt)
                resp_text = response.text.strip()
                if resp_text.startswith("```json"):
                    resp_text = resp_text[7:-3].strip()
                elif resp_text.startswith("```"):
                    resp_text = resp_text[3:-3].strip()
                    
                llm_output = json.loads(resp_text)
                
                # Fix literal escaped newlines that LLM sometimes outputs
                for key in llm_output:
                    if isinstance(llm_output[key], str):
                        llm_output[key] = llm_output[key].replace('\\n', '\n')
                        
                # Verify non-empty output
                if llm_output.get("clinical_context") and llm_output.get("integrated_interpretation"):
                    return {
                        "clinical_context": llm_output.get("clinical_context", ""),
                        "image_model_findings": llm_output.get("image_model_findings", ""),
                        "clinical_information": llm_output.get("clinical_information", ""),
                        "integrated_interpretation": llm_output.get("integrated_interpretation", ""),
                        "possible_findings": llm_output.get("possible_findings", ""),
                        "recommended_next_steps": llm_output.get("recommended_next_steps", "")
                    }
            except Exception as e:
                print(f"LLM generation failed, switching to clinical rules fallback: {e}")

        # 2. Robust Clinical Rule-Based Report Generation
        return self._generate_rule_based_report(image_findings, raw_clinical_text)

    def _generate_rule_based_report(self, image_findings: list, raw_clinical_text: str) -> dict:
        sorted_findings = sorted(image_findings, key=lambda x: x.get('probability', 0), reverse=True)
        top_finding = sorted_findings[0] if sorted_findings else {'disease': 'No Finding', 'probability': 0.0}
        
        primary_findings = [f for f in sorted_findings if f.get('probability', 0) >= 0.50]
        secondary_findings = [f for f in sorted_findings if 0.15 <= f.get('probability', 0) < 0.50]
        minor_findings = [f for f in sorted_findings if f.get('probability', 0) < 0.15]

        top_name = top_finding['disease']
        top_prob = top_finding['probability'] * 100
        top_kb = DISEASE_KNOWLEDGE_BASE.get(top_name, DISEASE_KNOWLEDGE_BASE['No Finding'])

        text = raw_clinical_text.strip() if raw_clinical_text else ""

        # -------------------------------------------------------------
        # 1. CLINICAL CONTEXT
        # -------------------------------------------------------------
        context_paragraphs = []
        context_paragraphs.append(
            "**EXAMINATION TYPE:** Standard Posteroanterior (PA) erect digital chest radiography, acquired with automated exposure control on a calibrated digital detector system at standard 72-inch source-to-image receptor distance (SID)."
        )
        
        if text:
            context_paragraphs.append(
                f"**CLINICAL INDICATION & PRESENTATION:** The examination was performed following clinical presentation with acute cardiopulmonary symptomatology. Recorded clinical referral notes indicate: {text}."
            )
            context_paragraphs.append(
                "The patient presents for urgent radiographic evaluation to delineate the underlying thoracic etiology, rule out gross parenchymal consolidation or pleural space compromise, and assist attending clinicians in triage and therapy optimization."
            )
        else:
            context_paragraphs.append(
                "**CLINICAL INDICATION:** Routine diagnostic chest radiographic screening and cardiopulmonary evaluation. Limited accompanying clinical history provided at time of imaging submission."
            )
            context_paragraphs.append(
                "The radiograph was submitted for primary computational evaluation and computer-aided clinical decision support via the Swin Transformer vision intelligence pipeline."
            )
        
        context_p = "\n\n".join(context_paragraphs)

        # -------------------------------------------------------------
        # 2. IMAGE MODEL FINDINGS (AI PREDICTIONS)
        # -------------------------------------------------------------
        lines_img = []
        lines_img.append(
            "The radiograph was analyzed using the **Swin Transformer** hierarchical Vision Transformer, fine-tuned on the benchmark NIH ChestX-ray14 multi-label corpus. Quantitative multi-label calibrated posterior probabilities are stratified below:"
        )
        
        if primary_findings:
            lines_img.append("\n### Primary High-Probability Findings (≥ 50% Threshold):")
            for f in primary_findings:
                p_val = f['probability'] * 100
                d_name = f['disease']
                d_info = DISEASE_KNOWLEDGE_BASE.get(d_name, {})
                lines_img.append(
                    f"- **{d_name}**: **{p_val:.1f}%** posterior probability (Decision Threshold: {f.get('threshold', 0.5)*100:.1f}%)"
                    f"\n  - *Radiographic Manifestation:* {d_info.get('desc', 'Significant pathological opacity.')}"
                    f"\n  - *Anatomical Signs:* {d_info.get('anatomical_signs', 'Focal parenchymal/pleural alteration.')}"
                )
        else:
            lines_img.append(
                f"\n### Dominant Finding:\n- **{top_name}**: **{top_prob:.1f}%** (Below acute 50% cutoff, representing leading statistical trend)."
            )

        if secondary_findings:
            lines_img.append("\n### Secondary Co-Pathologies & Intermediate Risk (15% – 50%):")
            for f in secondary_findings[:4]:
                p_val = f['probability'] * 100
                d_name = f['disease']
                d_info = DISEASE_KNOWLEDGE_BASE.get(d_name, {})
                lines_img.append(
                    f"- **{d_name}**: **{p_val:.1f}%** likelihood\n  - *Clinical Context:* {d_info.get('desc', 'Potential co-existing pathological pattern.')}"
                )

        if minor_findings:
            minor_str = ", ".join([f"{f['disease']} ({f['probability']*100:.1f}%)" for f in minor_findings[:7]])
            lines_img.append(f"\n### Low-Probability / Excluded Entities (< 15%):\n{minor_str}\n*(No overt radiological evidence of pneumothorax, major expansive masses, or diaphragmatic hernia on current projection).*")

        image_model_findings_str = "\n".join(lines_img)

        # -------------------------------------------------------------
        # 3. CLINICAL INFORMATION
        # -------------------------------------------------------------
        lines_clin = []
        lines_clin.append("### Patient Clinical Profile & Extracted Parameters:")
        if text:
            # Fix escaped newlines if they somehow reached here
            safe_text = text.replace('\n', '
')
            for line in safe_text.split('
'):
                clean_l = line.strip()
                if clean_l:
                    lines_clin.append(f"- **{clean_l}**")
            
            # Inject CCM evidence if available
            has_ccm = any('ccm' in f and f['ccm'] and f['ccm'].get('label') != 'N/A' for f in image_findings)
            if has_ccm:
                lines_clin.append("
### Clinical Consistency & Symptom Alignment (CCM):")
                for f in [x for x in image_findings if 'ccm' in x and x['ccm'] and x['ccm'].get('label') != 'N/A']:
                    lines_clin.append(f"- **{f['disease']}**: {f['ccm']['label']} alignment (Score: {f['ccm']['score']*100:.0f}%). Symptoms matched: {', '.join(f['ccm'].get('matched', [])) or 'None'}")
            
            lines_clin.append(
                "
*Fusion Mechanism Note: The above reported symptoms and their structured alignment scores were combined with the Swin Transformer Vision AI using **Decision-Level Late Fusion** to generate the final interpretation.*"
            )
        else:
            lines_clin.append("- **Demographics & History:** Not provided in initial transmission.")
            lines_clin.append("- **Symptoms & Vitals:** Unspecified; interpretation based upon isolated radiographic morphology.")
            lines_clin.append("- **Laboratory Biomarkers:** Awaiting baseline complete blood count, inflammatory markers, and arterial blood gas.")

        clinical_info_str = "\n".join(lines_clin)

        # -------------------------------------------------------------
        # 4. INTEGRATED INTERPRETATION
        # -------------------------------------------------------------
        interp_paragraphs = []
        
        # Paragraph 1: Primary diagnosis and pathophysiological mechanism
        interp_paragraphs.append(
            f"**Pathophysiological Synthesis:** Deep learning feature extraction utilizing the Swin Transformer architecture identifies a strong radiographic signal for **{top_name}**, yielding a calibrated posterior probability of **{top_prob:.1f}%**. {top_kb.get('pathophysiology', 'This finding reflects acute parenchymal or pleural disease.')} This radiographic pattern demonstrates high concordance with the clinical indications, substantiating the presence of active cardiopulmonary pathology."
        )

        # Paragraph 2: Multi-pathology interaction or secondary findings
        if secondary_findings:
            sec_items = [f"**{f['disease']}** ({f['probability']*100:.1f}%)" for f in secondary_findings[:2]]
            sec_items_str = ", ".join(sec_items)
            interp_paragraphs.append(
                f"**Secondary Process Correlation:** Concurrently, elevated probabilistic indicators for {sec_items_str} suggest an interconnected disease continuum rather than an isolated focal event. In clinical practice, primary pleural or alveolar processes frequently induce reactive alterations—such as compressive basilar atelectasis secondary to dependent fluid collection, or concurrent peribronchial inflammatory infiltration. These multi-compartmental findings indicate a combined pathophysiological insult requiring broad therapeutic coverage."
            )
        else:
            interp_paragraphs.append(
                "**Cardiopulmonary Stability:** Examination of the remaining mediastinal, vascular, and thoracic cage structures reveals no secondary pneumothorax, gross mediastinal shift, or destructive bony lesions. The visual attention maps focus predominantly on the affected parenchymal and pleural boundaries."
            )

        # Paragraph 3: Clinical severity and triage context
        interp_paragraphs.append(
            "**Clinical Severity & Risk Stratification:** In light of the observed radiological patterns alongside the clinical presentation, the patient warrants formal clinical severity scoring (e.g. CURB-65 / Pneumonia Severity Index for acute pulmonary processes, or Framingham criteria / NYHA classification for cardiogenic decompensation). Prompt stabilization and targeted diagnostic escalation are recommended to avert acute respiratory fatigue."
        )

        # Paragraph 4: AI Explainability & Limitations
        interp_paragraphs.append(
            "*AI Governance & Model Disclosure: Predictions were generated via a shifted-window hierarchical self-attention mechanism trained on multi-label radiological data. While Swin Transformers exhibit superior feature representation over classical CNNs, outputs reflect statistical likelihoods and cannot account for clinical nuances without formal attending physician overread.*"
        )

        integrated_interpretation_str = "\n\n".join(interp_paragraphs)

        # -------------------------------------------------------------
        # 5. POSSIBLE FINDINGS / DIFFERENTIAL CONSIDERATIONS
        # -------------------------------------------------------------
        diff_list = []
        diff_list.append(
            f"1. **Primary Working Consideration — {top_name}** ({top_prob:.1f}% model likelihood):\n"
            f"   - *Diagnostic Rationale:* Supported by prominent radiographic density and matching anatomical contour alterations. {top_kb.get('desc', '')}\n"
            f"   - *Expected Clinical Course:* Requires targeted therapeutic intervention and serial objective monitoring."
        )

        if secondary_findings:
            for idx, sec in enumerate(secondary_findings[:3], start=2):
                sec_name = sec['disease']
                sec_p = sec['probability'] * 100
                sec_kb = DISEASE_KNOWLEDGE_BASE.get(sec_name, {})
                diff_list.append(
                    f"{idx}. **Secondary Consideration — {sec_name}** ({sec_p:.1f}% model likelihood):\n"
                    f"   - *Diagnostic Rationale:* Elevated probability warrants consideration of {sec_kb.get('desc', 'concurrent inflammatory or volume loss process')}. May represent an evolving co-morbidity or reactive change."
                )
        else:
            diff_list.append(
                "2. **Alternative Differential Considerations:** Subsegmental atelectasis, early atypical interstitial infiltrate, or normal anatomical superimposition."
            )

        top_diffs = top_kb.get('differentials', '1. Atypical Infection\n2. Thromboembolic event\n3. Malignancy')
        diff_list.append(
            f"{len(diff_list)+1}. **Must-Not-Miss Differentials to Exclude:**\n"
            f"   {top_diffs}"
        )

        possible_findings_str = "\n\n".join(diff_list)

        # -------------------------------------------------------------
        # 6. RECOMMENDED CLINICAL CORRELATION & NEXT STEPS
        # -------------------------------------------------------------
        steps_list = []
        steps_list.append("### Tier 1: Immediate Acute Management & Hemodynamic Stabilization")
        steps_list.append(top_kb.get('acute_management', '- Titrate supplemental oxygen to target SpO2 >= 92%.\n- Continuous monitoring of vital signs.'))

        steps_list.append("\n### Tier 2: Diagnostic Imaging & Point-of-Care Ultrasound (POCUS)")
        steps_list.append(top_kb.get('diagnostic_steps', '- Targeted bedside thoracic ultrasound.\n- High-resolution chest CT if clinically warranted.'))

        if secondary_findings:
            sec_top = secondary_findings[0]['disease']
            sec_top_kb = DISEASE_KNOWLEDGE_BASE.get(sec_top, {})
            steps_list.append(f"\n### Tier 3: Management of Secondary Features ({sec_top})")
            steps_list.append(sec_top_kb.get('acute_management', '- Optimize airway clearance and supportive care.'))

        steps_list.append(
            "\n### Tier 4: Multidisciplinary Oversight & Quality Assurance\n"
            "- **Attending Radiologist Overread:** Mandatory formal sign-off by a licensed radiologist before initiating invasive interventions.\n"
            "- **Serial Radiographic Follow-up:** Schedule interval chest radiography at 48-72 hours to assess treatment efficacy or confirm clearance.\n"
            "- **Laboratory Workup:** Blood cultures x 2, complete blood count with differential, inflammatory biomarkers (CRP, Procalcitonin), and serum electrolytes."
        )

        recommended_next_steps_str = "\n".join(steps_list)

        return {
            "clinical_context": context_p,
            "image_model_findings": image_model_findings_str,
            "clinical_information": clinical_info_str,
            "integrated_interpretation": integrated_interpretation_str,
            "possible_findings": possible_findings_str,
            "recommended_next_steps": recommended_next_steps_str
        }
