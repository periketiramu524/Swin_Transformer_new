document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropZone = document.getElementById('drop-zone');
    const imageInput = document.getElementById('image-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingState = document.getElementById('loading-state');
    const resultsPanel = document.getElementById('results-panel');
    
    const pdfInput = document.getElementById('pdf-input');
    
    // Clinical Inputs
    const clinAge = document.getElementById('clin-age');
    const clinWbc = document.getElementById('clin-wbc');
    const clinSymptoms = document.getElementById('clin-symptoms');
    const clinVitals = document.getElementById('clin-vitals');
    const clinNotes = document.getElementById('clin-notes');
    
    // Tab Elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Results Elements
    const findingsTableBody = document.querySelector('#findings-table tbody');
    const diseaseSelect = document.getElementById('disease-select');
    const camMethodSelect = document.getElementById('cam-method-select');
    const generateCamBtn = document.getElementById('generate-cam-btn');
    const hideCamBtn = document.getElementById('hide-cam-btn');
    const camImage = document.getElementById('cam-image');
    const camLoading = document.getElementById('cam-loading');
    
    let currentImageFile = null;

    // --- Tab Switching ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.remove('hidden');
        });
    });

    // --- Drag & Drop ---
    dropZone.addEventListener('click', () => imageInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });

    function handleImageFile(file) {
        if (!file.type.match('image.*') && !file.name.endsWith('.dcm')) {
            alert('Please upload a valid image file (PNG, JPG). DICOM is parsed by backend.');
            return;
        }
        
        currentImageFile = file;
        
        // Show preview for standard images
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                dropZone.classList.add('hidden');
                imagePreviewContainer.classList.remove('hidden');
                analyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            // Placeholder for DICOM
            dropZone.classList.add('hidden');
            imagePreviewContainer.classList.remove('hidden');
            analyzeBtn.disabled = false;
        }
    }

    removeImageBtn.addEventListener('click', () => {
        currentImageFile = null;
        imageInput.value = '';
        imagePreview.src = '';
        camImage.src = '';
        camImage.classList.add('hidden');
        imagePreviewContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
        analyzeBtn.disabled = true;
        resultsPanel.classList.add('hidden');
    });

    // --- API Calls ---
    analyzeBtn.addEventListener('click', async () => {
        if (!currentImageFile) return;

        // UI Updates
        analyzeBtn.disabled = true;
        loadingState.classList.remove('hidden');
        resultsPanel.classList.add('hidden');
        
        // Construct image form data
        const formData = new FormData();
        formData.append('image', currentImageFile);

        // Construct combined clinical text
        let combinedText = [];
        if (clinAge.value) combinedText.push(`Age: ${clinAge.value}`);
        if (clinWbc.value) combinedText.push(`WBC Lab Value: ${clinWbc.value}`);
        if (clinSymptoms.value) combinedText.push(`Symptoms: ${clinSymptoms.value}`);
        if (clinVitals.value) combinedText.push(`Vitals: ${clinVitals.value}`);
        if (clinNotes.value) combinedText.push(`Additional Notes: ${clinNotes.value}`);
        
        formData.append('clinical_text', combinedText.join('\n'));
        
        if (pdfInput.files.length > 0) {
            formData.append('clinical_pdf', pdfInput.files[0]);
        }

        try {
            document.getElementById('loading-text').textContent = 'Extracting clinical info & analyzing X-ray...';
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Analysis failed');
            }

            const data = await response.json();
            
            populateFindings(data.findings);
            populateReport(data.report);
            
            // UI Updates: Hide main spinner, show results
            loadingState.classList.add('hidden');
            resultsPanel.classList.remove('hidden');
            analyzeBtn.disabled = false;
            
            // Ensure report tab shows content (hide spinner if any)
            document.getElementById('report-loading').classList.add('hidden');
            document.getElementById('report-content').classList.remove('hidden');

        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
            loadingState.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    function populateFindings(findings) {
        findingsTableBody.innerHTML = '';
        
        findings.forEach((finding, idx) => {
            const tr = document.createElement('tr');
            
            const statusClass = finding.detected ? 'detected' : 'not-detected';
            const statusText = finding.detected ? 'DETECTED' : 'NOT DETECTED';
            const probPct = (finding.probability * 100).toFixed(1);
            const threshPct = (finding.threshold * 100).toFixed(1);
            
            tr.innerHTML = `
                <td><strong>${finding.disease}</strong></td>
                <td>
                    ${probPct}%
                    <div class="prob-bar-container">
                        <div class="prob-bar" style="width: ${probPct}%; background: ${finding.detected ? 'var(--detected)' : 'var(--primary)'}"></div>
                    </div>
                </td>
                <td>${threshPct}%</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            findingsTableBody.appendChild(tr);
        });
    }
    
    function populateReport(reportData) {
        // Very basic markdown formatting function
        const formatText = (text) => {
            if (!text) return '';
            let formatted = text;
            
            // Bold
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // List items starting with `- ` or `* `
            formatted = formatted.replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>');
            
            // Wrap contiguous <li> elements in <ul>
            formatted = formatted.replace(/(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g, '<ul style="margin-top: 0.5rem; margin-bottom: 1rem; margin-left: 1.5rem;">$1</ul>');
            
            // Line breaks (ignore breaks that are now inside lists)
            formatted = formatted.replace(/\n(?!\s*<ul|\s*<li|\s*<\/ul)/g, '<br>');
            
            return formatted;
        };
        
        document.getElementById('clinical-context').innerHTML = formatText(reportData.clinical_context);
        document.getElementById('image-model-findings').innerHTML = formatText(reportData.image_model_findings);
        document.getElementById('clinical-information').innerHTML = formatText(reportData.clinical_information);
        document.getElementById('integrated-interpretation').innerHTML = formatText(reportData.integrated_interpretation);
        document.getElementById('possible-findings').innerHTML = formatText(reportData.possible_findings);
        document.getElementById('recommended-next-steps').innerHTML = formatText(reportData.recommended_next_steps);
    }

    // --- Generate CAM ---
    generateCamBtn.addEventListener('click', async () => {
        if (!currentImageFile) return;

        camImage.classList.add('hidden');
        camLoading.classList.remove('hidden');
        generateCamBtn.disabled = true;

        const formData = new FormData();
        formData.append('image', currentImageFile);
        formData.append('class_idx', diseaseSelect.value);
        formData.append('cam_method', camMethodSelect.value);

        try {
            const response = await fetch('/api/explain', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to generate heatmap');

            const data = await response.json();
            
            camImage.src = `data:image/jpeg;base64,${data.heatmap_base64}`;
            camImage.classList.remove('hidden');

        } catch (err) {
            alert(err.message);
        } finally {
            camLoading.classList.add('hidden');
            generateCamBtn.disabled = false;
        }
    });
    
    hideCamBtn.addEventListener('click', () => {
        camImage.classList.add('hidden');
    });
});
