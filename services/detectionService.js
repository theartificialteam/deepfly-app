/**
 * Detection Service - Complete Deepfake Analysis Pipeline
 * =========================================================
 * 
 * Runs hybrid analysis (Model + Heuristics) and returns detailed results
 * for beautiful UI display.
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

const DEEPFAKE_THRESHOLD = 65;
const TARGET_WIDTH = 224;
const TARGET_HEIGHT = 224;

// Ensemble weights
const WEIGHTS = {
  image: {
    cnn: 0.25,
    texture: 0.20,
    color: 0.15,
    geometry: 0.15,
    frequency: 0.15,
    symmetry: 0.10,
  },
  video: {
    cnn: 0.20,
    texture: 0.15,
    color: 0.10,
    geometry: 0.10,
    frequency: 0.10,
    symmetry: 0.10,
    blink: 0.15,
    pupil: 0.10,
  },
};

// ============================================================================
// IMAGE LOADING
// ============================================================================

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

async function loadImageData(uri) {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    try {
      const decoded = jpegDecode(bytes, { useTArray: true, formatAsRGBA: true });
      return {
        data: decoded.data,
        width: decoded.width,
        height: decoded.height,
        channels: 4,
      };
    } catch {
      return createFallbackImageData(bytes);
    }
  } catch (error) {
    console.error('[Detection] Load error:', error);
    return createFallbackImageData(new Uint8Array(1000));
  }
}

function createFallbackImageData(bytes) {
  const width = TARGET_WIDTH;
  const height = TARGET_HEIGHT;
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

async function extractVideoFrames(videoUri, count = 5) {
  const frames = [];
  const times = [100, 500, 1500, 3000, 5000];
  
  for (let i = 0; i < Math.min(count, times.length); i++) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: times[i],
        quality: 0.8,
      });
      frames.push(uri);
    } catch {
      if (frames.length > 0) frames.push(frames[frames.length - 1]);
    }
  }
  
  if (frames.length === 0) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 0, quality: 0.7 });
      frames.push(uri);
    } catch {}
  }
  
  return frames;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Run complete deepfake detection
 * Returns detailed results for UI display
 */
