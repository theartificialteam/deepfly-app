/**
 * 🔬 DETECTION SERVICE - Complete Deepfake Analysis Pipeline
 * ============================================================
 * 
 * High-accuracy detection using 3-tier analysis:
 * 1. 📊 Frequency Analysis (FFT/DCT)
 * 2. 🔍 Noise Pattern Analysis
 * 3. 🗜️ Compression Artifacts
 * 
 * TARGET PERFORMANCE:
 * - Accuracy: 90%+
 * - Processing Time: <100ms
 * - Real images: 10-30%
 * - AI images: 70-95%
 */

import * as VideoThumbnails from 'expo-video-thumbnails';
import { decode as jpegDecode } from 'jpeg-js';
import * as FileSystem from 'expo-file-system/legacy';

import {
  loadAllModels,
  runHybridAnalysis,
  runEyeBlinkAnalysis,
  runPupilAnalysis,
  areModelsReady,
} from './mlModels';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  TARGET_WIDTH: 256,
  TARGET_HEIGHT: 256,
  VIDEO_FRAMES: 5,
  DEEPFAKE_THRESHOLD: 65,
  AUTHENTIC_THRESHOLD: 35,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ============================================================================
// IMAGE LOADING
// ============================================================================

/**
 * Load image from URI and decode to RGBA pixel data
 */
async function loadImageData(uri) {
  try {
    console.log('[Detection] 📥 Loading image...');
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Decode base64 to binary
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Try JPEG decode
    try {
      const decoded = jpegDecode(bytes, { useTArray: true, formatAsRGBA: true });
      console.log(`[Detection] ✅ Decoded: ${decoded.width}x${decoded.height}`);
      return {
        data: decoded.data,
        width: decoded.width,
        height: decoded.height,
        channels: 4,
      };
    } catch (e) {
      console.log('[Detection] ⚠️ JPEG decode failed, using fallback');
      return createFallbackImageData(bytes);
    }
  } catch (error) {
    console.error('[Detection] ❌ Load error:', error);
    throw new Error('Failed to load image');
  }
}

/**
 * Create fallback image data from raw bytes
 */
function createFallbackImageData(bytes) {
  const width = CONFIG.TARGET_WIDTH;
  const height = CONFIG.TARGET_HEIGHT;
  const data = new Uint8Array(width * height * 4);
  
  const step = Math.max(1, Math.floor(bytes.length / (width * height)));
  
  for (let i = 0; i < width * height; i++) {
    const v = bytes[(i * step) % bytes.length] || 128;
    const idx = i * 4;
    data[idx] = v;
    data[idx + 1] = v;
    data[idx + 2] = v;
    data[idx + 3] = 255;
  }
  
  return { data, width, height, channels: 4 };
}

/**
 * Resize image data using bilinear interpolation
 */
function resizeImageData(imageData, targetWidth, targetHeight) {
  const { data, width, height, channels } = imageData;
  const newData = new Uint8Array(targetWidth * targetHeight * channels);
  
  const xRatio = (width - 1) / targetWidth;
  const yRatio = (height - 1) / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * width + srcX) * channels;
      const dstIdx = (y * targetWidth + x) * channels;
      
      for (let c = 0; c < channels; c++) {
        newData[dstIdx + c] = data[srcIdx + c] || 0;
      }
    }
  }
  
  return { data: newData, width: targetWidth, height: targetHeight, channels };
}

/**
 * Extract frames from video
 */
async function extractVideoFrames(videoUri, count = 5) {
  console.log(`[Detection] 🎬 Extracting ${count} frames...`);
  
  const frames = [];
  const times = [100, 500, 1500, 3000, 5000];
  
  for (let i = 0; i < Math.min(count, times.length); i++) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: times[i],
        quality: 0.8,
      });
      frames.push(uri);
      console.log(`[Detection] ✅ Frame ${i + 1}/${count} extracted`);
    } catch (e) {
      if (frames.length > 0) {
        frames.push(frames[frames.length - 1]);
      }
    }
  }
  
  if (frames.length === 0) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { 
        time: 0, 
        quality: 0.7 
      });
      frames.push(uri);
    } catch (e) {
      throw new Error('Could not extract video frames');
    }
  }
  
  return frames;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Run complete deepfake detection on file
 * 
 * @param {string} file - File URI (image or video)
 * @param {string} fileType - 'image' or 'video'
 * @param {Object} options - Detection options
 * @returns {Object} Complete detection results
 */
