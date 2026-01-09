/**
 * ML Models Service - Heuristic-Based Implementation
 * 
 * This module provides deterministic, heuristic-based analysis functions
 * for deepfake detection. All processing happens on-device.
 * 
 * Each function returns a score 0-100 where:
 * - 0 = Very likely authentic
 * - 100 = Very likely fake/manipulated
 */

let modelsInitialized = false;

/**
 * Utility: Clamp a value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Utility: Calculate mean of an array
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Utility: Calculate standard deviation
 */
function stdDev(arr) {
  if (arr.length === 0) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Initialize ML system
 */
export async function initializeTensorFlow() {
  console.log('[ML] Initializing heuristic analysis system...');
  modelsInitialized = true;
  return true;
}

/**
 * Load all models (compatibility function)
 */
export async function loadAllModels(onProgress) {
  await initializeTensorFlow();
  onProgress?.(0.05);
  await new Promise(r => setTimeout(r, 100));
  onProgress?.(0.12);
  await new Promise(r => setTimeout(r, 100));
  onProgress?.(0.20);
  console.log('[ML] Heuristic models ready');
  return true;
}

/**
 * Extract pixel data from image data array
 * Expects RGBA or RGB flat array
 */
function getPixelAt(data, width, x, y, channels = 4) {
  const idx = (y * width + x) * channels;
  return {
    r: data[idx] || 0,
    g: data[idx + 1] || 0,
    b: data[idx + 2] || 0,
  };
}

/**
 * Convert RGB to grayscale
 */
function toGrayscale(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Check if a pixel is skin-tone (approximate)
 */
function isSkinTone(r, g, b) {
  // Simple skin detection based on RGB ratios
  // Works for various skin tones
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Basic conditions for skin-like colors
  return (
    r > 60 && g > 40 && b > 20 &&
    r > g && r > b &&
    (max - min) > 15 &&
    Math.abs(r - g) > 15 &&
    r > 80
  );
}

/**
 * MODEL 1: Face Detection Heuristic
 * 
 * Analyzes the image for face-like characteristics:
 * - Central region brightness (faces are usually centered)
 * - Contrast patterns typical of facial features
 * - Skin-tone pixel distribution
 * 
 * Returns: 0-100 (higher = more likely fake)
 */
export async function runFaceDetectionHeuristic(imageData, width, height) {
  console.log('[ML] Running face detection heuristic...');
  
  const channels = imageData.length / (width * height);
  const totalPixels = width * height;
  
  // Define face region (center 60% of image)
  const faceLeft = Math.floor(width * 0.2);
  const faceRight = Math.floor(width * 0.8);
  const faceTop = Math.floor(height * 0.1);
  const faceBottom = Math.floor(height * 0.9);
  
  let skinPixels = 0;
  let totalSampled = 0;
  let centralBrightness = [];
  let edgeBrightness = [];
  let skinToneVariances = [];
  
  // Sample pixels for analysis
  const stepX = Math.max(1, Math.floor(width / 50));
  const stepY = Math.max(1, Math.floor(height / 50));
  
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const pixel = getPixelAt(imageData, width, x, y, channels);
      const gray = toGrayscale(pixel.r, pixel.g, pixel.b);
      
      const isCentral = x >= faceLeft && x <= faceRight && y >= faceTop && y <= faceBottom;
      
      if (isCentral) {
        centralBrightness.push(gray);
        if (isSkinTone(pixel.r, pixel.g, pixel.b)) {
          skinPixels++;
          skinToneVariances.push(gray);
        }
      } else {
        edgeBrightness.push(gray);
      }
      totalSampled++;
    }
  }
  
  // Calculate metrics
  const skinRatio = skinPixels / Math.max(1, centralBrightness.length);
  const centralMean = mean(centralBrightness);
  const edgeMean = mean(edgeBrightness);
  const centralStd = stdDev(centralBrightness);
  const skinStd = stdDev(skinToneVariances);
  
  // Scoring logic
  let score = 50; // Start neutral
  
  // 1. Check skin pixel ratio (faces should have significant skin)
  if (skinRatio < 0.05) {
    // Very few skin pixels - might not be a face or heavily processed
    score += 25;
  } else if (skinRatio > 0.6) {
    // Too much uniform skin - suspicious
    score += 10;
  } else if (skinRatio >= 0.15 && skinRatio <= 0.45) {
    // Good natural range
    score -= 15;
  }
  
  // 2. Check central vs edge brightness contrast
  const brightnessDiff = Math.abs(centralMean - edgeMean);
  if (brightnessDiff < 10) {
    // Very flat image - unusual for natural photos
    score += 15;
  } else if (brightnessDiff > 80) {
    // Extreme contrast - could be edited
    score += 10;
  } else if (brightnessDiff >= 20 && brightnessDiff <= 50) {
    // Natural contrast range
    score -= 10;
  }
  
  // 3. Check central region variance (natural faces have texture)
  if (centralStd < 15) {
    // Too smooth/uniform - AI generated often has this
    score += 20;
  } else if (centralStd > 70) {
    // Very noisy - could be heavy processing
    score += 10;
  } else if (centralStd >= 25 && centralStd <= 50) {
    // Natural variance
    score -= 10;
  }
  
  // 4. Skin tone consistency
  if (skinToneVariances.length > 10) {
    if (skinStd < 8) {
      // Unnaturally uniform skin
      score += 15;
    } else if (skinStd >= 12 && skinStd <= 35) {
      // Natural skin variation
      score -= 10;
    }
  }
  
  const finalScore = clamp(Math.round(score), 0, 100);
  console.log(`[ML] Face detection score: ${finalScore} (skinRatio: ${skinRatio.toFixed(2)}, centralStd: ${centralStd.toFixed(1)})`);
  
  return {
    score: finalScore,
    facesDetected: skinRatio > 0.1 ? 1 : 0,
  };
}

