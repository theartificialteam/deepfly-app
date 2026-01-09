# 🔬 DeepFly - AI-Powered Deepfake Detector

A privacy-first mobile application for detecting deepfake manipulation in images and videos. All processing happens on-device.

## ✨ Features

- 🛡️ **On-Device Analysis** - All AI processing happens locally on your phone
- 🧠 **4-Model Ensemble** - Multiple AI models for accurate detection
- 📸 **Photo & Video Support** - Analyze both images and video files
- ⚡ **Fast Results** - Get comprehensive analysis in seconds
- 🔒 **Privacy First** - Your media never leaves your device
- 📄 **Detailed Reports** - Generate shareable analysis reports

## 📱 Screenshots

Coming soon...

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Expo Go app on your device

### Installation

```bash
# Clone the repository
git clone https://github.com/theartificialteam/deepfly-app.git
cd deepfly-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

### Running on Device

1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code from the terminal
3. The app will load on your device

## 🧠 AI Models

The app uses an ensemble of 4 models:

| Model | Weight | Purpose |
|-------|--------|---------|
| Face Detection | 25% | Detects faces and analyzes landmark quality |
| Deep Forensics | 35% | Neural network for manipulation detection |
| Liveness Check | 15% | Texture and micro-expression analysis |
| Symmetry Analysis | 25% | Facial structure consistency check |

## 📊 Score Interpretation

| Score Range | Interpretation |
|------------|----------------|
| 0-40% | Likely authentic |
| 40-70% | Inconclusive |
| 70-100% | Likely deepfake |

## 🛠️ Tech Stack

- **React Native** + **Expo**
- **React Navigation**
- **React Native Paper**
- **Zustand** - State management

## ⚠️ Disclaimer

This application is for educational purposes only. AI-based detection may produce false positives or negatives.

## 📄 License

MIT License

---

Built with ❤️ by The Artificial Team