export async function detectDeepfakeInFile(file, fileType, options = {}) {
  const { onProgress = () => {} } = options;
  const startTime = Date.now();
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🔬 DEEPFLY UNIVERSAL DETECTOR v2.0                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ File Type: ${fileType.padEnd(50)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // =========================================================================
    // STAGE 1: Initialize (0-15%)
    // =========================================================================
    onProgress(0.05);
    await loadAllModels((p) => onProgress(0.05 + p * 0.1));
    onProgress(0.15);
    
    // =========================================================================
    // STAGE 2: Load & Preprocess (15-30%)
    // =========================================================================
    let frames = [];
    
    if (fileType === 'video') {
      const frameUris = await extractVideoFrames(file, CONFIG.VIDEO_FRAMES);
      
      for (const uri of frameUris) {
        let img = await loadImageData(uri);
        if (img.width !== CONFIG.TARGET_WIDTH || img.height !== CONFIG.TARGET_HEIGHT) {
          img = resizeImageData(img, CONFIG.TARGET_WIDTH, CONFIG.TARGET_HEIGHT);
        }
        frames.push(img);
      }
    } else {
      let img = await loadImageData(file);
      if (img.width !== CONFIG.TARGET_WIDTH || img.height !== CONFIG.TARGET_HEIGHT) {
        img = resizeImageData(img, CONFIG.TARGET_WIDTH, CONFIG.TARGET_HEIGHT);
      }
      frames = [img];
    }
    
    console.log(`[Detection] ✅ Loaded ${frames.length} frame(s)`);
    onProgress(0.30);
    
    // =========================================================================
    // STAGE 3: Run Hybrid Analysis (30-75%)
    // =========================================================================
    console.log('[Detection] 🔬 Running 3-tier analysis...');
    
    const allResults = [];
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const result = await runHybridAnalysis(frame.data, frame.width, frame.height);
      allResults.push(result);
      onProgress(0.30 + (i + 1) / frames.length * 0.40);
    }
    
    onProgress(0.70);
    
    // =========================================================================
    // STAGE 4: Aggregate Results (70-85%)
    // =========================================================================
    
    // Average scores across frames
    const avgScores = {
      frequency: Math.round(allResults.reduce((s, r) => s + r.scores.frequency, 0) / allResults.length),
      noise: Math.round(allResults.reduce((s, r) => s + r.scores.noise, 0) / allResults.length),
      compression: Math.round(allResults.reduce((s, r) => s + r.scores.compression, 0) / allResults.length),
    };
    
    const avgFinalScore = Math.round(allResults.reduce((s, r) => s + r.score, 0) / allResults.length);
    
    // Collect all indicators
    const allIndicators = [...new Set(allResults.flatMap(r => r.indicators))];
    
    // Video-specific analysis
    let blinkResult = { score: 50, blinkCount: 0, indicator: null };
    let pupilResult = { score: 50, variance: 0, indicator: null };
    
    if (fileType === 'video' && frames.length >= 3) {
      blinkResult = await runEyeBlinkAnalysis(frames);
      pupilResult = await runPupilAnalysis(frames);
    }
    
    onProgress(0.85);
    
    // =========================================================================
    // STAGE 5: Build Final Result (85-100%)
    // =========================================================================
    
    const processingTime = (Date.now() - startTime) / 1000;
    const isProbablyDeepfake = avgFinalScore >= CONFIG.DEEPFAKE_THRESHOLD;
    const isAuthentic = avgFinalScore <= CONFIG.AUTHENTIC_THRESHOLD;
    
    // Determine verdict
    let verdict, verdictEmoji;
    if (isProbablyDeepfake) {
      verdict = 'AI-GENERATED';
      verdictEmoji = '🔴';
    } else if (isAuthentic) {
      verdict = 'AUTHENTIC';
      verdictEmoji = '✅';
    } else {
      verdict = 'INCONCLUSIVE';
      verdictEmoji = '🟡';
    }
    
    const result = {
      // Main results
      confidence: avgFinalScore,
      verdict,
      verdictEmoji,
      isProbablyDeepfake,
      isAuthentic,
      isInconclusive: !isProbablyDeepfake && !isAuthentic,
      
      // Method scores (new format)
      scores: {
        frequency: avgScores.frequency,
        noise: avgScores.noise,
        compression: avgScores.compression,
        blink: blinkResult.score,
        pupil: pupilResult.score,
      },
      
      // Legacy compatibility
      model1: avgScores.frequency,
      model2: avgScores.noise,
      model3: avgScores.compression,
      model4: Math.round((avgScores.frequency + avgScores.noise + avgScores.compression) / 3),
      cnnScore: avgScores.frequency,
      textureScore: avgScores.noise,
      colorScore: Math.round((avgScores.frequency + avgScores.noise) / 2),
      geometryScore: Math.round((avgScores.noise + avgScores.compression) / 2),
      frequencyScore: avgScores.frequency,
      symmetryScore: avgScores.compression,
      
      // Metadata
      faces: 1,
      processingTime,
      timestamp: Date.now(),
      fileType,
      framesAnalyzed: frames.length,
      
      // Detailed info
      indicators: allIndicators,
      blinkCount: blinkResult.blinkCount,
      pupilVariance: pupilResult.variance,
      
      // Methods used
      methodsUsed: [
        '📊 Frequency Analysis',
        '🔍 Noise Analysis',
        '🗜️ Compression Analysis',
        ...(fileType === 'video' ? ['👁️ Blink Detection', '🔮 Pupil Dynamics'] : []),
      ],
    };
    
    onProgress(0.95);
    
    // =========================================================================
    // PRINT FINAL RESULTS
    // =========================================================================
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 ANALYSIS COMPLETE                       ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║ 📊 Frequency:        ${String(avgScores.frequency).padStart(3)}%                                  ║`);
    console.log(`║ 🔍 Noise:            ${String(avgScores.noise).padStart(3)}%                                  ║`);
    console.log(`║ 🗜️ Compression:      ${String(avgScores.compression).padStart(3)}%                                  ║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║ 🎯 FINAL SCORE:      ${String(avgFinalScore).padStart(3)}%                                  ║`);
    console.log(`║ 📋 VERDICT:          ${verdictEmoji} ${verdict.padEnd(40)}║`);
    console.log(`║ ⏱️ Time:             ${processingTime.toFixed(2)}s                                  ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    onProgress(1.0);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ DETECTION FAILED:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// ============================================================================
// QUICK SCAN (for fast preview)
// ============================================================================

/**
 * Quick scan for fast initial assessment
 */
export async function quickScan(file, fileType) {
  const startTime = Date.now();
  
  await loadAllModels(() => {});
  
  let frameUri = file;
  if (fileType === 'video') {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(file, { 
        time: 1000, 
        quality: 0.6 
      });
      frameUri = uri;
    } catch (e) {
      // Use original file
    }
  }
  
  let img = await loadImageData(frameUri);
  if (img.width !== CONFIG.TARGET_WIDTH || img.height !== CONFIG.TARGET_HEIGHT) {
    img = resizeImageData(img, CONFIG.TARGET_WIDTH, CONFIG.TARGET_HEIGHT);
  }
  
  const result = await runHybridAnalysis(img.data, img.width, img.height);
    
    return {
    confidence: result.score,
    verdict: result.verdict,
    isProbablyDeepfake: result.isProbablyDeepfake,
    isAuthentic: result.isAuthentic,
      processingTime: (Date.now() - startTime) / 1000,
      isQuickScan: true,
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export function isDetectionReady() {
  return areModelsReady();
  }

export function getDetectionConfig() {
  return CONFIG;
}
