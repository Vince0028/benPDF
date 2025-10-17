#!/usr/bin/env python3
"""Test script to validate an image file"""

import sys
from PIL import Image
import os

def test_image(filepath):
    """Test if an image file can be opened"""
    print(f"Testing image: {filepath}")
    
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        return False
    
    file_size = os.path.getsize(filepath)
    print(f"File size: {file_size} bytes")
    
    # Read first bytes
    with open(filepath, 'rb') as f:
        magic = f.read(8)
        print(f"Magic bytes: {magic.hex()}")
        
        # Identify format
        if magic[:2] == b'\xff\xd8':
            print("Format: JPEG")
        elif magic[:8] == b'\x89PNG\r\n\x1a\n':
            print("Format: PNG")
        elif magic[:4] == b'RIFF':
            print("Format: WEBP")
        elif magic[:4] == b'GIF8':
            print("Format: GIF")
        else:
            print(f"Format: Unknown - may be corrupted")
    
    # Try to open with PIL
    try:
        img = Image.open(filepath)
        print(f"SUCCESS: PIL opened image")
        print(f"Format: {img.format}")
        print(f"Mode: {img.mode}")
        print(f"Size: {img.size}")
        return True
    except Exception as e:
        print(f"ERROR: PIL failed to open image: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_image.py <image_file_path>")
        print("Example: python test_image.py bird-colorful-gradient-design-vector_343694-2506.jpg")
        sys.exit(1)
    
    filepath = sys.argv[1]
    success = test_image(filepath)
    sys.exit(0 if success else 1)
