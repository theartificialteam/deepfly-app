# scripts/download_model_h5.py
import requests
import os

def download_file(url, filename):
    """Downloads a file from a URL with a progress bar."""
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            block_size = 8192
            
            print(f"Downloading {filename} ({total_size / 1024 / 1024:.2f} MB)")
            
            with open(filename, 'wb') as f:
                downloaded = 0
                for chunk in r.iter_content(chunk_size=block_size):
                    f.write(chunk)
                    downloaded += len(chunk)
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
    # Save to project root, not scripts folder
    OUTPUT_FILENAME = "../Meso4_DF.h5"
    
    print("=" * 60)
    print("🚀 DeepFly Model Downloader: MesoNet (.h5)")
    print("=" * 60)
    
    if os.path.exists(OUTPUT_FILENAME):
        print(f"✅ Model '{OUTPUT_FILENAME}' already exists. Skipping download.")
        return 0

    if not download_file(MODEL_URL, OUTPUT_FILENAME):
        return 1
        
    print(f"\n✅ SUCCESS! Model saved to: {os.path.abspath(OUTPUT_FILENAME)}")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
