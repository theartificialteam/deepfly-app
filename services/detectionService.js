/**
 * 🔬 DETECTION SERVICE - Client for Backend Analysis
 * =====================================================
 * This service acts as a client to a backend server.
 * It sends the media file to a Flask/FastAPI backend,
 * which runs the deep learning model and returns a score.
 */

import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from 'expo-image-manipulator';

// --- Configuration ---
// ⚠️ IMPORTANT: Replace this with your computer's local IP address.
const SERVER_IP = '192.168.1.112'; // ⚠️ DEĞİŞTİRİN / CHANGE THIS
const SERVER_URL = `http://${SERVER_IP}:5000`;
const PREDICT_ENDPOINT = `${SERVER_URL}/predict`;
const REQUEST_TIMEOUT = 30000; // 30 seconds
// ---------------------

const DEEPFAKE_THRESHOLD = 65;
const AUTHENTIC_THRESHOLD = 35;

/**
 * Prepares an image for upload by resizing and compressing.
 */
async function prepareImageForUpload(uri) {
  try {
    console.log('[Detection] 📦 Preparing image for upload...');
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 256, height: 256 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('[Detection] ❌ Image preparation failed:', error);
    throw new Error('Failed to prepare image');
  }
}

/**
 * Extracts the first frame from a video to be used for analysis.
 */
async function extractVideoFrame(videoUri) {
  try {
    console.log('[Detection] 🎬 Extracting frame from video...');
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000, quality: 0.9 });
    return uri;
  } catch (error) {
    console.error('[Detection] ❌ Frame extraction failed:', error);
    throw new Error('Could not extract video frame');
  }
}

/**
 * Sends the prepared image to the backend server for analysis.
 */
async function analyzeImageOnServer(imageUri, onProgress) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  });

  onProgress(0.4);
  console.log(`[Detection] 📡 Sending request to ${PREDICT_ENDPOINT}...`);

  const response = await fetch(PREDICT_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });
  
  onProgress(0.8);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Main detection function that orchestrates the entire client-server process.
 */
export async function detectDeepfakeInFile(file, fileType, options = {}) {
  const { onProgress = () => {} } = options;
  const startTime = Date.now();
  
  console.log(`[Detection] Starting server-based analysis for ${fileType}...`);

  try {
    onProgress(0.1);

    // Stage 1: Prepare the image/video frame for upload
    let analysisUri = file;
    if (fileType === 'video') {
      analysisUri = await extractVideoFrame(file);
    }
    const preparedUri = await prepareImageForUpload(analysisUri);
    onProgress(0.3);

    // Stage 2: Send to server and get result
    const serverResponse = await analyzeImageOnServer(preparedUri, onProgress);
    const { score, metrics } = serverResponse;
    if (score === undefined) {
        throw new Error("Invalid response from server: 'score' is missing.");
    }
    console.log(`[Detection] ✅ Server analysis successful. Score: ${score}`);
    onProgress(0.9);

    // Stage 3: Build the final result object
    const processingTime = (Date.now() - startTime) / 1000;
    const isProbablyDeepfake = score >= DEEPFAKE_THRESHOLD;
    const isAuthentic = score <= AUTHENTIC_THRESHOLD;
    
    const result = {
      confidence: score,
      verdict: isProbablyDeepfake ? 'AI-GENERATED' : (isAuthentic ? 'AUTHENTIC' : 'INCONCLUSIVE'),
      isProbablyDeepfake,
      isAuthentic,
      isInconclusive: !isProbablyDeepfake && !isAuthentic,
      thumbnailUri: preparedUri, // Use the prepared, resized image as the thumbnail
      metrics: metrics || {}, // Pass the detailed metrics from the server
      scores: { cnn: score }, // For the breakdown UI
      processingTime,
      timestamp: Date.now(),
      fileType,
    };
    
    onProgress(1.0);
    console.log(`[Detection] ✅ Process complete in ${processingTime.toFixed(2)}s.`);
    return result;
    
  } catch (error) {
    console.error('\n❌ DETECTION FAILED:', error);
    throw error;
  }
}
