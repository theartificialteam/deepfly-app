# 🦋 DeepFly - AI Deepfake Detector

<div align="center">

![DeepFly Logo](assets/icon.png)

**Production-ready mobile app for detecting deepfakes and AI-generated media**

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange.svg)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📱 Overview

DeepFly is a privacy-focused mobile application that detects deepfakes and AI-generated images/videos directly on your device. All processing happens locally - your media never leaves your phone.

### ✨ Key Features

- 🔒 **100% On-Device Processing** - Complete privacy, no cloud uploads
- 🧠 **8-Method Hybrid Detection** - CNN + Advanced Heuristics
- 📹 **Image & Video Support** - Analyze photos and videos
- 👁️ **Eye Blink Detection** - Catches deepfakes that don't blink naturally
- 📊 **Detailed Analysis Reports** - See exactly why media is flagged
- 👤 **User Accounts** - Track your analysis history
- 💎 **Pro Tier** - Higher limits for power users

---

## 🎯 Detection Methods

DeepFly uses an ensemble of 8 detection methods for maximum accuracy:

| # | Method | Emoji | Description | Weight |
|---|--------|-------|-------------|--------|
| 1 | **CNN/Pattern Analysis** | 🧠 | Deep learning pattern recognition | 25% |
| 2 | **Texture Analysis** | 🔍 | Skin smoothness, GAN artifacts detection | 20% |
| 3 | **Color Analysis** | 🎨 | Unnatural color patterns and correlation | 15% |
| 4 | **Geometry Analysis** | 📐 | Face proportions and structure validation | 15% |
| 5 | **Frequency Analysis** | 📊 | FFT-based compression artifact detection | 15% |
| 6 | **Symmetry Analysis** | ⚖️ | Left-right face symmetry check | 10% |
| 7 | **Eye Blink Detection** | 👁️ | Natural blink pattern analysis (video) | 15% |
| 8 | **Pupil Dynamics** | 🔮 | Pupil size variation tracking (video) | 10% |

### 📈 Expected Accuracy

| Media Type | Expected Score |
|------------|----------------|
| Real Human Photo | 10-30% |
| Real Human Video | 8-25% |
| AI-Generated Face (StyleGAN, Midjourney) | 70-90% |
| Deepfake Video | 75-95% |

---

## 📂 Project Structure

```
deepfly-app/
├── 📱 App.js                     # Root component, navigation setup
├── 📦 package.json               # Dependencies and scripts
├── ⚙️ app.json                   # Expo configuration
├── 🔥 firebaseConfig.js          # Firebase setup (optional)
├── 📄 index.js                   # Entry point
│
├── 📁 assets/
│   ├── 🖼️ icon.png               # App icon (1024x1024)
│   ├── 🌊 splash-icon.png        # Splash screen
│   ├── 📱 adaptive-icon.png      # Android adaptive icon
│   └── 🌐 favicon.png            # Web favicon
│
├── 📁 screens/
│   ├── 🏠 HomeScreen.js          # Dashboard with history & usage
│   ├── 📤 UploadScreen.js        # Media selection (gallery/camera)
│   ├── ⏳ AnalysisScreen.js      # Progress & detection running
│   ├── 📊 ResultsScreen.js       # Detailed results with all scores
│   ├── 🚪 AuthLandingScreen.js   # Welcome & auth options
│   ├── 📧 AuthEmailScreen.js     # Email/password login
│   └── 📜 LegalScreen.js         # Privacy policy & terms
│
├── 📁 services/
│   ├── 🧠 mlModels.js            # All 8 detection methods
│   ├── 🔬 detectionService.js    # Main detection pipeline
│   ├── 💾 storage.js             # AsyncStorage persistence
│   ├── 💳 iapService.js          # In-app purchases (Pro tier)
│   └── 🔥 firebaseService.js     # Firebase logging (optional)
│
├── 📁 store/
│   └── 🗄️ appStore.js            # Zustand global state
│
├── 📁 legal/
│   ├── 📜 PRIVACY_POLICY.md      # Privacy policy document
│   ├── 📜 TERMS_OF_SERVICE.md    # Terms of service
│   └── 📜 DISCLAIMER.md          # Legal disclaimer
│
└── 📁 scripts/
    ├── 🐍 download_and_convert_model.py  # Model setup script
    ├── 🪟 setup_model.bat               # Windows setup script
    └── 📖 README.md                     # Model setup instructions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/theartificialteam/deepfly-app.git
cd deepfly-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

1. Install **Expo Go** app on your phone
2. Scan the QR code from terminal
3. App will load on your device

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project
```

### App Store Configuration

Edit `app.json` for your own app:

```json
{
  "expo": {
    "name": "DeepFly",
    "slug": "deepfly-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.deepfly"
    },
    "android": {
      "package": "com.yourcompany.deepfly"
    }
  }
}
```

---

## 📱 Screens Overview

### 🏠 Home Screen (Dashboard)
- Welcome message with user name
- Daily usage counter (`Today: 5/20 analyses`)
- Quick "Start New Analysis" button
- Recent analysis history (last 5)
- Upgrade to Pro card

