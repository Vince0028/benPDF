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

// Function to handle Image Conversion (from file upload or URL)
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
            a.download = 'converted_image.png'; // Fixed output name
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

// Function to handle Document Conversion
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

// Function to handle Base Conversion
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
            if (data.result) {
                resultDisplay.innerText = data.result;
                // Render solution steps as HTML for better UI
                solutionDisplay.innerHTML = renderBaseSolutionHTML(data.solution);
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


// Function to handle Image to ICO Conversion
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
            let filename = 'converted_icon.ico'; // Default filename

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

// Function to handle Image Resizing
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
            let filename = `resized_image_${width}x${height}`; // Default filename

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

// Function to handle QR Code Generation
async function generateQRCode() {
    const qrcodeUrlInput = document.getElementById('qrcodeUrlInput');
    const qrcodeLogoInput = document.getElementById('qrcodeLogoInput');
    const qrcodePreview = document.getElementById('qrcodePreview');
    const qrcodeImage = document.getElementById('qrcodeImage');
    
    const url = qrcodeUrlInput.value.trim();
    const logoFile = qrcodeLogoInput ? qrcodeLogoInput.files[0] : null;
    
    // Get customization options
    const fgColor = document.getElementById('qrFgColor').value;
    const bgColor = document.getElementById('qrBgColor').value;
    const style = document.querySelector('input[name="qrStyle"]:checked').value;
    const logoSize = document.getElementById('qrLogoSize').value;
    const errorCorrection = document.getElementById('qrErrorCorrection').value;
    
    // Update color text inputs
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
            
            // Create object URL for preview
            const previewUrl = window.URL.createObjectURL(blob);
            qrcodeImage.src = previewUrl;
            qrcodePreview.classList.remove('hidden');
            
            // Also trigger download
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

// NEW: Unit Converter logic
async function convertUnit() {
    const value = document.getElementById('unitValueInput').value;
    const unitType = document.getElementById('unitTypeSelect').value;
    const fromUnit = document.getElementById('fromUnitSelect').value;
    const toUnit = document.getElementById('toUnitSelect').value;
    const resultDisplay = document.getElementById('unitConversionResult');

    resultDisplay.innerText = ''; // Clear previous result

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


// Unit conversion options (defined globally or in the HTML script block)
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

// Function to populate "From Unit" and "To Unit" dropdowns based on Unit Type selection
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

    // Set default selections (e.g., first option)
    if (options.length > 0) {
        fromUnitSelect.value = options[0].value;
        toUnitSelect.value = options[0].value;
    }
}

// Initial setup to show the first section on page load + normalize heights
document.addEventListener('DOMContentLoaded', () => {
    // Compute and lock a consistent min-height across sections
    setUniformSectionHeight();
    window.addEventListener('resize', debounce(setUniformSectionHeight, 150));

    showSection('imageConverterSection');
    populateUnitOptions(); // Populate units for the first time
});

// Determine tallest converter-section and set CSS variable for stable card height
function setUniformSectionHeight() {
    const sections = Array.from(document.querySelectorAll('.converter-section'));
    if (sections.length === 0) return;

    let maxHeight = 0;
    // Temporarily ensure all sections are measurable
    const previouslyActive = sections.find(s => s.classList.contains('active'));
    sections.forEach(s => {
        const wasHidden = !s.classList.contains('active');
        if (wasHidden) s.classList.add('active');
        // Measure natural height
        const h = s.scrollHeight;
        if (h > maxHeight) maxHeight = h;
        if (wasHidden) s.classList.remove('active');
    });
    // Add some breathing room
    const minHeight = Math.max(520, maxHeight);
    document.documentElement.style.setProperty('--section-min-height', `${minHeight}px`);
}

// Simple debounce helper
function debounce(fn, wait) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// Function to handle tab switching (kept in JS file as the single source of truth)
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.converter-section').forEach(section => {
        section.classList.remove('active');
    });

    // Deactivate all list-group-item buttons (Bootstrap sidebar)
    document.querySelectorAll('.list-group-item').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Activate the corresponding sidebar button
    const activeButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Show Toast Notification
function showMessageBox(message) {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function hideMessageBox() {
    // Not needed with Bootstrap toasts
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function renderBaseSolutionHTML(solutionText) {
    // Split into steps by "Step" (preserve numbering)
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
    // Add the last step
    if (lastIndex !== 0) {
        steps.push({
            title: solutionText.substring(lastIndex).trim(),
            body: null
        });
    }
    // If no steps found, fallback to pre block
    if (steps.length === 0) {
        return `<pre class="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-blue-100 p-3 rounded-md mt-2">${solutionText}</pre>`;
    }
    // Render as ordered list
    let html = '<ol class="list-decimal ml-6 space-y-2">';
    for (const step of steps) {
        // Highlight numbers and key results
        let stepHtml = step.title
            .replace(/(\d+\s*\^\s*\d+)/g, '<code>$1</code>')
            .replace(/(=\s*\d+)/g, '<b>$1</b>')
            .replace(/(\b[0-9A-F]+\b)/g, '<b>$1</b>');
        // Add line breaks for substeps
        stepHtml = stepHtml.replace(/\n/g, '<br>');
        html += `<li>${stepHtml}</li>`;
    }
    html += '</ol>';
    return html;
}