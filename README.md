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
- 🧠 **Advanced 5-Method Analysis** - New-generation algorithmic detection engine
- 📹 **Image & Video Support** - Analyze photos and videos
- 💡 **Intelligent Consensus System** - Accuracy is boosted by cross-referencing results
- 📊 **Detailed Analysis Reports** - See exactly why media is flagged
- 👤 **User Accounts** - Track your analysis history
- 💎 **Pro Tier** - Higher limits for power users

---

## 🧠 Advanced Detection Engine v3.0

DeepFly has been upgraded to a new-generation detection engine that uses a sophisticated ensemble of **5 parallel heuristic methods**. This system moves beyond single-model dependency, providing a more robust and nuanced analysis. All processing is algorithmic and happens instantly on your device.

### Core Analysis Methods

| Method | Emoji | Description | Weight |
|--------------------------------|:---:|-------------|:------:|
| **Frequency Analysis** | 📊 | Analyzes frequency domain data (FFT) to detect the unnatural smoothness and specific patterns common in AI-generated images. | 28% |
| **Noise Pattern Analysis** | 🔍 | Scans for the absence of natural camera sensor noise or the presence of synthetic, repeating noise patterns. | 24% |
| **Edge Coherence Analysis** | 🔗 | Inspects the integrity of edges and corners. Highly effective at spotting anomalies from face-swaps or object manipulation. | 15% |
| **Statistical Texture Analysis**| 🎨 | Examines skin, fabric, and other textures for statistical irregularities and the lack of organic complexity found in real media. | 15% |
| **Compression Artifacts** | 🗜️ | Detects non-standard or inconsistent compression patterns that often appear when manipulated media is re-saved. | 18% |

### ✨ Intelligent Consensus System

The power of DeepFly lies not just in the individual methods, but in how their results are combined:

1.  **Weighted Scoring:** Each method's score is given a different weight based on its general effectiveness.
2.  **Consensus Boost:** If a strong majority of methods (e.g., 3 or more) agree on a verdict (either "AI-Generated" or "Authentic"), the final confidence score is significantly boosted in that direction. This prevents a single outlier method from skewing the result.
3.  **Pattern Recognition:** The engine identifies specific cross-method patterns. For example, a high score in `Edge Coherence` combined with a high score in `Noise Analysis` is a strong indicator of a face-swap, triggering a score adjustment.

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
│   ├── 🔬 detectionService.js    # The main conductor for the analysis pipeline
│   ├── 🧠 mlModels.js            # Implements the ensemble scoring and consensus logic
│   ├── 💾 storage.js             # AsyncStorage persistence
│   ├── 💳 iapService.js          # In-app purchases (Pro tier)
│   ├── 🔥 firebaseService.js     # Firebase logging (optional)
│   └── 📁 ml/                     # Contains the individual, specialized analysis modules
│       ├── 📊 frequencyAnalysis.js
│       ├── 🔍 noiseAnalysis.js
│       ├── 🗜️ compressionAnalysis.js
│       ├── 🔗 edgeAnalysis.js
│       └── 🎨 textureAnalysis.js
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

The entire UI has been redesigned to be modern, animated, and highly engaging.

### 🔐 Auth Screens
- **A sleek, modern, and animated onboarding experience.** The landing screen features animated cards highlighting the app's core benefits, leading to a clean and focused email/password form with smooth transitions and inline error handling.

### 🏠 Home Screen (Dashboard)
- **A modern, animated dashboard.** Features a prominent usage card with a circular progress visualization, a clear 'Start New Analysis' CTA, and a dynamic list of recent analyses presented in clean, tappable cards.

### 📤 Upload Screen
- **A streamlined, two-stage experience.** Initially presents large, clear action cards for selecting from the gallery or using the camera. Upon selection, smoothly animates to a focused preview card displaying the media thumbnail and info, with a prominent 'Analyze Now' button.

### ⏳ Analysis Screen
- **An engaging, technical-feeling wait screen.** Features a large, central animated 'scanner' visual displaying the overall progress percentage. A dynamic list shows the *actual* analysis steps (Frequency, Noise, etc.) updating in real-time from 'pending' to 'in progress' to 'completed'.

### 📊 Results Screen
- **A clear, data-rich report.** The final verdict is displayed in a large, circular progress visualizer. Suspicious indicators are highlighted in a prominent warning card. The detailed breakdown shows each of the 5 core analysis methods in its own card with a dedicated progress bar, making the results easy to understand at a glance.

---

## 🧬 Detection Pipeline v3.0 (Graph)

The new engine follows a multi-stage pipeline designed for accuracy and speed.

```
[ 📸 Load Media (Image / Video Frames) ]
                   │
                   ▼
    ┌──────────────┴──────────────┐
    │      Run 5 Analyses in PARALLEL     │
    ├─────────────┬───────────────┬───────────────┬──────────────┬───────────┤
    │     📊      │      🔍       │      🔗       │      🎨      │     🗜️    │
    │  Frequency  │     Noise     │      Edge     │    Texture   │Compression│
    │   (28%)     │    (24%)      │    (15%)      │    (15%)     │   (18%)   │
    └─────────────┴───────────────┴───────────────┴──────────────┴───────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │   🧠 Calculate Weighted Average   │
    └─────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │  ✨ Apply Consensus Logic ✨    │
    │ (Boost/Reduce score based on    │
    │  agreement between methods)     │
    └─────────────────────────────────┘
                   │
                   ▼
    ╔═════════════════════════════════╗
    ║      🎯 Final Verdict 🎯        ║
    ║  (Confidence Score: 0-100%)     ║
    ╚═════════════════════════════════╝
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