### 📤 Upload Screen
- Pick from gallery (images/videos)
- Take photo with camera
- File info preview
- "Analyze" button

### ⏳ Analysis Screen
- Real-time progress bar
- Status messages for each detection method
- Cancel option

### 📊 Results Screen
- **Verdict**: Likely Authentic ✅ or Likely Deepfake ⚠️
- **Confidence Score**: 0-100%
- **Individual Method Scores**: All 8 methods with progress bars
- **Indicators Found**: List of suspicious patterns detected
- **Video Stats**: Blink count, pupil variance (for videos)
- **Share Report**: Generate detailed text report

### 🔐 Auth Screens
- Guest mode (5 analyses/day)
- Free account (20 analyses/day)
- Pro account (100 analyses/day)

---

## 🧠 Detection Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    DETECTION PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOAD MEDIA                                               │
│     ├── Image: Load & resize to 224x224                     │
│     └── Video: Extract 5 frames (100ms, 500ms, 1.5s, 3s, 5s)│
│                                                              │
│  2. RUN DETECTION METHODS (parallel)                         │
│     ├── 🧠 CNN/Pattern Analysis                              │
│     ├── 🔍 Texture Analysis                                  │
│     ├── 🎨 Color Analysis                                    │
│     ├── 📐 Geometry Analysis                                 │
│     ├── 📊 Frequency Analysis                                │
│     └── ⚖️ Symmetry Analysis                                 │
│                                                              │
│  3. VIDEO-ONLY ANALYSIS                                      │
│     ├── 👁️ Eye Blink Detection                               │
│     └── 🔮 Pupil Dynamics                                    │
│                                                              │
│  4. ENSEMBLE CALCULATION                                     │
│     ├── Apply weights to each method                         │
│     ├── Indicator boost (+10% if 2+, +15% if 3+)            │
│     └── Calculate final confidence score                     │
│                                                              │
│  5. RETURN RESULTS                                           │
│     ├── confidence: 0-100                                    │
│     ├── isProbablyDeepfake: true/false                      │
│     ├── scores: { cnn, texture, color, ... }                │
│     ├── indicators: ["Smooth skin", "No blinks", ...]       │
│     └── metadata: { faces, processingTime, ... }            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Persistence

DeepFly uses AsyncStorage for local data:

| Key | Data |
|-----|------|
| `@deepfly_user` | User account info |
| `@deepfly_history` | Analysis history |
| `@deepfly_usage` | Daily usage count |
| `@deepfly_last_reset_date` | Last usage reset date |
| `@deepfly_legal_agreement` | Legal agreement status |

---

## 💎 Subscription Tiers

| Tier | Daily Limit | History | Price |
|------|-------------|---------|-------|
| **Guest** | 5 analyses | Device only | Free |
| **Free Account** | 20 analyses | Synced | Free |
| **Pro** | 100 analyses | Unlimited | $9.99/month |

---

## 📜 Legal Documents

Located in `/legal` folder:

- **PRIVACY_POLICY.md** - How we handle (don't collect) your data
- **TERMS_OF_SERVICE.md** - Usage terms and conditions
- **DISCLAIMER.md** - AI accuracy limitations

---

## 🔐 Privacy

DeepFly is designed with privacy as the #1 priority:

- ✅ All processing happens ON DEVICE
- ✅ No images/videos are uploaded to any server
- ✅ No tracking or analytics (unless you opt-in)
- ✅ No account required (guest mode available)
- ✅ Data stored locally with AsyncStorage

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo |
| ML | TensorFlow.js |
| State | Zustand |
| UI | React Native Paper |
| Navigation | React Navigation v7 |
| Storage | AsyncStorage |
| Media | expo-image-picker, expo-av, expo-video-thumbnails |
| IAP | react-native-iap (coming soon) |

---

## 📦 Dependencies

```json
{
  "@tensorflow/tfjs": "^4.22.0",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-navigation/native": "^7.1.26",
  "expo": "~54.0.31",
  "expo-image-picker": "~17.0.10",
  "expo-video-thumbnails": "~10.0.8",
  "react-native-paper": "^5.14.5",
  "zustand": "^5.0.9"
}
```

---

## 🚀 Deployment

### iOS (App Store)

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android (Play Store)

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**The Artificial Team**
- 🌐 Website: [theartificial.team](https://theartificial.team)
- 📧 Email: teamtheartificial@gmail.com
- 🐙 GitHub: [@theartificialteam](https://github.com/theartificialteam)

---

## 🙏 Acknowledgments

- [FaceForensics++](https://github.com/ondyari/FaceForensics) - Deepfake detection research
- [TensorFlow.js](https://www.tensorflow.org/js) - On-device ML
- [Expo](https://expo.dev) - React Native development platform
- [React Native Paper](https://reactnativepaper.com/) - Material Design components

---

<div align="center">

**Made with ❤️ by The Artificial Team**

[⭐ Star this repo](https://github.com/theartificialteam/deepfly-app) if you find it useful!

</div>
