function showMessageBox(message) {
    document.getElementById('messageText').innerText = message;
    document.getElementById('messageBox').style.display = 'block';
}
function hideMessageBox() {
    document.getElementById('messageBox').style.display = 'none';
}
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
async function convertImage() {
    const imageFileInput = document.getElementById('imageFileInput');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const formData = new FormData();
    if (imageFileInput.files.length > 0) {
        formData.append('file', imageFileInput.files[0]);
    } else if (imageUrlInput.value.trim() !== '') {
        formData.append('url', imageUrlInput.value.trim());
    } else {
        showMessageBox('Please upload an image file or provide an image URL.');
        return;
    }
    showLoading();
    try {
        const response = await fetch('/api/convert-image', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_image.png'; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMessageBox('Image conversion successful! Download started.');
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during image conversion.');
    } finally {
        hideLoading();
    }
}
async function convertDocument() {
    const documentFileInput = document.getElementById('documentFileInput');
    const file = documentFileInput.files[0];
    if (!file) {
        showMessageBox('Please select a document file to convert.');
        return;
    }
    showLoading();
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/convert-document', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalFilename = file.name;
            const extension = originalFilename.toLowerCase().endsWith('.pdf') ? 'docx' : 'pdf';
            a.download = originalFilename.replace(/\.[^/.]+$/, `.${extension}`);
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMessageBox(`Document converted successfully to ${extension.toUpperCase()}!`);
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || 'Document conversion failed.'}`);
        }
    } catch (error) {
        console.error('Error during document conversion:', error);
        showMessageBox('An error occurred while converting the document. Please try again.');
    } finally {
        hideLoading();
    }
}
async function convertBase() {
    const inputValue = document.getElementById('baseInputValue').value;
    const sourceBase = document.getElementById('sourceBaseSelect').value;
    const targetBase = document.getElementById('targetBaseSelect').value;
    const resultDisplay = document.getElementById('baseConversionResult');
    const solutionDisplay = document.getElementById('baseConversionSolution');
    resultDisplay.innerText = '';
    solutionDisplay.innerText = '';
    if (!inputValue) {
        showMessageBox('Please enter a number to convert.');
        return;
    }
    showLoading();
    try {
        const response = await fetch('/api/convert-base', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputValue: inputValue,
                sourceBase: sourceBase,
                targetBase: targetBase
            }),
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.results)) {
                const items = data.results.map((r, idx) => {
                    const inputLabel = (data.inputs && data.inputs[idx]) ? data.inputs[idx] : `#${idx+1}`;
                    const solutionHtml = (data.solutions && data.solutions[idx]) ? `<div class=\"mt-2\">${renderBaseSolutionHTML(data.solutions[idx])}</div>` : '';
                    return `<li><code>${inputLabel}</code> → <strong>${r}</strong>${solutionHtml}</li>`;
                });
                resultDisplay.innerHTML = `<ol class=\"mb-2\">${items.join('')}</ol>`;
                solutionDisplay.innerHTML = '';
                showMessageBox('Base conversion successful!');
            } else if (data.result) {
                resultDisplay.innerText = data.result;
                solutionDisplay.innerHTML = renderBaseSolutionHTML(data.solution || '');
                showMessageBox('Base conversion successful!');
            } else {
                resultDisplay.innerText = 'Error: No result.';
                showMessageBox('Error: No result from conversion.');
            }
        } else {
            const errorData = await response.json();
            resultDisplay.innerText = `Error: ${errorData.error || response.statusText}`;
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.innerText = 'An unexpected error occurred.';
        showMessageBox('An unexpected error occurred during base conversion.');
    } finally {
        hideLoading();
    }
}
async function convertToIco() {
    const icoFileInput = document.getElementById('icoFileInput');
    if (icoFileInput.files.length === 0) {
        showMessageBox('Please upload an image file for ICO conversion.');
        return;
    }
    const file = icoFileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    showLoading();
    try {
        const response = await fetch('/api/convert-to-ico', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'converted_icon.ico'; 
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMessageBox('Image to ICO conversion successful! Download started.');
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during ICO conversion.');
    } finally {
        hideLoading();
    }
}
async function resizeImage() {
    const resizeFileInput = document.getElementById('resizeFileInput');
    const resizeWidthInput = document.getElementById('resizeWidthInput');
    const resizeHeightInput = document.getElementById('resizeHeightInput');
    if (resizeFileInput.files.length === 0) {
        showMessageBox('Please upload an image file to resize.');
        return;
    }
    const width = resizeWidthInput.value;
    const height = resizeHeightInput.value;
    if (!width || !height || parseInt(width) <= 0 || parseInt(height) <= 0) {
        showMessageBox('Please enter valid positive dimensions (width and height).');
        return;
    }
    const file = resizeFileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('width', width);
    formData.append('height', height);
    showLoading();
    try {
        const response = await fetch('/api/resize-image', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition');
            let filename = `resized_image_${width}x${height}`; 
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMessageBox('Image resizing successful! Download started.');
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during image resizing.');
    } finally {
        hideLoading();
    }
}
async function removeBackground() {
    const bgRemoveFileInput = document.getElementById('bgRemoveFileInput');
    const bgRemoveUrlInput = document.getElementById('bgRemoveUrlInput');
    const formData = new FormData();
    if (bgRemoveFileInput.files.length > 0) {
        formData.append('file', bgRemoveFileInput.files[0]);
    } else if (bgRemoveUrlInput.value.trim() !== '') {
        formData.append('url', bgRemoveUrlInput.value.trim());
    } else {
        showMessageBox('Please upload an image file or provide an image URL.');
        return;
    }
    showLoading();
    try {
        const response = await fetch('/api/remove-background', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'image_no_bg.png'; 
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showMessageBox('Background removed successfully! Download started.');
        } else {
            if (response.status === 503) {
                showMessageBox('Background removal is not available on this deployment.');
                return;
            }
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during background removal.');
    } finally {
        hideLoading();
    }
}
async function generateQRCode() {
    const qrcodeUrlInput = document.getElementById('qrcodeUrlInput');
    const qrcodeLogoInput = document.getElementById('qrcodeLogoInput');
    const qrcodePreview = document.getElementById('qrcodePreview');
    const qrcodeImage = document.getElementById('qrcodeImage');
    const url = qrcodeUrlInput.value.trim();
    const logoFile = qrcodeLogoInput ? qrcodeLogoInput.files[0] : null;
    const fgColor = document.getElementById('qrFgColor').value;
    const bgColor = document.getElementById('qrBgColor').value;
    const style = document.querySelector('input[name="qrStyle"]:checked').value;
    const logoSize = document.getElementById('qrLogoSize').value;
    const errorCorrection = document.getElementById('qrErrorCorrection').value;
    document.getElementById('qrFgColorText').value = fgColor;
    document.getElementById('qrBgColorText').value = bgColor;
    if (!url) {
        showMessageBox('Please enter a URL or text to generate a QR code.');
        return;
    }
    showLoading();
    try {
        const formData = new FormData();
        formData.append('url', url);
        formData.append('fgColor', fgColor);
        formData.append('bgColor', bgColor);
        formData.append('style', style);
        formData.append('logoSize', logoSize);
        formData.append('errorCorrection', errorCorrection);
        if (logoFile) {
            formData.append('logo', logoFile);
        }
    const response = await fetch('/api/generate-qrcode', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const blob = await response.blob();
            const previewUrl = window.URL.createObjectURL(blob);
            qrcodeImage.src = previewUrl;
            qrcodePreview.classList.remove('hidden');
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            showMessageBox('QR Code generated successfully! Download started.');
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
            qrcodePreview.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during QR code generation.');
        qrcodePreview.classList.add('hidden');
    } finally {
        hideLoading();
    }
}
async function convertUnit() {
    const value = document.getElementById('unitValueInput').value;
    const unitType = document.getElementById('unitTypeSelect').value;
    const fromUnit = document.getElementById('fromUnitSelect').value;
    const toUnit = document.getElementById('toUnitSelect').value;
    const resultDisplay = document.getElementById('unitConversionResult');
    resultDisplay.innerText = ''; 
    if (!value || isNaN(value)) {
        showMessageBox('Please enter a valid number for the value.');
        return;
    }
    if (!unitType) {
        showMessageBox('Please select a unit type.');
        return;
    }
    if (!fromUnit) {
        showMessageBox('Please select the unit to convert from.');
        return;
    }
    if (!toUnit) {
        showMessageBox('Please select the unit to convert to.');
        return;
    }
    if (fromUnit === toUnit) {
        showMessageBox('Source and target units are the same. No conversion needed.');
        resultDisplay.innerText = value;
        return;
    }
    showLoading();
    try {
        const response = await fetch('/api/convert-unit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: parseFloat(value),
                fromUnit: fromUnit,
                toUnit: toUnit,
                unitType: unitType
            }),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.result !== undefined && data.result !== null) {
                resultDisplay.innerText = data.result;
                showMessageBox('Unit conversion successful!');
            } else {
                resultDisplay.innerText = 'Error: No result.';
                showMessageBox('Error: No result from conversion.');
            }
        } else {
            const errorData = await response.json();
            resultDisplay.innerText = `Error: ${errorData.error || response.statusText}`;
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.innerText = 'An unexpected error occurred.';
        showMessageBox('An unexpected error occurred during unit conversion.');
    } finally {
        hideLoading();
    }
}
const unitOptions = {
    temperature: [
        { value: 'celsius', text: 'Celsius (°C)' },
        { value: 'fahrenheit', text: 'Fahrenheit (°F)' },
        { value: 'kelvin', text: 'Kelvin (K)' }
    ],
    length: [
        { value: 'meters', text: 'Meters (m)' },
        { value: 'kilometers', text: 'Kilometers (km)' },
        { value: 'miles', text: 'Miles (mi)' },
        { value: 'feet', text: 'Feet (ft)' },
        { value: 'inches', text: 'Inches (in)' }
    ],
    mass: [
        { value: 'kilograms', text: 'Kilograms (kg)' },
        { value: 'grams', text: 'Grams (g)' },
        { value: 'pounds', text: 'Pounds (lb)' },
        { value: 'ounces', text: 'Ounces (oz)' }
    ]
};
function populateUnitOptions() {
    const unitType = document.getElementById('unitTypeSelect').value;
    const fromUnitSelect = document.getElementById('fromUnitSelect');
    const toUnitSelect = document.getElementById('toUnitSelect');
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    const options = unitOptions[unitType] || [];
    if (options.length === 0) {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.text = "Select Unit Type First";
        fromUnitSelect.add(defaultOption);
        toUnitSelect.add(defaultOption.cloneNode(true));
        return;
    }
    options.forEach(unit => {
        const optionFrom = document.createElement('option');
        optionFrom.value = unit.value;
        optionFrom.text = unit.text;
        fromUnitSelect.add(optionFrom);
        const optionTo = document.createElement('option');
        optionTo.value = unit.value;
        optionTo.text = unit.text;
        toUnitSelect.add(optionTo);
    });
    if (options.length > 0) {
        fromUnitSelect.value = options[0].value;
        toUnitSelect.value = options[0].value;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    setUniformSectionHeight();
    window.addEventListener('resize', debounce(setUniformSectionHeight, 150));
    showSection('imageConverterSection');
    populateUnitOptions();
    bindCalcToolbar(); 
    fetch('/healthz').then(r => r.json()).then(info => {
        try {
            if (!info.rembg) {
                const btn = document.querySelector("[onclick=\"showSection('bgRemoverSection')\"]");
                if (btn) {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-secondary ms-2';
                    badge.textContent = 'Unavailable';
                    btn.appendChild(badge);
                }
                const alert = document.querySelector('#bgRemoverSection .alert');
                if (alert) {
                    alert.classList.remove('alert-info');
                    alert.classList.add('alert-warning');
                    alert.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i><strong>Note:</strong> Background removal is disabled on this deployment.';
                }
            }
        } catch (_) {}
    }).catch(() => {});
});
function setUniformSectionHeight() {
    const sections = Array.from(document.querySelectorAll('.converter-section'));
    if (sections.length === 0) return;
    let maxHeight = 0;
    const previouslyActive = sections.find(s => s.classList.contains('active'));
    sections.forEach(s => {
        const wasHidden = !s.classList.contains('active');
        if (wasHidden) s.classList.add('active');
        const h = s.scrollHeight;
        if (h > maxHeight) maxHeight = h;
        if (wasHidden) s.classList.remove('active');
    });
    const minHeight = Math.max(520, maxHeight);
    document.documentElement.style.setProperty('--section-min-height', `${minHeight}px`);
}
function debounce(fn, wait) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}
function showSection(sectionId) {
    document.querySelectorAll('.converter-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.list-group-item').forEach(button => {
        button.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    const activeButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}
function showMessageBox(message) {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
function hideMessageBox() {
}
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}
function renderBaseSolutionHTML(solutionText) {
    const stepRegex = /Step \d+:/g;
    const parts = solutionText.split(stepRegex);
    const steps = [];
    let match;
    let lastIndex = 0;
    while ((match = stepRegex.exec(solutionText)) !== null) {
        if (lastIndex !== 0) {
            steps.push({
                title: solutionText.substring(lastIndex, match.index).trim(),
                body: null
            });
        }
        lastIndex = match.index;
    }
    if (lastIndex !== 0) {
        steps.push({
            title: solutionText.substring(lastIndex).trim(),
            body: null
        });
    }
    if (steps.length === 0) {
        return `<pre class="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-blue-100 p-3 rounded-md mt-2">${solutionText}</pre>`;
    }
    let html = '<ol class="list-decimal ml-6 space-y-2">';
    for (const step of steps) {
        let stepHtml = step.title
            .replace(/(\d+\s*\^\s*\d+)/g, '<code>$1</code>')
            .replace(/(=\s*\d+)/g, '<b>$1</b>')
            .replace(/(\b[0-9A-F]+\b)/g, '<b>$1</b>');
        stepHtml = stepHtml.replace(/\n/g, '<br>');
        html += `<li>${stepHtml}</li>`;
    }
    html += '</ol>';
    return html;
}
function insertAtCursor(textarea, token, cursorOffsetFromEnd=0) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const original = textarea.value;
    const before = original.substring(0, start);
    const after = original.substring(end);
    textarea.value = before + token + after;
    let newPos = before.length + token.length + cursorOffsetFromEnd;
    if (newPos < 0) newPos = before.length + token.length; 
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
}
function bindCalcToolbar() {
    const bar = document.getElementById('calcSymbolBar');
    if (!bar) return;
    const textarea = document.getElementById('calculusExpressionInput');
    bar.querySelectorAll('button[data-token]').forEach(btn => {
        btn.addEventListener('click', () => {
            const token = btn.getAttribute('data-token');
            const offsetAttr = btn.getAttribute('data-cursor');
            const offset = offsetAttr ? parseInt(offsetAttr, 10) : 0;
            insertAtCursor(textarea, token, offset);
        });
    });
}
function copyExpression() {
    const textarea = document.getElementById('calculusExpressionInput');
    navigator.clipboard.writeText(textarea.value).then(() => {
        showMessageBox('Expression copied to clipboard');
    }).catch(() => showMessageBox('Failed to copy expression'));
}
function copyLatexResult() {
    const latexEl = document.getElementById('calculusLatex');
    const raw = latexEl.textContent.replace(/^\s*LaTeX:\s*/, '').trim();
    if (!raw) {
        showMessageBox('No LaTeX result to copy');
        return;
    }
    navigator.clipboard.writeText(raw).then(() => {
        showMessageBox('LaTeX result copied');
    }).catch(() => showMessageBox('Failed to copy LaTeX'));
}
function toggleCalculusFields() {
    const op = document.getElementById('calculusOperationSelect').value;
    const orderContainer = document.getElementById('derivativeOrderContainer');
    const boundsRow = document.getElementById('integralBoundsRow');
    if (op === 'derivative') {
        orderContainer.style.display = '';
        boundsRow.style.display = 'none';
    } else {
        orderContainer.style.display = 'none';
        boundsRow.style.display = '';
    }
}
async function computeCalculus() {
    const expr = document.getElementById('calculusExpressionInput').value.trim();
    const variable = document.getElementById('calculusVariableInput').value.trim() || 'x';
    const operation = document.getElementById('calculusOperationSelect').value;
    const orderVal = document.getElementById('calculusOrderInput').value;
    const lower = document.getElementById('calculusLowerInput').value.trim();
    const upper = document.getElementById('calculusUpperInput').value.trim();
    const resultEl = document.getElementById('calculusResult');
    const latexEl = document.getElementById('calculusLatex');
    const stepsEl = document.getElementById('calculusSteps');
    const numericEl = document.getElementById('calculusNumeric');
    resultEl.textContent = '';
    latexEl.textContent = '';
    stepsEl.textContent = '';
    numericEl.textContent = '';
    if (!expr) {
        showMessageBox('Please enter an expression.');
        return;
    }
    const payload = {
        expression: expr,
        operation: operation,
        variable: variable
    };
    if (operation === 'derivative') {
        payload.order = parseInt(orderVal || '1', 10);
    } else { 
        if (lower && upper) {
            payload.lower = lower;
            payload.upper = upper;
        }
    }
    showLoading();
    try {
        const resp = await fetch('/api/calculus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) {
            showMessageBox(`Error: ${data.error || resp.statusText}`);
            return;
        }
        resultEl.textContent = data.result;
        latexEl.innerHTML = data.result_latex ? `$${data.result_latex}$` : '';
        stepsEl.innerHTML = '';
        const plainSteps = data.steps || [];
        const latexSteps = data.steps_latex || [];
        for (let i = 0; i < plainSteps.length; i++) {
            const li = document.createElement('li');
            const latexVersion = latexSteps[i];
            if (latexVersion) {
                li.innerHTML = `$${latexVersion}$` + `<div class="text-muted small">${plainSteps[i]}</div>`;
            } else {
                li.textContent = plainSteps[i];
            }
            stepsEl.appendChild(li);
        }
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([latexEl, stepsEl]).catch(err => console.error(err));
        }
        if (data.definite && data.numeric_approx !== null && data.numeric_approx !== undefined) {
            numericEl.textContent = `Numeric Approximation ≈ ${data.numeric_approx}`;
        } else if (data.definite) {
            numericEl.textContent = 'Numeric approximation unavailable.';
        }
        showMessageBox('Calculus computation successful!');
    } catch (e) {
        console.error(e);
        showMessageBox('Unexpected error during calculus computation.');
    } finally {
        hideLoading();
    }
}