<div align="center">
  <h1>🚀 BenPDF Ultimate Converter</h1>
  <p>
    <strong>A comprehensive, modern toolkit for document processing, mathematical computations, and utility tools.</strong>
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#running-with-docker">Docker</a>
  </p>

  <br />

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<br />

## 🌟 Introduction

**BenPDF Ultimate Converter** is a powerful all-in-one web application designed to handle a wide variety of digital tasks. From converting PDFs and processing images to solving complex calculus problems and generating QR codes, this system integrates robust backend processing with a beautiful, modern React frontend.

The application features a sleek, dark-themed UI built with **Tailwind CSS**, offering a premium user experience with smooth animations and responsive design.

---

## ⚡ Features

### 📄 Document & Image Tools
- **PDF to DOCX**: Seamlessly convert PDF documents to editable Word files.
- **Image Converter**: specific format conversions (PNG, JPG, WEBP, etc.).
- **Image Resizer**: High-quality resizing with Lanczos filtering.
- **Background Remover**: AI-powered background removal for images.
- **ICO Converter**: Create favicons from standard images.
- **Metadata Stripper**: Privacy tool to remove metadata from files.

### 🧮 Math & Science
- **Calculus Solver**: Symbolic differentiation and integration (Derivative/Integral) with step-by-step solutions using SymPy.
- **Base Converter**: Advanced number base conversion (Binary, Octal, Decimal, Hexadecimal) with float support.
- **Unit Converter**: Convert between various units of Temperature, Length, and Mass.

### 🛠️ Utilities
- **QR Code Generator**: Generate customizable QR codes with logo embedding and style options (Square, Rounded, Dots).
- **Password Generator**: Create secure, random passwords.
- **Palette Generator**: Extract or generate color palettes.
- **Humanizer**: (Beta) AI-powered text processing.

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (CDN), Custom CSS animations
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Math Rendering**: KaTeX

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
- **PDF Processing**: `pdf2docx`
- **Image Processing**: `Pillow` (PIL), `opencv-python-headless` (OpenCV), `rembg`
- **Mathematics**: `sympy` (Symbolic Math), `numpy`
- **Utilities**: `qrcode`, `python-docx`
- **Server**: Gunicorn (for production)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Python** 3.9 or higher
- **Node.js** 18 or higher
- **npm** or **yarn**

### 1. Backend Setup

Navigate to the root directory:

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

Navigate to the `New ui` directory:

```bash
cd "New ui"

# Install Node.js dependencies
npm install
```

---

## ▶️ Running the Application

You need to run both the backend (Flask) and the frontend (Vite) servers simultaneously.

### Start the Backend
From the root directory (ensure venv is active):

```bash
python app.py
```
*The backend API will typically run on `http://localhost:5000`.*

### Start the Frontend
From the `New ui` directory:

```bash
npm run dev
```
*The frontend will typically run on `http://localhost:5173` (or similar).*

Open your browser and navigate to the frontend URL to use the application.

---

## 🐳 Running with Docker

This project is fully containerized. You can run the entire system using Docker.

> **Note**: Since the Dockerfile serves the React frontend, you specifically need to build the frontend locally first.

```bash
# 1. Build the frontend
cd "New ui"
npm install
npm run build
cd ..

# 2. Build the Docker image
docker build -t benpdf-converter .

# 3. Run the container
docker run -p 5000:5000 benpdf-converter
```

The application will be accessible at `http://localhost:5000`.

---

<div align="center">
  <p>Made with ❤️ by Vince</p>
</div>
