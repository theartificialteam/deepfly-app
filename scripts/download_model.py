# scripts/download_model.py
import requests
import os
import sys

def download_file(url, filename):
    """Downloads a file from a URL with a progress bar."""
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            if total_size == 0:
                print(f"Warning: Content-Length header is missing. Cannot show progress.")
            
            print(f"Downloading {os.path.basename(filename)} ({total_size / 1024 / 1024:.2f} MB)")
            
            with open(filename, 'wb') as f:
                downloaded = 0
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        sys.stdout.write(f"\r -> {progress:.1f}%")
                        sys.stdout.flush()
            print("\nDownload complete!")
            return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Download failed: {e}")
        return False

def main():
    MODEL_URL = "https://github.com/DariusAf/MesoNet/raw/master/weights/Meso4_DF.h5"
    # Save to project root, which is one level up from the scripts folder
    OUTPUT_FILENAME = "../Meso4_DF.h5"
    
    print("=" * 60)
    print("🚀 DeepFly Model Downloader: MesoNet (.h5)")
    print("=" * 60)
    
    # Get absolute path for friendlier output
    abs_output_path = os.path.abspath(OUTPUT_FILENAME)

    if os.path.exists(abs_output_path):
        print(f"✅ Model '{os.path.basename(abs_output_path)}' already exists. Skipping download.")
        return 0

    if not download_file(MODEL_URL, abs_output_path):
        return 1
        
    print(f"\n✅ SUCCESS! Model saved to: {abs_output_path}")
    return 0

if __name__ == "__main__":
    sys.exit(main())