/**
 * MODEL 2: Texture Artifact Heuristic
 * 
 * Analyzes local texture patterns:
 * - Deepfakes often have over-smoothed or patchy textures
 * - Look for unnatural local variance patterns
 * 
 * Returns: 0-100 (higher = more likely fake)
 */
export async function runTextureArtifactHeuristic(imageData, width, height) {
  console.log('[ML] Running texture artifact heuristic...');
  
  const channels = imageData.length / (width * height);
  
  // Analyze texture in blocks
  const blockSize = 8;
  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);
  
  let blockVariances = [];
  let smoothBlocks = 0;
  let noisyBlocks = 0;
  let totalBlocks = 0;
  
  for (let by = 1; by < blocksY - 1; by++) {
    for (let bx = 1; bx < blocksX - 1; bx++) {
      let blockPixels = [];
      
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const x = bx * blockSize + dx;
          const y = by * blockSize + dy;
          const pixel = getPixelAt(imageData, width, x, y, channels);
          blockPixels.push(toGrayscale(pixel.r, pixel.g, pixel.b));
        }
      }
      
      const blockStd = stdDev(blockPixels);
      blockVariances.push(blockStd);
      
      if (blockStd < 3) smoothBlocks++;
      if (blockStd > 40) noisyBlocks++;
      totalBlocks++;
    }
  }
  
  // Calculate texture metrics
  const avgVariance = mean(blockVariances);
  const varianceOfVariance = stdDev(blockVariances);
  const smoothRatio = smoothBlocks / Math.max(1, totalBlocks);
  const noisyRatio = noisyBlocks / Math.max(1, totalBlocks);
  
  // Scoring
  let score = 50;
  
  // 1. Check for over-smoothed regions (common in AI/deepfakes)
  if (smoothRatio > 0.4) {
    score += 25;
  } else if (smoothRatio > 0.25) {
    score += 15;
  } else if (smoothRatio < 0.1) {
    score -= 10;
  }
  
  // 2. Check for noisy/patchy regions
  if (noisyRatio > 0.3) {
    score += 15;
  } else if (noisyRatio < 0.05) {
    score -= 5;
  }
  
  // 3. Variance consistency (AI tends to have more uniform texture patterns)
  if (varianceOfVariance < 5) {
    // Too consistent - suspicious
    score += 20;
  } else if (varianceOfVariance > 25) {
    // Very inconsistent - could be edited
    score += 10;
  } else if (varianceOfVariance >= 10 && varianceOfVariance <= 20) {
    // Natural variation
    score -= 15;
  }
  
  // 4. Average texture level
  if (avgVariance < 8) {
    score += 15;
  } else if (avgVariance >= 12 && avgVariance <= 25) {
    score -= 10;
  }
  
  const finalScore = clamp(Math.round(score), 0, 100);
  console.log(`[ML] Texture score: ${finalScore} (smoothRatio: ${smoothRatio.toFixed(2)}, avgVar: ${avgVariance.toFixed(1)})`);
  
  return finalScore;
}

