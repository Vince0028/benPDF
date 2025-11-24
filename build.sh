set -o errexit

pip install -r requirements.txt

apt-get update
apt-get install -y libreoffice libreoffice-writer

echo "Build complete! LibreOffice installed successfully."
