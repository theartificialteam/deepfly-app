from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

app = Flask(__name__)

# Load the pre-trained Keras model
# This is loaded only once when the server starts
print("Loading MesoNet model...")
try:
    model = load_model('Meso4_DF.h5')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint to test server connection"""
    return jsonify({
        'status': 'online',
        'message': 'DeepFly MesoNet Server is running!',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model is not loaded!'}), 500

    # Check if an image file was posted
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    try:
        # Read the image file from the request
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess the image for the MesoNet model
        # MesoNet expects 256x256 images with pixel values scaled to [0, 1]
        image = image.resize((256, 256))
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0) # Add batch dimension

        # Make a prediction
        prediction = model.predict(image_array)
        
        # 🔍 DEBUG: Model çıktısını görelim
        print(f"\n{'='*60}")
        print(f"🔍 DEBUG INFO for {file.filename}")
        print(f"{'='*60}")
        print(f"Raw prediction: {prediction}")
        print(f"Prediction shape: {prediction.shape}")
        print(f"prediction[0]: {prediction[0]}")
        
        # MesoNet modeli 2 farklı format döndürebilir:
        # Format 1) [[sahte_olasılığı]] - Tek değer
        # Format 2) [[gerçek_olasılığı, sahte_olasılığı]] - İki değer
        
        if prediction.shape[1] == 2:
            # İki sınıflı çıktı - ikinci değer sahte olasılığı
            real_probability = prediction[0][0]
            fake_probability = prediction[0][1]
            print(f"✅ İki sınıflı model çıktısı tespit edildi:")
            print(f"   Gerçek olasılığı: {real_probability:.4f} ({real_probability*100:.2f}%)")
            print(f"   Sahte olasılığı: {fake_probability:.4f} ({fake_probability*100:.2f}%)")
        elif prediction.shape[1] == 1:
            # Tek değer - direkt sahte olasılığı
            fake_probability = prediction[0][0]
            print(f"✅ Tek değerli model çıktısı tespit edildi:")
            print(f"   Sahte olasılığı: {fake_probability:.4f} ({fake_probability*100:.2f}%)")
        else:
            print(f"⚠️ Beklenmeyen çıktı formatı!")
            fake_probability = prediction[0][0]
        
        # Convert to a percentage score
        score = int(fake_probability * 100)
        
        print(f"\n📊 Final Score: {score}% deepfake/AI")
        print(f"{'='*60}\n")

        # Return the result as JSON
        return jsonify({'score': score})

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Runs the Flask app on http://127.0.0.1:5000
    # Make sure this port is accessible from your mobile device's network
    app.run(host='0.0.0.0', port=5000, debug=True)