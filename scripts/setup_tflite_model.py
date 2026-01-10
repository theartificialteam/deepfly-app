# scripts/setup_tflite_model.py
import os
import sys
import subprocess
import shutil
import tensorflow
from huggingface_hub import snapshot_download
from tensorflow.keras.models import load_model

# --- Configuration ---
HF_MODEL_NAME = "fc63/deepfake-detection-cnn_v2" # Recommended Keras-native EfficientNet-B0
MODEL_DIR = "../assets/models/efficientnet-b0-tflite"
TFLITE_FILENAME = os.path.join(MODEL_DIR, "model.tflite")
# ---------------------

def main():
    print("=" * 60)
    print(f"🚀 Setting up TFLite Model: {HF_MODEL_NAME}")
    print("=" * 60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Dependency check
    try:
        from huggingface_hub import snapshot_download
        import tensorflow
        print("✅ Dependencies found.")
    except ImportError:
        print("❌ Missing dependencies. Please run: pip install tensorflow huggingface_hub")
        return 1

    # Create output directory
    print(f"\n📁 Creating output directory: {os.path.abspath(MODEL_DIR)}")
    os.makedirs(MODEL_DIR, exist_ok=True)

    # Download Keras model from Hugging Face Hub
    print(f"\nDownloading Keras model '{HF_MODEL_NAME}' from Hugging Face Hub...")
    try:
        model_path = snapshot_download(repo_id=HF_MODEL_NAME, cache_dir=os.path.join(script_dir, "hf_cache"))
        keras_model = load_model(model_path)
        print("✅ Keras model downloaded and loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to download or load model: {e}")
        print("This might be due to an incompatible TensorFlow version or a network issue.")
        return 1

    # Convert the model to TensorFlow Lite format
    print("\n🔄 Converting Keras model to TFLite format...")
    try:
        converter = tensorflow.lite.TFLiteConverter.from_keras_model(keras_model)
        tflite_model = converter.convert()
        print("✅ Model converted to TFLite successfully.")
    except Exception as e:
        print(f"❌ TFLite conversion failed: {e}")
        return 1

    # Save the TFLite model to a file
    print(f"\n💾 Saving TFLite model to: {os.path.abspath(TFLITE_FILENAME)}")
    try:
        with open(TFLITE_FILENAME, 'wb') as f:
            f.write(tflite_model)
        
        size_mb = os.path.getsize(TFLITE_FILENAME) / 1024 / 1024
        print(f"✅ Model saved! Size: {size_mb:.2f} MB")
    except Exception as e:
        print(f"❌ Failed to save TFLite model: {e}")
        return 1
    
    print("\n" + "=" * 60)
    print("✅ SUCCESS! TFLite model is ready for on-device inference.")
    print("=" * 60)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