/**
 * MODEL 3: Color Consistency Heuristic
 * 
 * Analyzes color distribution:
 * - Check for unnatural color transitions
 * - Look for GAN artifacts in color space
 * - Skin tone consistency across regions
 * 
 * Returns: 0-100 (higher = more likely fake)
 */
export async function runColorConsistencyHeuristic(imageData, width, height) {
  console.log('[ML] Running color consistency heuristic...');
  
  const channels = imageData.length / (width * height);
  
  // Divide image into regions for color analysis
  const regionsX = 4;
  const regionsY = 4;
  const regionWidth = Math.floor(width / regionsX);
  const regionHeight = Math.floor(height / regionsY);
  
  let regionColors = [];
  let skinRegionColors = [];
  
  for (let ry = 0; ry < regionsY; ry++) {
    for (let rx = 0; rx < regionsX; rx++) {
      let regionR = [], regionG = [], regionB = [];
      let skinR = [], skinG = [], skinB = [];
      
      const startX = rx * regionWidth;
      const startY = ry * regionHeight;
      const step = Math.max(1, Math.floor(regionWidth / 10));
      
      for (let dy = 0; dy < regionHeight; dy += step) {
        for (let dx = 0; dx < regionWidth; dx += step) {
          const x = startX + dx;
          const y = startY + dy;
          if (x >= width || y >= height) continue;
          
          const pixel = getPixelAt(imageData, width, x, y, channels);
          regionR.push(pixel.r);
          regionG.push(pixel.g);
          regionB.push(pixel.b);
          
          if (isSkinTone(pixel.r, pixel.g, pixel.b)) {
            skinR.push(pixel.r);
            skinG.push(pixel.g);
            skinB.push(pixel.b);
          }
        }
      }
      
      regionColors.push({
        r: mean(regionR),
        g: mean(regionG),
        b: mean(regionB),
        stdR: stdDev(regionR),
        stdG: stdDev(regionG),
        stdB: stdDev(regionB),
      });
      
      if (skinR.length > 5) {
        skinRegionColors.push({
          r: mean(skinR),
          g: mean(skinG),
          b: mean(skinB),
        });
      }
    }
  }
  
  // Calculate color consistency metrics
  let colorJumps = 0;
  for (let i = 0; i < regionColors.length - 1; i++) {
    const curr = regionColors[i];
    const next = regionColors[i + 1];
    const diff = Math.abs(curr.r - next.r) + Math.abs(curr.g - next.g) + Math.abs(curr.b - next.b);
    if (diff > 100) colorJumps++;
  }
  
  // Skin tone consistency across regions
  let skinConsistency = 0;
  if (skinRegionColors.length >= 2) {
    const skinRValues = skinRegionColors.map(c => c.r);
    const skinGValues = skinRegionColors.map(c => c.g);
    const skinBValues = skinRegionColors.map(c => c.b);
    skinConsistency = (stdDev(skinRValues) + stdDev(skinGValues) + stdDev(skinBValues)) / 3;
  }
  
  // Check for unnaturally uniform colors within regions
  const avgIntraRegionStd = mean(regionColors.map(r => (r.stdR + r.stdG + r.stdB) / 3));
  
  // Scoring
  let score = 50;
  
  // 1. Color jumps between regions
  if (colorJumps > 8) {
    score += 15;
  } else if (colorJumps < 2) {
    score -= 10;
  }
  
  // 2. Skin tone consistency
  if (skinRegionColors.length >= 2) {
    if (skinConsistency < 5) {
      // Too uniform skin across regions - suspicious
      score += 20;
    } else if (skinConsistency > 30) {
      // Very inconsistent - could be composited
      score += 15;
    } else if (skinConsistency >= 8 && skinConsistency <= 20) {
      // Natural variation
      score -= 15;
    }
  }
  
  // 3. Intra-region color variation
  if (avgIntraRegionStd < 10) {
    // Unnaturally uniform
    score += 15;
  } else if (avgIntraRegionStd >= 20 && avgIntraRegionStd <= 40) {
    score -= 10;
  }
  
  const finalScore = clamp(Math.round(score), 0, 100);
  console.log(`[ML] Color consistency score: ${finalScore} (skinConsistency: ${skinConsistency.toFixed(1)}, colorJumps: ${colorJumps})`);
  
  return finalScore;
}