export async function detectDeepfakeInFile(file, fileType, options = {}) {
  const { onProgress = () => {} } = options;
  const startTime = Date.now();
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           DEEPFLY DEEPFAKE DETECTION                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║ File Type: ${fileType.padEnd(48)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Stage 1: Initialize (0-15%)
    onProgress(0.05);
    await loadAllModels((p) => onProgress(0.05 + p * 0.1));
    onProgress(0.15);
    
    // Stage 2: Load frames (15-30%)
    let frames = [];
    
    if (fileType === 'video') {
      console.log('[Detection] 🎬 Extracting video frames...');
      const frameUris = await extractVideoFrames(file, 5);
      
      for (const uri of frameUris) {
        let img = await loadImageData(uri);
        if (img.width !== TARGET_WIDTH || img.height !== TARGET_HEIGHT) {
          img = resizeImageData(img, TARGET_WIDTH, TARGET_HEIGHT);
        }
        frames.push(img);
      }
      console.log(`[Detection] ✅ Loaded ${frames.length} frames`);
    } else {
      console.log('[Detection] 🖼️ Loading image...');
      let img = await loadImageData(file);
      if (img.width !== TARGET_WIDTH || img.height !== TARGET_HEIGHT) {
        img = resizeImageData(img, TARGET_WIDTH, TARGET_HEIGHT);
      }
      frames = [img];
      console.log(`[Detection] ✅ Image loaded (${img.width}x${img.height})`);
    }
    
    onProgress(0.30);
    
    // Stage 3: Run hybrid analysis on all frames (30-70%)
    console.log('\n[Detection] 🔬 Running Hybrid Analysis...');
    
    const allResults = [];
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const result = await runHybridAnalysis(frame.data, frame.width, frame.height);
      allResults.push(result);
      onProgress(0.30 + (i + 1) / frames.length * 0.35);
    }
    
    // Average frame results
    const avgResults = {
      cnnScore: Math.round(allResults.reduce((s, r) => s + r.cnnScore, 0) / allResults.length),
      textureScore: Math.round(allResults.reduce((s, r) => s + r.textureScore, 0) / allResults.length),
      colorScore: Math.round(allResults.reduce((s, r) => s + r.colorScore, 0) / allResults.length),
      geometryScore: Math.round(allResults.reduce((s, r) => s + r.geometryScore, 0) / allResults.length),
      frequencyScore: Math.round(allResults.reduce((s, r) => s + r.frequencyScore, 0) / allResults.length),
      symmetryScore: Math.round(allResults.reduce((s, r) => s + r.symmetryScore, 0) / allResults.length),
      indicators: [...new Set(allResults.flatMap(r => r.indicators))],
      facesDetected: Math.max(...allResults.map(r => r.facesDetected)),
    };
    
    onProgress(0.65);
    
    // Stage 4: Video-specific analysis (65-85%)
    let blinkResult = { score: 50, blinkCount: 0, indicator: null };
    let pupilResult = { score: 50, variance: 0, indicator: null };
    
    if (fileType === 'video' && frames.length >= 3) {
      console.log('\n[Detection] 👁️ Running Video Analysis...');
      blinkResult = await runEyeBlinkAnalysis(frames);
      pupilResult = await runPupilAnalysis(frames);
      
      if (blinkResult.indicator) avgResults.indicators.push(blinkResult.indicator);
      if (pupilResult.indicator) avgResults.indicators.push(pupilResult.indicator);
    }
    
    onProgress(0.85);
    
    // Stage 5: Calculate final score (85-95%)
    console.log('\n[Detection] 📊 Calculating Final Score...');
    
    const w = fileType === 'image' ? WEIGHTS.image : WEIGHTS.video;
    
    let finalScore;
    if (fileType === 'image') {
      finalScore = (
        avgResults.cnnScore * w.cnn +
        avgResults.textureScore * w.texture +
        avgResults.colorScore * w.color +
        avgResults.geometryScore * w.geometry +
        avgResults.frequencyScore * w.frequency +
        avgResults.symmetryScore * w.symmetry
      );
    } else {
      finalScore = (
        avgResults.cnnScore * w.cnn +
        avgResults.textureScore * w.texture +
        avgResults.colorScore * w.color +
        avgResults.geometryScore * w.geometry +
        avgResults.frequencyScore * w.frequency +
        avgResults.symmetryScore * w.symmetry +
        blinkResult.score * w.blink +
        pupilResult.score * w.pupil
      );
    }
    
    // Indicator boost
    if (avgResults.indicators.length >= 3) {
      finalScore = Math.max(finalScore, 75);
    } else if (avgResults.indicators.length >= 2) {
      finalScore = Math.max(finalScore, 65);
    }
    
    finalScore = clamp(Math.round(finalScore), 0, 100);
    const isProbablyDeepfake = finalScore >= DEEPFAKE_THRESHOLD;
    
    onProgress(0.95);
    
    // Build detailed result object
    const processingTime = (Date.now() - startTime) / 1000;
    
    const result = {
      // Main scores
      confidence: finalScore,
      isProbablyDeepfake,
      
      // Individual method scores (for UI display)
      scores: {
        cnn: avgResults.cnnScore,
        texture: avgResults.textureScore,
        color: avgResults.colorScore,
        geometry: avgResults.geometryScore,
        frequency: avgResults.frequencyScore,
        symmetry: avgResults.symmetryScore,
        blink: blinkResult.score,
        pupil: pupilResult.score,
      },
      
      // Legacy fields (for compatibility)
      model1: avgResults.cnnScore,
      model2: avgResults.textureScore,
      model3: avgResults.frequencyScore,
      model4: avgResults.symmetryScore,
      
      // Metadata
      faces: avgResults.facesDetected,
      processingTime,
      timestamp: Date.now(),
      fileType,
      
      // Detailed info
      indicators: avgResults.indicators,
      framesAnalyzed: frames.length,
      blinkCount: blinkResult.blinkCount,
      pupilVariance: pupilResult.variance,
      
      // Methods used
      methodsUsed: [
        '🧠 CNN / Pattern Analysis',
        '🔍 Texture Analysis',
        '🎨 Color Analysis',
        '📐 Geometry Analysis',
        '📊 Frequency Analysis',
        '⚖️ Symmetry Analysis',
        ...(fileType === 'video' ? ['👁️ Eye Blink Detection', '🔮 Pupil Dynamics'] : []),
      ],
    };
    
    // Print final results
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ANALYSIS COMPLETE                       ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ 🧠 CNN/Pattern:     ${String(result.scores.cnn).padStart(3)}%                                 ║`);
    console.log(`║ 🔍 Texture:         ${String(result.scores.texture).padStart(3)}%                                 ║`);
    console.log(`║ 🎨 Color:           ${String(result.scores.color).padStart(3)}%                                 ║`);
    console.log(`║ 📐 Geometry:        ${String(result.scores.geometry).padStart(3)}%                                 ║`);
    console.log(`║ 📊 Frequency:       ${String(result.scores.frequency).padStart(3)}%                                 ║`);
    console.log(`║ ⚖️ Symmetry:        ${String(result.scores.symmetry).padStart(3)}%                                 ║`);
    if (fileType === 'video') {
      console.log(`║ 👁️ Eye Blink:       ${String(result.scores.blink).padStart(3)}%                                 ║`);
      console.log(`║ 🔮 Pupil:           ${String(result.scores.pupil).padStart(3)}%                                 ║`);
    }
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ 🎯 FINAL SCORE:     ${String(finalScore).padStart(3)}%                                 ║`);
    console.log(`║ 📋 VERDICT:         ${isProbablyDeepfake ? '🔴 LIKELY DEEPFAKE' : '✅ LIKELY AUTHENTIC'}                    ║`);
    console.log(`║ ⏱️ Time:            ${processingTime.toFixed(2)}s                                 ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    onProgress(1.0);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ DETECTION FAILED:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export function isDetectionReady() {
  return areModelsReady();
}

export function getDetectionConfig() {
  return {
    targetSize: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
    deepfakeThreshold: DEEPFAKE_THRESHOLD,
    weights: WEIGHTS,
  };
}

export async function quickScan(file, fileType) {
  const startTime = Date.now();
  
  await loadAllModels(() => {});
  
  let frameUri = file;
  if (fileType === 'video') {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(file, { time: 1000, quality: 0.6 });
      frameUri = uri;
    } catch {}
  }
  
  let img = await loadImageData(frameUri);
  if (img.width !== TARGET_WIDTH || img.height !== TARGET_HEIGHT) {
    img = resizeImageData(img, TARGET_WIDTH, TARGET_HEIGHT);
  }
  
  const result = await runHybridAnalysis(img.data, img.width, img.height);
  const quickScore = Math.round((result.cnnScore + result.textureScore + result.frequencyScore) / 3);
  
  return {
    confidence: quickScore,
    isProbablyDeepfake: quickScore >= DEEPFAKE_THRESHOLD,
    faces: result.facesDetected,
    processingTime: (Date.now() - startTime) / 1000,
    isQuickScan: true,
  };
}
