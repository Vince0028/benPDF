from flask import Flask, request, render_template, send_file, flash, redirect, url_for, jsonify, after_this_request
from PIL import Image
import os
import io
from pdf2docx import Converter as PdfToDocxConverter
import logging
import zipfile
import glob
import re
import tempfile
import sys # Import sys to check platform
import requests # Import requests for URL fetching
import subprocess
import qrcode # Import qrcode for QR code generation

# Conditional import for pywin32, only on Windows
if sys.platform == "win32":
    try:
        import pythoncom
    except ImportError:
        logging.warning("pythoncom not found. docx2pdf conversion might fail on Windows if not installed.")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')

# Configuration for upload and converted folders
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CONVERTED_FOLDER'] = 'converted'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 # 100 MB limit for uploads (Adjusted from previous suggestion)

# Ensure upload and converted directories exist (for local testing mostly)
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
if not os.path.exists(app.config['CONVERTED_FOLDER']):
    os.makedirs(app.config['CONVERTED_FOLDER'])

# Allowed image extensions for image conversion (outputs to PNG)
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
# Allowed document extensions for document conversion
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'doc', 'docx'}
# Allowed extensions for ICO conversion (source images)
ALLOWED_ICO_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def generate_conversion_steps(input_value, source_base, target_base_int, decimal_value):
    """Generates a detailed step-by-step solution for base conversions,
    with a limit on steps for very large numbers."""
    steps = []
    source_base_name = {2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hexadecimal"}[source_base]
    target_base_name = {2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hexadecimal"}[target_base_int]

    # Define a threshold for detailed step generation
    MAX_DETAIL_DECIMAL_VALUE = 100000 # Numbers above this will get high-level steps only
    MAX_DIVISION_STEPS = 50 # Max individual division steps to show for numbers below threshold

    # Step 1: Convert source to Decimal (if not already decimal)
    if source_base != 10:
        steps.append(f"Step 1: Convert {source_base_name} {input_value} to Decimal.")
        if decimal_value <= MAX_DETAIL_DECIMAL_VALUE:
            if source_base == 2 or source_base == 8 or source_base == 16:
                power_base = source_base
                expanded_form = []
                for i, digit in enumerate(reversed(input_value)):
                    if source_base == 16:
                        digit_val = int(digit, 16)
                        expanded_form.append(f"({str(digit_val)}×{power_base}^{i})")
                    else:
                        expanded_form.append(f"({digit}×{power_base}^{i})")
                decimal_calc_str = " + ".join(expanded_form[::-1]) # Reverse to show highest power first
                steps.append(f"   Method: Multiply each digit by {power_base} raised to its position (right to left, starting from 0), then sum the results.")
                steps.append(f"   {input_value} = {decimal_calc_str} = {decimal_value}")
        else:
            steps.append(f"   Due to the large size of the number, detailed step-by-step expansion is omitted.")
            steps.append(f"   Converted to Decimal: {decimal_value}")
    else:
        steps.append(f"Step 1: Source is already Decimal: {input_value}")
        
    # Step 2: Convert Decimal to Target Base (if not already target base)
    if target_base_int != 10:
        steps.append(f"\nStep 2: Convert Decimal {decimal_value} to {target_base_name}.")
        
        if decimal_value <= MAX_DETAIL_DECIMAL_VALUE:
            steps.append(f"   Method: Divide the decimal number by {target_base_int} repeatedly and collect the remainders in reverse order.")
            
            current_num = decimal_value
            remainders = []
            division_steps_detail = []
            step_count = 0
            while current_num > 0 and step_count < MAX_DIVISION_STEPS:
                remainder = current_num % target_base_int
                display_remainder = ""
                if target_base_int == 16:
                    display_remainder = format(remainder, 'X')
                else:
                    display_remainder = str(remainder)
                
                remainders.append(display_remainder)
                division_steps_detail.append(f"   {current_num} ÷ {target_base_int} = {current_num // target_base_int} R{display_remainder}")
                current_num //= target_base_int
                step_count += 1
            
            if decimal_value == 0: # Handle input 0 explicitly
                 steps.append(f"   0 ÷ {target_base_int} = 0 R0")
                 remainders.append("0")

            steps.extend(division_steps_detail)
            if current_num > 0: # If steps were truncated
                steps.append(f"   ... (remaining steps omitted due to length)")
            final_result = "".join(remainders[::-1]) # Reverse remainders to get final result
            steps.append(f"   Collect remainders in reverse: {final_result}")
        else:
            steps.append(f"   Due to the large size of the number, detailed division steps are omitted.")
            # Recompute converted_value here to be safe and consistent with the actual conversion later
            if target_base_int == 2:
                final_converted_value = bin(decimal_value)[2:] # Remove "0b" prefix
            elif target_base_int == 8:
                final_converted_value = oct(decimal_value)[2:] # Remove "0o" prefix
            elif target_base_int == 10:
                final_converted_value = str(decimal_value)
            elif target_base_int == 16:
                final_converted_value = hex(decimal_value)[2:].upper() # Remove "0x" prefix and make uppercase
            steps.append(f"   Final Result: {final_converted_value}")
    else:
        steps.append(f"\nStep 2: Target is already Decimal: {decimal_value}")

    return "\n".join(steps)

def convert_docx_to_pdf(input_path, output_path):
    """Convert DOCX to PDF using multiple fallback methods"""
    
    # Import os at function level so it's available for all methods
    import os
    
    # Method 1: Try using comtypes (Windows)
    if sys.platform == "win32":
        try:
            import comtypes.client
            import pythoncom
            pythoncom.CoInitialize()
            try:
                word = comtypes.client.CreateObject('Word.Application')
                word.Visible = False
                # Convert paths to absolute paths
                abs_input = os.path.abspath(input_path)
                abs_output = os.path.abspath(output_path)
                doc = word.Documents.Open(abs_input)
                doc.SaveAs(abs_output, FileFormat=17)  # 17 = wdFormatPDF
                doc.Close()
                word.Quit()
                logger.info("DOCX to PDF conversion successful using comtypes/Word")
                return
            finally:
                pythoncom.CoUninitialize()
        except ImportError:
            logger.warning("comtypes not installed, trying next method...")
        except Exception as e:
            logger.warning(f"comtypes/Word conversion failed: {e}, trying next method...")
    
    # Method 2: Try LibreOffice
    try:
        # Try different LibreOffice executable names
        libreoffice_commands = ['libreoffice', 'soffice', 'C:\\Program Files\\LibreOffice\\program\\soffice.exe']
        
        success = False
        for cmd in libreoffice_commands:
            try:
                subprocess.run([
                    cmd,
                    "--headless",
                    "--convert-to", "pdf",
                    "--outdir", os.path.dirname(output_path),
                    input_path
                ], check=True, capture_output=True)
                
                # LibreOffice creates the PDF with the same name as input
                generated_pdf = os.path.join(
                    os.path.dirname(output_path),
                    os.path.splitext(os.path.basename(input_path))[0] + '.pdf'
                )
                
                if os.path.exists(generated_pdf):
                    if generated_pdf != output_path:
                        os.rename(generated_pdf, output_path)
                    logger.info(f"DOCX to PDF conversion successful using {cmd}")
                    success = True
                    break
            except (FileNotFoundError, subprocess.CalledProcessError):
                continue
        
        if success:
            return
    except Exception as e:
        logger.warning(f"LibreOffice conversion failed: {e}")
    
    # If all methods fail, raise an error with helpful message
    error_msg = (
        "DOCX to PDF conversion failed. Please install one of the following:\n"
        "1. Microsoft Word (Windows)\n"
        "2. LibreOffice (Download from https://www.libreoffice.org/)\n"
        "Or install comtypes: pip install comtypes"
    )
    raise RuntimeError(error_msg)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/convert-image', methods=['POST'])
def convert_image_api():
    logger.info("Received request for image conversion (to PNG).")
    file = None
    image_url = None

    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        logger.info(f"File uploaded: {file.filename}")
        if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            logger.warning(f"Invalid image file extension: {file.filename}")
            return jsonify({'error': 'Invalid image file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
    elif 'url' in request.form and request.form['url'].strip() != '':
        image_url = request.form['url'].strip()
        logger.info(f"Image URL provided: {image_url}")
        if not (image_url.startswith('http://') or image_url.startswith('https://')):
            logger.warning(f"Invalid URL format: {image_url}")
            return jsonify({'error': 'Invalid URL format. Must start with http:// or https://'}), 400
    else:
        logger.warning("No file or URL provided for image conversion.")
        return jsonify({'error': 'No image file uploaded or URL provided.'}), 400

    output_buffer = io.BytesIO()
    converted_filename = "converted_image.png" # Output format is fixed to PNG here

    try:
        img = None
        if file:
            # Read file content for analysis
            file.stream.seek(0)
            file_content = file.stream.read()
            logger.info(f"Read {len(file_content)} bytes from uploaded file")
            
            # Detect file format by signature
            detected_format = None
            if len(file_content) >= 12:
                if file_content[:2] == b'\xff\xd8':
                    detected_format = 'JPEG'
                elif file_content[:8] == b'\x89PNG\r\n\x1a\n':
                    detected_format = 'PNG'
                elif b'ftyp' in file_content[:12]:
                    if b'avif' in file_content[:32] or b'avis' in file_content[:32]:
                        detected_format = 'AVIF'
                    elif b'heic' in file_content[:32] or b'heix' in file_content[:32] or b'mif1' in file_content[:32]:
                        detected_format = 'HEIF'
                    else:
                        detected_format = 'HEIF'
                    logger.info(f"Detected HEIF/AVIF format file")
            
            # Register HEIF support
            try:
                from pillow_heif import register_heif_opener
                register_heif_opener()
            except ImportError:
                pass
            
            # Try multiple methods to open the image
            try:
                # Method 1: Direct BytesIO
                img = Image.open(io.BytesIO(file_content))
                logger.info(f"Image opened successfully (Method 1), format: {img.format}")
            except Exception as e1:
                logger.warning(f"Method 1 failed: {e1}")
                
                # Method 1b: If HEIF/AVIF, try pillow_heif directly
                img = None
                if detected_format in ['AVIF', 'HEIF']:
                    try:
                        import pillow_heif
                        heif_file = pillow_heif.read_heif(io.BytesIO(file_content))
                        img = Image.frombytes(
                            heif_file.mode,
                            heif_file.size,
                            heif_file.data,
                            "raw"
                        )
                        logger.info(f"Image opened successfully (Method 1b: pillow_heif direct), size: {img.size}")
                    except Exception as e1b:
                        logger.warning(f"Method 1b (pillow_heif direct) failed: {e1b}")
                
                # Method 2: OpenCV
                if not img:
                    try:
                        import cv2
                        import numpy as np
                        nparr = np.frombuffer(file_content, np.uint8)
                        img_cv = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
                        if img_cv is not None:
                            if len(img_cv.shape) == 3 and img_cv.shape[2] == 3:
                                img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
                            elif len(img_cv.shape) == 3 and img_cv.shape[2] == 4:
                                img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGRA2RGBA)
                            img = Image.fromarray(img_cv)
                            logger.info("Image opened successfully (Method 2: OpenCV)")
                        else:
                            raise Exception("OpenCV decode failed")
                    except Exception as e2:
                        logger.warning(f"Method 2 failed: {e2}")
                        
                        # Method 3: Temp file with correct extension
                        if detected_format in ['AVIF', 'HEIF']:
                            file_ext = '.avif' if detected_format == 'AVIF' else '.heic'
                            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                                temp_file.write(file_content)
                                temp_path = temp_file.name
                            try:
                                img = Image.open(temp_path)
                                logger.info(f"Image opened successfully (Method 3: temp file with {file_ext})")
                            finally:
                                if os.path.exists(temp_path):
                                    os.remove(temp_path)
                        else:
                            raise Exception("All methods failed")
            
            if not img:
                raise Image.UnidentifiedImageError("Could not open image with any method")
                
        elif image_url:
            logger.info(f"Attempting to fetch image from URL: {image_url}")
            response = requests.get(image_url, stream=True)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))
            logger.info("Image fetched from URL successfully.")

        # Ensure image is in RGB or RGBA mode for consistent saving
        if img.mode not in ['RGB', 'RGBA']:
            img = img.convert('RGB')
        
        img.save(output_buffer, format='PNG')
        output_buffer.seek(0)

        logger.info("Image converted to PNG in memory.")

        response = send_file(
            output_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name=converted_filename
        )
        logger.info(f"Sending converted image: {converted_filename}")
        return response

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching URL: {e}")
        return jsonify({'error': f"Failed to fetch image from URL: {e}. Please ensure it's a valid, accessible image URL."}), 500
    except Image.UnidentifiedImageError:
        logger.error("Uploaded file/URL content is not a recognized image format.")
        return jsonify({'error': 'Could not identify image file. Please ensure it is a valid image.'}), 400
    except Exception as e:
        logger.exception("An unexpected error occurred during image conversion.")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500


@app.route('/api/convert-document', methods=['POST'])
def convert_document_api():
    logger.info("Received request for document conversion.")
    if 'file' not in request.files or not request.files['file'] or not request.files['file'].filename:
        logger.warning("No document file provided for conversion.")
        return jsonify({'error': 'No document file uploaded.'}), 400

    file = request.files['file']
    filename = file.filename or ""
    logger.info(f"Document file uploaded: {filename}")

    if not allowed_file(filename, ALLOWED_DOCUMENT_EXTENSIONS):
        logger.warning(f"Invalid document file extension: {filename}")
        return jsonify({'error': 'Invalid document file type. Allowed: PDF, DOC, DOCX'}), 400

    input_filepath = None
    output_filepath = None

    try:
        # Create a temporary file for the input
        input_file_ext = os.path.splitext(filename)[1]
        # Use tempfile.NamedTemporaryFile to manage temporary file paths
        with tempfile.NamedTemporaryFile(delete=False, suffix=input_file_ext) as input_temp_file:
            file.save(input_temp_file.name)
            input_filepath = input_temp_file.name
        
        logger.info(f"Saved uploaded file to temporary path: {input_filepath}")

        converted_output_filename = ""
        mimetype = ""

        if filename.lower().endswith('.pdf'):
            converted_output_filename = os.path.splitext(filename)[0] + '.docx'
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as output_temp_file:
                output_filepath = output_temp_file.name

            logger.info(f"Converting PDF to DOCX. Output: {output_filepath}")
            cv = PdfToDocxConverter(input_filepath)
            cv.convert(output_filepath, start=0)
            cv.close()
            mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            logger.info("PDF to DOCX conversion complete.")

        elif filename.lower().endswith('.docx'):
            converted_output_filename = os.path.splitext(filename)[0] + '.pdf'
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as output_temp_file:
                output_filepath = output_temp_file.name

            logger.info(f"Converting DOCX to PDF using LibreOffice. Output: {output_filepath}")
            try:
                convert_docx_to_pdf(input_filepath, output_filepath)
            except Exception as e:
                logger.error(f"DOCX to PDF conversion failed: {e}")
                return jsonify({'error': f'DOCX to PDF conversion failed: {e}'}), 500
            mimetype = 'application/pdf'
            logger.info("DOCX to PDF conversion complete.")
        elif filename.lower().endswith('.doc'):
            logger.warning(".doc files are not supported for DOCX to PDF conversion. Only .docx files are supported.")
            return jsonify({'error': '.doc files are not supported for conversion. Please upload a .docx file.'}), 400
        else:
            logger.warning(f"Unsupported document file type for conversion: {filename}")
            return jsonify({'error': 'Unsupported document file type.'}), 400

        # Register a cleanup function to run after the response is sent
        @after_this_request
        def remove_temp_files(response):
            try:
                if input_filepath and os.path.exists(input_filepath):
                    os.remove(input_filepath)
                    logger.info(f"Cleaned up temporary input file: {input_filepath}")
                if output_filepath and os.path.exists(output_filepath):
                    os.remove(output_filepath)
                    logger.info(f"Cleaned up temporary output file: {output_filepath}")
            except Exception as e:
                logger.error(f"Error during temporary file cleanup: {e}")
            return response

        response = send_file(
            output_filepath,
            mimetype=mimetype,
            as_attachment=True,
            download_name=converted_output_filename
        )
        logger.info(f"Sending converted document: {converted_output_filename}")
        return response

    except Exception as e:
        logger.exception("An error occurred during document conversion.")
        # Attempt to clean up files immediately if an error occurs before response is sent
        if input_filepath and os.path.exists(input_filepath):
            try:
                os.remove(input_filepath)
                logger.info(f"Cleaned up input file on error: {input_filepath}")
            except Exception as cleanup_e:
                logger.error(f"Error cleaning up input file on error: {cleanup_e}")
        if output_filepath and os.path.exists(output_filepath):
            try:
                os.remove(output_filepath)
                logger.info(f"Cleaned up output file on error: {output_filepath}")
            except Exception as cleanup_e:
                logger.error(f"Error cleaning up output file on error: {cleanup_e}")
        return jsonify({'error': f'An error occurred during conversion: {e}'}), 500


@app.route('/api/convert-base', methods=['POST'])
def convert_base_api():
    logger.info("Received request for base conversion.")
    data = request.json
    if not data:
        logger.warning("No JSON data provided for base conversion.")
        return jsonify({'error': 'No JSON data provided.'}), 400
    input_value = data.get('inputValue')
    source_base_str = data.get('sourceBase')
    target_base_str = data.get('targetBase')

    if not all([input_value, source_base_str, target_base_str]):
        logger.warning("Missing input for base conversion.")
        return jsonify({'error': 'Missing input value, source base, or target base.'}), 400

    # Map string bases to integer bases and their display names
    base_map = {
        'binary': {'int': 2, 'name': 'Binary'},
        'decimal': {'int': 10, 'name': 'Decimal'},
        'octal': {'int': 8, 'name': 'Octal'},
        'hexadecimal': {'int': 16, 'name': 'Hexadecimal'}
    }
    
    source_info = base_map.get(source_base_str)
    target_info = base_map.get(target_base_str)

    if source_info is None or target_info is None:
        logger.warning(f"Invalid source or target base specified: {source_base_str} -> {target_base_str}")
        return jsonify({'error': 'Invalid source or target base. Choose from binary, decimal, octal, hexadecimal.'}), 400

    source_base = source_info['int']
    target_base = target_info['int']
    
    # Input validation based on source base
    input_value = input_value.upper() # Convert hex input to uppercase for consistency
    if source_base == 2:
        if not re.fullmatch(r'[01]+', input_value):
            return jsonify({'error': 'Invalid binary input. Must contain only 0s and 1s.'}), 400
    elif source_base == 8:
        if not re.fullmatch(r'[0-7]+', input_value):
            return jsonify({'error': 'Invalid octal input. Must contain digits 0-7.'}), 400
    elif source_base == 10:
        if not re.fullmatch(r'[0-9]+', input_value):
            return jsonify({'error': 'Invalid decimal input. Must contain only 0-9.'}), 400
    elif source_base == 16:
        if not re.fullmatch(r'[0-9A-F]+', input_value):
            return jsonify({'error': 'Invalid hexadecimal input. Must contain 0-9 and A-F.'}), 400

    try:
        # Convert input_value to an integer (decimal representation)
        decimal_value = int(input_value, source_base)
        logger.info(f"Converted '{input_value}' from base {source_base} to decimal: {decimal_value}")

        # Convert decimal_value to the target base
        converted_value = ""
        if target_base == 2:
            converted_value = bin(decimal_value)[2:] # Remove "0b" prefix
        elif target_base == 8:
            converted_value = oct(decimal_value)[2:] # Remove "0o" prefix
        elif target_base == 10:
            converted_value = str(decimal_value)
        elif target_base == 16:
            converted_value = hex(decimal_value)[2:].upper() # Remove "0x" prefix and make uppercase
        
        logger.info(f"Converted decimal '{decimal_value}' to base {target_base}: {converted_value}")

        # Generate solution steps
        # Pass converted_value to generate_conversion_steps to handle summarized output
        solution_steps = generate_conversion_steps(input_value, source_base, target_base, decimal_value)
        
        return jsonify({'result': converted_value, 'solution': solution_steps}), 200

    except ValueError as e:
        logger.error(f"ValueError during base conversion: {e}")
        return jsonify({'error': 'Invalid number format for the specified source base.'}), 400
    except Exception as e:
        logger.exception("An unexpected error occurred during base conversion.")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500

@app.route('/api/convert-to-ico', methods=['POST'])
def convert_to_ico_api():
    logger.info("Received request for image to ICO conversion.")
    if 'file' not in request.files or not request.files['file'] or not request.files['file'].filename:
        logger.warning("No image file provided for ICO conversion.")
        return jsonify({'error': 'No image file uploaded.'}), 400

    file = request.files['file']
    filename = file.filename or ""
    logger.info(f"Image file uploaded for ICO conversion: {filename}")

    if not allowed_file(filename, ALLOWED_ICO_EXTENSIONS):
        logger.warning(f"Invalid image file extension for ICO conversion: {filename}")
        return jsonify({'error': 'Invalid image file type for ICO. Allowed: PNG, JPG, JPEG, WEBP'}), 400

    temp_ico_filepath = None
    try:
        img = Image.open(file.stream)
        logger.info(f"Image '{filename}' opened for ICO conversion.")

        # Ensure image has an alpha channel for better ICO quality
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        # Create multiple sizes for the ICO file
        icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        
        # Filter sizes to ensure they are not larger than original image
        available_sizes = []
        for size in icon_sizes:
            if size[0] <= img.width and size[1] <= img.height:
                available_sizes.append(size)
        
        # If original image is smaller than smallest icon size, use original size
        if not available_sizes:
            available_sizes = [(img.width, img.height)]

        with tempfile.NamedTemporaryFile(delete=False, suffix=".ico") as temp_file:
            temp_ico_filepath = temp_file.name
            img.save(temp_ico_filepath, format='ICO', sizes=available_sizes)
        
        logger.info(f"Image converted to ICO: {temp_ico_filepath}")

        # Register a cleanup function
        @after_this_request
        def remove_temp_ico_file(response):
            try:
                if temp_ico_filepath and os.path.exists(temp_ico_filepath):
                    os.remove(temp_ico_filepath)
                    logger.info(f"Cleaned up temporary ICO file: {temp_ico_filepath}")
            except Exception as e:
                logger.error(f"Error during temporary ICO file cleanup: {e}")
            return response

        original_filename_no_ext = os.path.splitext(filename)[0]
        download_filename = f"{original_filename_no_ext}.ico"

        response = send_file(
            temp_ico_filepath,
            mimetype='image/x-icon',
            as_attachment=True,
            download_name=download_filename
        )
        logger.info(f"Sending converted ICO file: {download_filename}")
        return response

    except Image.UnidentifiedImageError:
        logger.error("Uploaded file for ICO conversion is not a recognized image format.")
        return jsonify({'error': 'Could not identify image file. Please ensure it is a valid image.'}), 400
    except Exception as e:
        logger.exception("An error occurred during image to ICO conversion.")
        if temp_ico_filepath and os.path.exists(temp_ico_filepath):
            try:
                os.remove(temp_ico_filepath)
            except Exception as cleanup_e:
                logger.error(f"Error cleaning up ICO temp file on error: {cleanup_e}")
        return jsonify({'error': f'An error occurred during ICO conversion: {e}'}), 500

@app.route('/api/resize-image', methods=['POST'])
def resize_image_api():
    logger.info("Received request for image resizing.")
    if 'file' not in request.files or not request.files['file'] or not request.files['file'].filename:
        logger.warning("No image file provided for resizing.")
        return jsonify({'error': 'No image file uploaded.'}), 400

    file = request.files['file']
    filename = file.filename or ""
    target_width_str = request.form.get('width')
    target_height_str = request.form.get('height')
    
    logger.info(f"Image file uploaded for resizing: {filename}, Target dimensions: {target_width_str}x{target_height_str}")

    if not allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS): # Use same allowed extensions as general image converter
        logger.warning(f"Invalid image file extension for resizing: {filename}")
        return jsonify({'error': 'Invalid image file type for resizing. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
    
    if not target_width_str or not target_height_str:
        logger.warning("Missing width or height for image resizing.")
        return jsonify({'error': 'Missing target width or height.'}), 400
    
    try:
        target_width = int(target_width_str)
        target_height = int(target_height_str)
        if target_width <= 0 or target_height <= 0:
            return jsonify({'error': 'Width and height must be positive integers.'}), 400
    except ValueError:
        return jsonify({'error': 'Width and height must be valid integers.'}), 400

    output_buffer = io.BytesIO()
    original_filename_no_ext = os.path.splitext(filename)[0]
    original_ext = os.path.splitext(filename)[1].lower()
    download_filename = f"{original_filename_no_ext}_resized_{target_width}x{target_height}{original_ext}"
    
    try:
        img = Image.open(file.stream)
        logger.info(f"Image '{filename}' opened for resizing.")

        # Set up a compatible LANCZOS filter for Pillow >=9.1.0 and fallback for older versions
        try:
            from PIL.Image import Resampling
            LANCZOS_FILTER = Resampling.LANCZOS
        except ImportError:
            LANCZOS_FILTER = getattr(Image, 'LANCZOS', None)
            if LANCZOS_FILTER is None:
                raise ImportError('No LANCZOS filter found in PIL.Image. Please update your Pillow library.')
        # Resize the image
        resized_img = img.resize((target_width, target_height), LANCZOS_FILTER) # LANCZOS for high quality downsampling
        
        # Preserve original format if possible, otherwise default to PNG
        output_format = 'PNG'
        mimetype = 'image/png'
        if original_ext in ['.jpg', '.jpeg']:
            output_format = 'JPEG'
            mimetype = 'image/jpeg'
        elif original_ext == '.gif':
            output_format = 'GIF'
            mimetype = 'image/gif'
        elif original_ext == '.webp':
            output_format = 'WEBP'
            mimetype = 'image/webp'

        # Convert to RGB if saving as JPEG, as JPEG does not support alpha channel
        if output_format == 'JPEG' and resized_img.mode == 'RGBA':
            resized_img = resized_img.convert('RGB')
        
        resized_img.save(output_buffer, format=output_format)
        output_buffer.seek(0)
        
        logger.info(f"Image resized to {target_width}x{target_height} and saved to buffer.")

        response = send_file(
            output_buffer,
            mimetype=mimetype,
            as_attachment=True,
            download_name=download_filename
        )
        logger.info(f"Sending resized image: {download_filename}")
        return response

    except Image.UnidentifiedImageError:
        logger.error("Uploaded file for resizing is not a recognized image format.")
        return jsonify({'error': 'Could not identify image file. Please ensure it is a valid image.'}), 400
    except Exception as e:
        logger.exception("An error occurred during image resizing.")
        return jsonify({'error': f'An error occurred during image resizing: {e}'}), 500

@app.route('/api/generate-qrcode', methods=['POST'])
def generate_qrcode_api():
    logger.info("Received request for QR code generation.")
    # Accept both JSON and form-data (for file upload)
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        url = request.form.get('url')
        logo_file = request.files.get('logo')
        fg_color = request.form.get('fgColor', '#000000')
        bg_color = request.form.get('bgColor', '#ffffff')
        style = request.form.get('style', 'square')
        logo_size_percent = int(request.form.get('logoSize', '30'))
        error_correction_level = request.form.get('errorCorrection', 'H')
    else:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided.'}), 400
        url = data.get('url')
        logo_file = None
        fg_color = data.get('fgColor', '#000000')
        bg_color = data.get('bgColor', '#ffffff')
        style = data.get('style', 'square')
        logo_size_percent = int(data.get('logoSize', '30'))
        error_correction_level = data.get('errorCorrection', 'H')

    if not url or url.strip() == '':
        return jsonify({'error': 'No URL provided for QR code generation.'}), 400
    url = url.strip()

    try:
        # Map error correction level
        error_correction_map = {
            'L': qrcode.constants.ERROR_CORRECT_L,
            'M': qrcode.constants.ERROR_CORRECT_M,
            'Q': qrcode.constants.ERROR_CORRECT_Q,
            'H': qrcode.constants.ERROR_CORRECT_H
        }
        error_correction = error_correction_map.get(error_correction_level, qrcode.constants.ERROR_CORRECT_H)
        
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_correction,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # Use qrcode.image.styledpil.StyledPilImage for styled modules if requested
        qr_img = None
        if style == 'rounded':
            try:
                from qrcode.image.styledpil import StyledPilImage
                from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
                qr_img = qr.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer(), fill_color=fg_color, back_color=bg_color).convert('RGBA')
            except Exception as e:
                logger.warning(f"Failed to use rounded style: {e}")
                qr_img = qr.make_image(fill_color=fg_color, back_color=bg_color).convert('RGBA')
        elif style == 'dots':
            try:
                from qrcode.image.styledpil import StyledPilImage
                from qrcode.image.styles.moduledrawers import CircleModuleDrawer
                qr_img = qr.make_image(image_factory=StyledPilImage, module_drawer=CircleModuleDrawer(), fill_color=fg_color, back_color=bg_color).convert('RGBA')
            except Exception as e:
                logger.warning(f"Failed to use dots style: {e}")
                qr_img = qr.make_image(fill_color=fg_color, back_color=bg_color).convert('RGBA')
        else:
            qr_img = qr.make_image(fill_color=fg_color, back_color=bg_color).convert('RGBA')

        # If logo is provided, embed it in the center
        qr_width, qr_height = qr_img.size
        logo_size = int(min(qr_width, qr_height) * (logo_size_percent / 100.0))
        from PIL import ImageDraw
        logger.info(f"Logo file check: logo_file = {logo_file}, type = {type(logo_file)}")
        if logo_file and logo_file.filename:
            logo_img = None
            try:
                logger.info(f"Logo file received: {logo_file.filename}, content_type: {logo_file.content_type}")
                
                # Read file content
                logo_file.stream.seek(0)
                file_content = logo_file.stream.read()
                logger.info(f"Read {len(file_content)} bytes from upload")
                
                # Diagnostic: Check file signature (magic bytes)
                if len(file_content) >= 8:
                    magic_bytes = file_content[:8]
                    logger.info(f"File signature (first 8 bytes): {magic_bytes.hex()}")
                    
                    # Detect actual file format from signature
                    detected_format = None
                    if file_content[:2] == b'\xff\xd8':
                        detected_format = 'JPEG'
                        logger.info("Detected JPEG signature")
                    elif file_content[:8] == b'\x89PNG\r\n\x1a\n':
                        detected_format = 'PNG'
                        logger.info("Detected PNG signature")
                    elif file_content[:4] in [b'RIFF', b'WEBP']:
                        detected_format = 'WEBP'
                        logger.info("Detected WebP signature")
                    elif file_content[:4] == b'GIF8':
                        detected_format = 'GIF'
                        logger.info("Detected GIF signature")
                    elif b'ftyp' in file_content[:12]:
                        # HEIF/AVIF container format
                        if b'avif' in file_content[:32] or b'avis' in file_content[:32]:
                            detected_format = 'AVIF'
                            logger.info("Detected AVIF signature")
                        elif b'heic' in file_content[:32] or b'heix' in file_content[:32] or b'mif1' in file_content[:32]:
                            detected_format = 'HEIF'
                            logger.info("Detected HEIF/HEIC signature")
                        else:
                            detected_format = 'HEIF'
                            logger.info("Detected HEIF-based container (could be AVIF or HEIC)")
                    else:
                        logger.warning(f"Unknown or invalid image signature - file may be corrupted or not an image")
                
                # Try to register HEIF/AVIF support if available
                try:
                    from pillow_heif import register_heif_opener
                    register_heif_opener()
                    logger.info("HEIF/AVIF support registered")
                except ImportError:
                    logger.warning("pillow-heif not available, HEIF/AVIF formats won't be supported")
                
                # Method 1: Try reading directly from BytesIO
                try:
                    logo_img = Image.open(io.BytesIO(file_content))
                    # For JPEG files, verify and load the data
                    if hasattr(logo_img, 'format') and logo_img.format == 'JPEG':
                        logo_img.load()  # Force load to verify
                    logger.info(f"Method 1 SUCCESS - Logo format: {logo_img.format}, mode: {logo_img.mode}, size: {logo_img.size}")
                except Exception as e1:
                    logger.warning(f"Method 1 (BytesIO) failed: {e1}")
                    
                    # Method 1b: If it's HEIF/AVIF, try pillow_heif directly
                    if detected_format in ['AVIF', 'HEIF']:
                        try:
                            import pillow_heif
                            heif_file = pillow_heif.read_heif(io.BytesIO(file_content))
                            logo_img = Image.frombytes(
                                heif_file.mode,
                                heif_file.size,
                                heif_file.data,
                                "raw"
                            )
                            logger.info(f"Method 1b SUCCESS - pillow_heif direct read, size: {logo_img.size}")
                        except Exception as e1b:
                            logger.warning(f"Method 1b (pillow_heif direct) failed: {e1b}")
                            logo_img = None
                    
                    # Method 2: Try using opencv to read and convert
                    if not logo_img:
                        try:
                            import cv2
                            import numpy as np
                        
                            # Decode image with opencv
                            nparr = np.frombuffer(file_content, np.uint8)
                            img_cv = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
                            
                            if img_cv is not None:
                                # Convert BGR to RGB (opencv uses BGR)
                                if len(img_cv.shape) == 3 and img_cv.shape[2] == 3:
                                    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
                                elif len(img_cv.shape) == 3 and img_cv.shape[2] == 4:
                                    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGRA2RGBA)
                                
                                # Convert to PIL Image
                                logo_img = Image.fromarray(img_cv)
                                logger.info(f"Method 2 SUCCESS - OpenCV conversion succeeded, size: {logo_img.size}")
                            else:
                                raise Exception("OpenCV could not decode image")
                        except Exception as e2:
                            logger.warning(f"Method 2 (OpenCV) failed: {e2}")
                        
                        # Method 3: Try saving to temp file with correct extension based on signature
                        try:
                            # Use detected format to determine correct extension
                            if detected_format == 'AVIF':
                                file_ext = '.avif'
                            elif detected_format == 'HEIF':
                                file_ext = '.heic'
                            elif detected_format:
                                file_ext = f'.{detected_format.lower()}'
                            else:
                                # Fallback to original extension
                                file_ext = os.path.splitext(logo_file.filename)[1] or '.jpg'
                            
                            logger.info(f"Trying temp file method with extension: {file_ext}")
                            
                            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                                temp_file.write(file_content)
                                temp_path = temp_file.name
                            
                            try:
                                # Try to open with PIL
                                logo_img = Image.open(temp_path)
                                logo_img.load()  # Force load
                                logger.info(f"Method 3 SUCCESS - Temp file method succeeded, format: {logo_img.format}")
                            except Exception as e3_inner:
                                logger.warning(f"Method 3a (temp file PIL) failed: {e3_inner}")
                                
                                # Try with opencv as last resort
                                img_cv = cv2.imread(temp_path, cv2.IMREAD_UNCHANGED)
                                if img_cv is not None:
                                    if len(img_cv.shape) == 3 and img_cv.shape[2] == 3:
                                        img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
                                    elif len(img_cv.shape) == 3 and img_cv.shape[2] == 4:
                                        img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGRA2RGBA)
                                    logo_img = Image.fromarray(img_cv)
                                    logger.info(f"Method 3b SUCCESS - OpenCV from temp file succeeded")
                                else:
                                    raise Exception("OpenCV could not read temp file")
                            finally:
                                # Clean up temp file
                                if os.path.exists(temp_path):
                                    os.remove(temp_path)
                        except Exception as e3:
                            logger.warning(f"Method 3 (temp file) failed: {e3}")
                            
                            # All methods failed - log detailed error and skip logo
                            logger.error(f"All image decoding methods failed for {logo_file.filename}. The file may be corrupted or in an unsupported format. QR code will be generated without logo.")
                            logo_img = None
                
                # If we successfully loaded the image, embed it in the QR code
                if logo_img:
                    logo_img = logo_img.convert('RGBA')
                    logo_img = logo_img.resize((logo_size, logo_size), Image.LANCZOS)
                    pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
                    qr_img.paste(logo_img, pos, mask=logo_img)
                    logger.info(f"Logo pasted successfully at position {pos} with size {logo_size}x{logo_size}")
                else:
                    logger.warning("Logo could not be loaded - QR code generated without logo")
                
            except Exception as e:
                import traceback
                logger.error(f"Failed to embed logo: {e}\n{traceback.format_exc()}")
                # Only fallback to red circle if logo processing fails
                overlay = Image.new('RGBA', (logo_size, logo_size), (255, 0, 0, 0))
                draw = ImageDraw.Draw(overlay)
                draw.ellipse((0, 0, logo_size, logo_size), fill=(255, 0, 0, 180))
                pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
                qr_img.paste(overlay, pos, mask=overlay)
        else:
            logger.info("No logo file provided or filename is empty")
        # If no logo_file, do not overlay anything (no red spot)

        output_buffer = io.BytesIO()
        qr_img.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        logger.info(f"QR code generated successfully for URL: {url}")
        response = send_file(
            output_buffer,
            mimetype='image/png',
            as_attachment=True,
            download_name='qrcode.png'
        )
        return response
    except Exception as e:
        logger.exception("An error occurred during QR code generation.")
        return jsonify({'error': f'An error occurred during QR code generation: {e}'}), 500

