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
    if (documentFileInput.files.length === 0) {
        showMessageBox('Please upload a document file.');
        return;
    }

    const file = documentFileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    showLoading();
    try {
        const response = await fetch('/api/convert-document', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const blob = await response.blob();
            const disposition = response.headers.get('Content-Disposition');
            let filename = 'converted_document';

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
            showMessageBox('Document conversion successful! Download started.');
        } else {
            const errorData = await response.json();
            showMessageBox(`Error: ${errorData.error || response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessageBox('An unexpected error occurred during document conversion.');
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

// Initial setup to show the first section on page load
document.addEventListener('DOMContentLoaded', () => {
    showSection('imageConverterSection');
    populateUnitOptions(); // Populate units for the first time
});

// Function to handle tab switching
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.converter-section').forEach(section => {
        section.classList.remove('active');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');

    // Activate the corresponding tab button
    const activeTabButton = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }
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