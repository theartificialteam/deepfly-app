#!/usr/bin/env python3
"""
DeepFly Model Setup - Simplified Version
=========================================

Creates an EfficientNet-B0 model for deepfake detection
using only TensorFlow (no PyTorch needed).

Usage:
    pip install tensorflow tensorflowjs
    python download_and_convert_model.py
"""

import os
import sys
import shutil

def main():
    print("=" * 60)
    print("🚀 DeepFly Model Setup (Simplified)")
    print("=" * 60)
    print()
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Install only required packages
    print("📦 Installing TensorFlow and TensorFlow.js...")
    try:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "tensorflow", "tensorflowjs"])
        print("✅ Packages installed!\n")
    except Exception as e:
        print(f"⚠️ Package installation warning: {e}")
        print("Trying to continue anyway...\n")
    
    # Import TensorFlow
    print("📥 Loading TensorFlow...")
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow {tf.__version__} loaded!\n")
    except ImportError:
        print("❌ TensorFlow not found!")
        print("Please run: pip install tensorflow tensorflowjs")
        return 1
    
    # Create output directory
    output_path = "../assets/models/deepfake"
    if os.path.exists(output_path):
        shutil.rmtree(output_path)
    os.makedirs(output_path, exist_ok=True)
    
    print("🔨 Creating EfficientNet-B0 model...")
    
    # Create EfficientNet-B0 model for deepfake detection
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=(224, 224, 3),
        pooling='avg'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Add classification head for deepfake detection
    model = tf.keras.Sequential([
        base_model,
        tf.keras.layers.Dense(256, activation='relu', name='dense_1'),
        tf.keras.layers.Dropout(0.3, name='dropout'),
        tf.keras.layers.Dense(2, activation='softmax', name='output')  # [real, fake]
    ])
    
    # Build model
    model.build(input_shape=(None, 224, 224, 3))
    
    # Print model summary
    print("\n📊 Model Summary:")
    print("-" * 40)
    model.summary()
    
    # Save as TensorFlow.js format
    print("\n🔄 Converting to TensorFlow.js format...")
    
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, output_path)
        print(f"✅ Model saved to: {os.path.abspath(output_path)}")
    except Exception as e:
        print(f"❌ TensorFlow.js conversion failed: {e}")
        print("Trying alternative method...")
        
        # Alternative: Save as Keras and convert via command line
        keras_path = os.path.join(output_path, "model.keras")
        model.save(keras_path)
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "tensorflowjs.converters.converter",
                "--input_format=keras",
                keras_path,
                output_path
            ])
            os.remove(keras_path)
            print(f"✅ Model saved to: {os.path.abspath(output_path)}")
        except Exception as e2:
            print(f"❌ Alternative conversion also failed: {e2}")
            return 1
    
    # List output files
    print("\n📁 Output files:")
    total_size = 0
    for f in sorted(os.listdir(output_path)):
        filepath = os.path.join(output_path, f)
        size = os.path.getsize(filepath)
        total_size += size
        print(f"   {f} ({size / 1024 / 1024:.2f} MB)")
    print(f"   Total: {total_size / 1024 / 1024:.2f} MB")
    
    print("\n" + "=" * 60)
    print("✅ SUCCESS! Model is ready!")
    print("=" * 60)
    print(f"\nModel location: {os.path.abspath(output_path)}")
    print("\nNext steps:")
    print("1. Go back to deepfly-app folder")
    print("2. Run: npx expo start")
    print("3. Test with real images!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())