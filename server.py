from flask import Flask, request, jsonify
from tensorflow.keras.models import Model as KerasModel
from tensorflow.keras.layers import Input, Dense, Flatten, Conv2D, MaxPooling2D, BatchNormalization, Dropout
from PIL import Image
import numpy as np
import io
import os
import random

# --- MesoNet Model Architecture Definition ---
def create_meso4_model():
    x = Input(shape=(256, 256, 3))
    x1 = Conv2D(8, (3, 3), padding='same', activation='relu')(x)
    x1 = BatchNormalization()(x1)
    x1 = MaxPooling2D(pool_size=(2, 2), padding='same')(x1)
    x2 = Conv2D(8, (5, 5), padding='same', activation='relu')(x1)
    x2 = BatchNormalization()(x2)
    x2 = MaxPooling2D(pool_size=(2, 2), padding='same')(x2)
    x3 = Conv2D(16, (5, 5), padding='same', activation='relu')(x2)
    x3 = BatchNormalization()(x3)
    x3 = MaxPooling2D(pool_size=(2, 2), padding='same')(x3)
    x4 = Conv2D(16, (5, 5), padding='same', activation='relu')(x3)
    x4 = BatchNormalization()(x4)
    x4 = MaxPooling2D(pool_size=(4, 4), padding='same')(x4)
    y = Flatten()(x4)
    y = Dropout(0.5)(y)
    y = Dense(16, activation='relu')(y)
    y = Dropout(0.5)(y)
    y = Dense(1, activation='sigmoid')(y)
    return KerasModel(inputs=x, outputs=y)

app = Flask(__name__)

# --- Model Loading ---
model = None

def load_model_on_startup():
    global model
    MODEL_WEIGHTS_FILE = 'Meso4_DF.h5'
    print("=" * 60)
    print("🚀 Initializing MesoNet Server")
    print("=" * 60)
    if not os.path.exists(MODEL_WEIGHTS_FILE):
        print(f"❌ FATAL ERROR: Model weights file '{MODEL_WEIGHTS_FILE}' not found.")
        print("Please run 'python scripts/download_model.py' first.")
        return

    try:
        print("Creating MesoNet model architecture...")
        model_arch = create_meso4_model()
        print(f"Architecture created. Loading weights from '{MODEL_WEIGHTS_FILE}'...")
        model_arch.load_weights(MODEL_WEIGHTS_FILE)
        model = model_arch
        print("✅ AI Model and weights loaded successfully!")
    except Exception as e:
        print(f"❌ Error creating/loading model: {e}")
        model = None
    print("=" * 60 + "\n")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'AI Model is not loaded! Server startup failed.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        image = image.resize((256, 256))
        image_array = np.array(image) / 255.0
        
        # FINAL ATTEMPT: Swap color channels from RGB to BGR, as this might be what the model expects
        image_array = image_array[..., ::-1]
        
        image_array = np.expand_dims(image_array, axis=0)

        prediction = model.predict(image_array)
        
        print(f"\n{'='*60}")
        print(f"🔍 DEBUG INFO for {file.filename}")
        print(f"{ '='*60}")
        
        fake_probability = prediction[0][0] 
        score = int(fake_probability * 100)
        
        print(f"Raw model probability (BGR): {fake_probability:.4f}")
        print(f"Final Score: {score}% deepfake/AI")
        print(f"{ '='*60}\n")
        
        # Return a simple score for now. No metrics simulation.
        return jsonify({'score': score, 'metrics': {}})

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return "DeepFly AI Server is running."

if __name__ == '__main__':
    load_model_on_startup()
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000)