/**
 * MODEL 4: Symmetry and Structure Heuristic
 * 
 * Analyzes facial symmetry:
 * - AI-generated faces are often TOO symmetric
 * - Natural faces have subtle asymmetries
 * 
 * Returns: 0-100 (higher = more likely fake)
 */
export async function runSymmetryAndStructureHeuristic(imageData, width, height) {
  console.log('[ML] Running symmetry heuristic...');
  
  const channels = imageData.length / (width * height);
  const halfWidth = Math.floor(width / 2);
  
  // Compare left and right halves
  let symmetryDiffs = [];
  let perfectMatches = 0;
  let totalCompared = 0;
  
  const stepY = Math.max(1, Math.floor(height / 40));
  const stepX = Math.max(1, Math.floor(halfWidth / 40));
  
  // Focus on central face region
  const startY = Math.floor(height * 0.15);
  const endY = Math.floor(height * 0.85);
  const marginX = Math.floor(width * 0.1);
  
  for (let y = startY; y < endY; y += stepY) {
    for (let x = marginX; x < halfWidth; x += stepX) {
      const leftX = x;
      const rightX = width - 1 - x;
      
      const leftPixel = getPixelAt(imageData, width, leftX, y, channels);
      const rightPixel = getPixelAt(imageData, width, rightX, y, channels);
      
      const leftGray = toGrayscale(leftPixel.r, leftPixel.g, leftPixel.b);
      const rightGray = toGrayscale(rightPixel.r, rightPixel.g, rightPixel.b);
      
      const diff = Math.abs(leftGray - rightGray);
      symmetryDiffs.push(diff);
      
      if (diff < 3) perfectMatches++;
      totalCompared++;
    }
  }
  
  // Calculate symmetry metrics
  const avgSymmetryDiff = mean(symmetryDiffs);
  const symmetryStd = stdDev(symmetryDiffs);
  const perfectMatchRatio = perfectMatches / Math.max(1, totalCompared);
  
  // Scoring
  let score = 50;
  
  // 1. Perfect symmetry ratio (AI faces are often too symmetric)
  if (perfectMatchRatio > 0.5) {
    score += 25;
  } else if (perfectMatchRatio > 0.35) {
    score += 15;
  } else if (perfectMatchRatio < 0.15) {
    // Natural asymmetry
    score -= 15;
  }
  
  // 2. Average symmetry difference
  if (avgSymmetryDiff < 5) {
    // Too symmetric
    score += 20;
  } else if (avgSymmetryDiff > 30) {
    // Very asymmetric - could be natural or badly edited
    score += 5;
  } else if (avgSymmetryDiff >= 10 && avgSymmetryDiff <= 25) {
    // Natural asymmetry range
    score -= 15;
  }
  
  // 3. Symmetry consistency (natural faces have variable asymmetry)
  if (symmetryStd < 8) {
    // Too consistent
    score += 15;
  } else if (symmetryStd >= 12 && symmetryStd <= 25) {
    // Natural variation
    score -= 10;
  }
  
  const finalScore = clamp(Math.round(score), 0, 100);
  console.log(`[ML] Symmetry score: ${finalScore} (avgDiff: ${avgSymmetryDiff.toFixed(1)}, perfectRatio: ${perfectMatchRatio.toFixed(2)})`);
  
  return finalScore;
}

/**
 * Check if models are ready
 */
export function areModelsReady() {
  return modelsInitialized;
}

/**
 * Get memory info (compatibility)
 */
export function getMemoryInfo() {
  return { numTensors: 0, numDataBuffers: 0 };
}

/**
 * Dispose models (compatibility)
 */
export function disposeAllModels() {
  modelsInitialized = false;
}
