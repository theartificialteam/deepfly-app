/**
 * Detection Service - Main deepfake analysis logic
 * 
 * Analyzes images and videos for potential deepfake manipulation
 * using an ensemble of detection methods.
 */

import * as VideoThumbnails from 'expo-video-thumbnails';

import {
  loadAllModels,
  runFaceDetection,
  runDeeperForensicsDetection,
  runLivenessDetection,
  runFaceSymmetryAnalysis,
} from './mlModels';

// Ensemble weights for combining model scores
const MODEL_WEIGHTS = {
  faceDetection: 0.25,
  deeperForensics: 0.35,
  liveness: 0.15,
  symmetry: 0.25,
};

// Threshold for deepfake determination
const DEEPFAKE_THRESHOLD = 70;

/**
 * Simulate processing delay for better UX
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract a frame from video for analysis
 */
async function extractVideoFrame(videoUri, timeMs = 1000) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 0.8,
    });
    return uri;
  } catch (error) {
    console.error('[Detection] Error extracting video frame:', error);
    throw error;
  }
}

/**
 * Calculate ensemble confidence score from individual model scores
 */
function calculateEnsembleScore(scores) {
  const weightedSum =
    scores.model1 * MODEL_WEIGHTS.faceDetection +
    scores.model2 * MODEL_WEIGHTS.deeperForensics +
    scores.model3 * MODEL_WEIGHTS.liveness +
    scores.model4 * MODEL_WEIGHTS.symmetry;
  
  return Math.round(weightedSum);
}

/**
 * Main detection function - analyzes a file for deepfake content
 * 
 * @param {string} file - File URI (image or video)
 * @param {string} fileType - 'image' or 'video'
 * @param {Object} options - Detection options
 * @param {Function} options.onProgress - Progress callback (0-1)
 * @returns {Object} Detection results
 */
export async function detectDeepfakeInFile(file, fileType, options = {}) {
  const { onProgress = () => {} } = options;
  const startTime = Date.now();
  
  console.log('[Detection] Starting analysis...');
  console.log('[Detection] File type:', fileType);
  
  let frameUri = file;
  
  try {
    // Stage 1: Load ML models (0-20%)
    onProgress(0.02);
    await delay(200);
    
    await loadAllModels((modelProgress) => {
      onProgress(0.02 + modelProgress * 0.18);
    });
    
    // Stage 2: Prepare frames (20-40%)
    onProgress(0.22);
    await delay(150);
    
    if (fileType === 'video') {
      console.log('[Detection] Extracting video frame...');
      try {
        frameUri = await extractVideoFrame(file, 2000);
      } catch (e) {
        console.log('[Detection] Using original file as fallback');
        frameUri = file;
      }
      onProgress(0.30);
      await delay(150);
    }
    
    console.log('[Detection] Preparing image analysis...');
    onProgress(0.40);
    await delay(100);
    
    // Stage 3: Run face detection (40-55%)
    onProgress(0.42);
    console.log('[Detection] Running face detection...');
    
    const faceResult = await runFaceDetection(frameUri);
    const model1Score = faceResult.qualityScore;
    console.log('[Detection] Face detection score:', model1Score);
    onProgress(0.55);
    
    // Stage 4: Run deeper forensics (55-70%)
    console.log('[Detection] Running deeper forensics...');
    
    const model2Score = await runDeeperForensicsDetection(frameUri);
    console.log('[Detection] Deeper forensics score:', model2Score);
    onProgress(0.70);
    
    // Stage 5: Run liveness check (70-85%)
    console.log('[Detection] Running liveness check...');
    
    const model3Score = await runLivenessDetection(frameUri);
    console.log('[Detection] Liveness score:', model3Score);
    onProgress(0.85);
    
    // Stage 6: Run symmetry analysis (85-95%)
    console.log('[Detection] Running symmetry analysis...');
    
    const model4Score = await runFaceSymmetryAnalysis(frameUri);
    console.log('[Detection] Symmetry score:', model4Score);
    onProgress(0.92);
    
    // Stage 7: Calculate final score (95-100%)
    await delay(150);
    
    const scores = {
      model1: model1Score,
      model2: model2Score,
      model3: model3Score,
      model4: model4Score,
    };
    
    const confidence = calculateEnsembleScore(scores);
    const isProbablyDeepfake = confidence > DEEPFAKE_THRESHOLD;
    
    onProgress(0.98);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    const result = {
      confidence,
      model1: model1Score,
      model2: model2Score,
      model3: model3Score,
      model4: model4Score,
      isProbablyDeepfake,
      faces: faceResult.facesFound,
      processingTime,
      timestamp: Date.now(),
      fileType,
    };
    
    console.log('[Detection] Analysis complete:', result);
    onProgress(1.0);
    
    return result;
    
  } catch (error) {
    console.error('[Detection] Analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Quick scan for preliminary results (faster, less accurate)
 */
export async function quickScan(file, fileType) {
  const startTime = Date.now();
  
  let frameUri = file;
  if (fileType === 'video') {
    try {
      frameUri = await extractVideoFrame(file, 1000);
    } catch (e) {
      frameUri = file;
    }
  }
  
  // Only run face detection and forensics for quick scan
  const faceResult = await runFaceDetection(frameUri);
  const forensicsScore = await runDeeperForensicsDetection(frameUri);
  
  const quickConfidence = Math.round(
    (faceResult.qualityScore + forensicsScore) / 2
  );
  
  return {
    confidence: quickConfidence,
    isProbablyDeepfake: quickConfidence > DEEPFAKE_THRESHOLD,
    faces: faceResult.facesFound,
    processingTime: (Date.now() - startTime) / 1000,
    isQuickScan: true,
  };
}