@app.route('/api/convert-unit', methods=['POST'])
def convert_unit_api():
    logger.info("Received request for unit conversion.")
    data = request.json
    if not data:
        return jsonify({'error': 'No JSON data provided.'}), 400
    value = data.get('value')
    from_unit = data.get('fromUnit')
    to_unit = data.get('toUnit')
    unit_type = data.get('unitType') # e.g., 'temperature', 'length', 'mass'

    if None in [value, from_unit, to_unit, unit_type]:
        return jsonify({'error': 'Missing value, source unit, target unit, or unit type.'}), 400

    try:
        value = float(value)
    except ValueError:
        return jsonify({'error': 'Invalid number for value.'}), 400

    converted_value = None

    if unit_type == 'temperature':
        # Convert all to Celsius first, then to target
        if from_unit == 'celsius':
            celsius = value
        elif from_unit == 'fahrenheit':
            celsius = (value - 32) * 5/9
        elif from_unit == 'kelvin':
            celsius = value - 273.15
        else:
            return jsonify({'error': 'Invalid source temperature unit.'}), 400

        if to_unit == 'celsius':
            converted_value = celsius
        elif to_unit == 'fahrenheit':
            converted_value = (celsius * 9/5) + 32
        elif to_unit == 'kelvin':
            converted_value = celsius + 273.15
        else:
            return jsonify({'error': 'Invalid target temperature unit.'}), 400
    
    elif unit_type == 'length':
        # Convert all to meters first, then to target
        if from_unit == 'meters':
            meters = value
        elif from_unit == 'kilometers':
            meters = value * 1000
        elif from_unit == 'miles':
            meters = value * 1609.34
        elif from_unit == 'feet':
            meters = value * 0.3048
        elif from_unit == 'inches':
            meters = value * 0.0254
        else:
            return jsonify({'error': 'Invalid source length unit.'}), 400

        if to_unit == 'meters':
            converted_value = meters
        elif to_unit == 'kilometers':
            converted_value = meters / 1000
        elif to_unit == 'miles':
            converted_value = meters / 1609.34
        elif to_unit == 'feet':
            converted_value = meters / 0.3048
        elif to_unit == 'inches':
            converted_value = meters / 0.0254
        else:
            return jsonify({'error': 'Invalid target length unit.'}), 400

    elif unit_type == 'mass':
        # Convert all to kilograms first, then to target
        if from_unit == 'kilograms':
            kilograms = value
        elif from_unit == 'grams':
            kilograms = value / 1000
        elif from_unit == 'pounds':
            kilograms = value * 0.453592
        elif from_unit == 'ounces':
            kilograms = value * 0.0283495
        else:
            return jsonify({'error': 'Invalid source mass unit.'}), 400

        if to_unit == 'kilograms':
            converted_value = kilograms
        elif to_unit == 'grams':
            converted_value = kilograms * 1000
        elif to_unit == 'pounds':
            converted_value = kilograms / 0.453592
        elif to_unit == 'ounces':
            converted_value = kilograms / 0.0283495
        else:
            return jsonify({'error': 'Invalid target mass unit.'}), 400
    else:
        return jsonify({'error': 'Invalid unit type. Must be temperature, length, or mass.'}), 400

    if converted_value is not None:
        return jsonify({'result': round(converted_value, 4)}), 200 # Round for display
    else:
        return jsonify({'error': 'Conversion not possible between specified units.'}), 400


if __name__ == '__main__':
    import os
    # Use environment variable for debug mode (default False for production)
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)