#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install LibreOffice for DOCX to PDF conversion
apt-get update
apt-get install -y libreoffice libreoffice-writer

echo "Build complete! LibreOffice installed successfully."
