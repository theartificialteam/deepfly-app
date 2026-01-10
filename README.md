# 🦋 DeepFly - AI Deepfake Detector

<div align="center">

![DeepFly Logo](assets/icon.png)

**A production-ready mobile application boilerplate for detecting deepfakes and AI-generated media using a client-server architecture.**

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-black.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange.svg)](https://www.tensorflow.org/)

</div>

---

## 📱 Overview

DeepFly is a privacy-focused mobile application that analyzes images for deepfake or AI-generated artifacts. This project has evolved into a robust **client-server architecture**, where the mobile app provides a sleek user interface and the heavy AI processing is handled by a powerful Python backend.

### ✨ Key Features

- 🌀 **Client-Server Architecture**: Lightweight mobile app with a powerful Python + Flask + Keras backend.
- 🧠 **Deep Learning Model**: Uses the battle-tested `MesoNet` model for high-accuracy deepfake detection.
- 🎨 **Modern & Animated UI**: All screens have been completely redesigned for a professional, engaging, and beautiful user experience.
- 📊 **"Cockpit" Results UI**: Presents a detailed breakdown of analysis results with simulated sub-system metrics for an enhanced, data-rich feel.
- 👤 **User & Guest System**: Supports guest access and user accounts with different usage limits.

---

## 🏛️ Final Architecture: Client-Server Model

To overcome local environment issues and to use more powerful models, the project was refactored into a client-server model.

```
+--------------------------+        +-----------------------------------------+
|                          |        |                                         |
|  React Native Mobile App |        |        Python + Flask Backend           |
|     (deepfly-app)        |        |             (server.py)                 |
|                          |        |                                         |
+--------------------------+        +-----------------------------------------+
           |                                             ^
           | 1. User selects an image.                   |
           | 2. App sends image via HTTP POST request.   |
           |    (detectionService.js)                     | 5. Server returns JSON:
           |                                             |    { "score": 99, "metrics": {...} }
           +-------------------------------------------->+
                                                         |
                               +-------------------------+
                               | 3. Server preprocesses image
                               |    (resize, normalize, BGR swap).
                               | 4. Server predicts using MesoNet model.
                               +-------------------------+
```

### Frontend (React Native Client)
- **File:** `services/detectionService.js`
- **Role:** Handles selecting an image, sending it to the backend's `/predict` endpoint, receiving the JSON response, and preparing the result object for the UI.

### Backend (Python Server)
- **File:** `server.py`
- **Role:** A Flask server that loads the pre-trained `MesoNet` Keras model (`Meso4_DF.h5`) on startup. It exposes a `/predict` endpoint that accepts an image, preprocesses it correctly (including an important **RGB -> BGR color channel swap**), performs the AI prediction, and returns the final score.

---

## 🚀 Setup & Running Instructions

This project now has two parts that must be run simultaneously: the Backend and the Frontend.

### 1. Backend Setup & Run

The backend requires Python 3.11 and a virtual environment.

```bash
# 1. Navigate to the project root directory
cd /path/to/deepfly-app

# 2. Create a Python 3.11 virtual environment
py -3.11 -m venv .venv

# 3. Activate the virtual environment
# On Windows PowerShell:
.\.venv\Scripts\activate

# 4. Install required Python libraries
pip install -r requirements.txt

# 5. Download the AI model weights
# This will download 'Meso4_DF.h5' to the root directory
python scripts/download_model.py

# 6. Run the server! Keep this terminal open.
python server.py
```
The server will start and you will see a message like `✅ AI Model and weights loaded successfully!`.

### 2. Frontend Setup & Run

1.  **Set Server IP:** Open `services/detectionService.js` in a code editor. Find the `SERVER_URL` constant and change the IP address to your computer's local IP address (e.g., `'http://192.168.1.112:5000'`). You can find your IP by typing `ipconfig` in the Command Prompt.

2.  **Run the App:** Open a **new** terminal (keep the server terminal running) and navigate to the project root. Then run:
    ```bash
    # Install Node.js dependencies
    npm install

    # Start the mobile application
    npx expo start
    ```
3.  Scan the QR code with the Expo Go app on your phone to see the app in action.

---
## 💡 Future Development & Development Journey

This section documents alternative architectures that were explored, which could be implemented in the future.

### On-Device TFLite Model (Alternative Architecture)
- **Goal:** To run the entire analysis on the mobile device without needing a server. This offers offline capabilities and enhanced privacy.
- **Model:** The recommended model for this approach is `Xicor9/efficientnet-b0-ffpp-c23`, a powerful yet lightweight `EfficientNet-B0` model.
- **Implementation:** The `scripts/setup_tflite_model.py` script was created to download this model from Hugging Face and convert it to the `.tflite` format, which is optimized for mobile devices.
- **Blocker:** This approach was ultimately blocked due to fundamental, unresolvable issues with the local Python/TensorFlow environment required for the conversion script. The script would crash the Python interpreter. However, the script is preserved in the `scripts` folder for any future developer with a stable TensorFlow environment who wishes to pursue this architecture.

### Hybrid On-Device Analysis (Future Feature)
- **Goal:** To combine the score from a deep learning model (like the `.tflite` model above) with the scores from the original heuristic algorithms (texture, noise, etc.).
- **Implementation:** The heuristic algorithms still exist in the `old/services/ml` directory. A future implementation could run both the `.tflite` model and these algorithms, combining their results with a weighted formula (e.g., 70% TFLite score + 30% heuristic score) for an even more robust verdict.

---

## 📂 Final Project Structure
```
deepfly-app/
├── 📱 App.js                     # Root component, navigation setup
├── サーバー server.py              # The Python Flask AI Backend
├── 📦 package.json               # Frontend dependencies
├── 📜 requirements.txt           # Backend Python dependencies
├── 🖼️ assets/
├── 🎨 screens/                   # All React Native screens
├── 📡 services/                   # React Native services (e.g., detectionService.js)
├── 🏪 store/                     # Global state management
├──  OLD/                         # Deprecated files from previous architectures
│   └── scripts/
│   └── services/
└── 🐍 scripts/
    └── download_model.py         # Script to download the MesoNet .h5 model
```