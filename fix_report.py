import codecs

path = r'report_generator.py'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# Fix the differentials list markdown so it stays indented
text = text.replace(
    'f"   {top_diffs}"',
    'f"   " + top_diffs.replace("\\n", "\\n   ")'
)

# Now, we need to inject CCM data into the Clinical Information and Integrated Interpretation of the rule-based report
# Look for where clinical_info_str is built in _generate_rule_based_report
clin_replace_old = '''        if text:
            for line in text.split('\\n'):
                clean_l = line.strip()
                if clean_l:
                    lines_clin.append(f"- **{clean_l}**")
            lines_clin.append(
                "\\n*Correlation Note: Presenting symptoms and physical examination markers were integrated directly into the multimodal Bayesian differential assessment below.*"
            )
        else:'''

clin_replace_new = '''        if text:
            for line in text.split('\\n'):
                clean_l = line.strip()
                if clean_l:
                    lines_clin.append(f"- **{clean_l}**")
            
            # Inject CCM evidence if available
            has_ccm = any('ccm' in f and f['ccm'] and f['ccm'].get('label') != 'N/A' for f in image_findings)
            if has_ccm:
                lines_clin.append("\\n### Clinical Consistency & Symptom Alignment:")
                for f in [x for x in image_findings if 'ccm' in x and x['ccm'] and x['ccm'].get('label') != 'N/A']:
                    lines_clin.append(f"- **{f['disease']}**: {f['ccm']['label']} alignment (Score: {f['ccm']['score']*100:.0f}%). Symptoms matched: {', '.join(f['ccm'].get('matched', [])) or 'None'}")
            
            lines_clin.append(
                "\\n*Correlation Note: The above reported symptoms and their structured alignment scores were integrated directly into the multimodal Bayesian differential assessment below.*"
            )
        else:'''

text = text.replace(clin_replace_old, clin_replace_new)

# Modify interpretation paragraph 1 to acknowledge symptoms
interp_replace_old = "This radiographic pattern demonstrates high concordance with the clinical indications, substantiating the presence of active cardiopulmonary pathology."

interp_replace_new = "When evaluated against the patient's explicitly reported symptoms (detailed above), this radiographic pattern demonstrates robust clinical concordance, substantiating the presence of active cardiopulmonary pathology directly linked to their presentation."

text = text.replace(interp_replace_old, interp_replace_new)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)
