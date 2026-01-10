/**
 * 🧪 DETECTION SYSTEM TEST v2
 * ============================
 * 
 * Tests with more realistic simulated images.
 * Run with: node test-detection.js
 */

// ============================================================================
// CREATE REALISTIC TEST IMAGES
// ============================================================================

function createTestImage(type) {
  const width = 256;
  const height = 256;
  const data = new Uint8Array(width * height * 4);
  
  if (type === 'real') {
    // Simulate a REAL photo with:
    // - High natural noise (camera sensor noise)
    // - High variance between pixels
    // - Natural color variation
    // - JPEG-like block artifacts
    for (let i = 0; i < width * height; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      
      // Stronger base variation
      const baseR = 160 + Math.floor(Math.random() * 60 - 30);
      const baseG = 130 + Math.floor(Math.random() * 50 - 25);
      const baseB = 110 + Math.floor(Math.random() * 45 - 22);
      
      // Strong natural camera noise (typical of real photos)
      const noise = Math.floor(Math.random() * 30 - 15);
      
      // Add some JPEG-like block edge artifacts
      const blockEdge = (x % 8 === 0 || y % 8 === 0) ? 
        Math.floor(Math.random() * 10 - 5) : 0;
      
      // Natural texture variation
      const texture = Math.floor(Math.sin(x * 0.1) * 10 + Math.cos(y * 0.1) * 10);
      
      const idx = i * 4;
      data[idx] = Math.min(255, Math.max(0, baseR + noise + blockEdge + texture));
      data[idx + 1] = Math.min(255, Math.max(0, baseG + noise + blockEdge + texture));
      data[idx + 2] = Math.min(255, Math.max(0, baseB + noise + blockEdge + texture));
      data[idx + 3] = 255;
    }
  } else if (type === 'ai') {
    // Simulate an AI-generated image with:
    // - Very low noise (too clean)
    // - Very uniform colors
    // - Checkerboard pattern (GAN artifact)
    // - No JPEG artifacts
    for (let i = 0; i < width * height; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      
      // Very uniform base color
      const baseR = 175;
      const baseG = 140;
      const baseB = 120;
      
      // Almost no noise (AI signature)
      const noise = Math.floor(Math.random() * 4 - 2);
      
      // Subtle checkerboard (GAN artifact)
      const checker = ((x % 8 < 4) !== (y % 8 < 4)) ? 3 : 0;
      
      // Perfect smooth gradient
      const centerX = width / 2;
      const centerY = height / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const gradient = Math.max(0, 1 - dist / 180) * 30;
      
      const idx = i * 4;
      data[idx] = Math.min(255, Math.max(0, baseR + noise + checker + gradient));
      data[idx + 1] = Math.min(255, Math.max(0, baseG + noise + checker + gradient));
      data[idx + 2] = Math.min(255, Math.max(0, baseB + noise + checker + gradient));
      data[idx + 3] = 255;
    }
  }
  
  return { data, width, height };
}

// ============================================================================
// ANALYSIS FUNCTIONS (Matching the updated modules)
// ============================================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (!arr || arr.length < 2) return 0;
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / arr.length);
}

function getPixelGray(data, width, x, y) {
  const idx = (y * width + x) * 4;
  const r = data[idx] || 0;
  const g = data[idx + 1] || 0;
  const b = data[idx + 2] || 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ============================================================================
// FREQUENCY ANALYSIS (Updated logic)
// ============================================================================

function analyzeFrequency(data, width, height) {
  const BLOCK_SIZE = 8;
  let blockVariances = [];
  let lowVarianceBlocks = 0;
  let totalBlocks = 0;
  let acEnergies = [];
  
  for (let by = 0; by < height - BLOCK_SIZE; by += BLOCK_SIZE) {
    for (let bx = 0; bx < width - BLOCK_SIZE; bx += BLOCK_SIZE) {
      let block = [];
      for (let dy = 0; dy < BLOCK_SIZE; dy++) {
        for (let dx = 0; dx < BLOCK_SIZE; dx++) {
          block.push(getPixelGray(data, width, bx + dx, by + dy));
        }
      }
      
      const variance = stdDev(block);
      blockVariances.push(variance);
      acEnergies.push(variance);
      if (variance < 3) lowVarianceBlocks++;
      totalBlocks++;
    }
  }
  
  const avgVariance = mean(blockVariances);
  const varianceOfVariance = stdDev(blockVariances);
  const cvAC = varianceOfVariance / Math.max(1, avgVariance);
  const lowVarRatio = lowVarianceBlocks / Math.max(1, totalBlocks);
  const avgAC = mean(acEnergies);
  
  let score = 35; // Start lower
  
  // Block complexity
  if (avgVariance < 4) score += 40;
  else if (avgVariance < 8) score += 20;
  else if (avgVariance > 20) score -= 25;
  else if (avgVariance > 14) score -= 15;
  else if (avgVariance > 10) score -= 8;
  
  // Variance uniformity  
  if (cvAC < 0.3) score += 25;
  else if (cvAC < 0.5) score += 12;
  else if (cvAC > 0.8) score -= 20;
  else if (cvAC > 0.6) score -= 10;
  
  // Low variance ratio
  if (lowVarRatio > 0.4) score += 25;
  else if (lowVarRatio > 0.2) score += 10;
  else if (lowVarRatio < 0.05) score -= 15;
  else if (lowVarRatio < 0.1) score -= 8;
  
  // AC energy
  if (avgAC < 5) score += 20;
  else if (avgAC < 10) score += 8;
  else if (avgAC > 20) score -= 15;
  else if (avgAC > 15) score -= 8;
  
  return clamp(Math.round(score), 0, 100);
}

// ============================================================================
// NOISE ANALYSIS (Updated logic)
// ============================================================================

function analyzeNoise(data, width, height) {
  // Laplacian filter
  const laplacianValues = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const center = getPixelGray(data, width, x, y);
      const top = getPixelGray(data, width, x, y - 1);
      const bottom = getPixelGray(data, width, x, y + 1);
      const left = getPixelGray(data, width, x - 1, y);
      const right = getPixelGray(data, width, x + 1, y);
      
      const laplacian = 4 * center - top - bottom - left - right;
      laplacianValues.push(laplacian);
    }
  }
  
  const noiseStd = stdDev(laplacianValues);
  
  let score = 35; // Start lower
  
  // Noise level - most important
  if (noiseStd < 3) score += 45;
  else if (noiseStd < 8) score += 25;
  else if (noiseStd < 12) score += 10;
  else if (noiseStd > 30) score -= 30;
  else if (noiseStd > 22) score -= 20;
  else if (noiseStd > 15) score -= 10;
  
  return clamp(Math.round(score), 0, 100);
}

// ============================================================================
// COMPRESSION ANALYSIS (Updated logic)
// ============================================================================

function analyzeCompression(data, width, height) {
  const BLOCK_SIZE = 8;
  let boundaryDiffs = [];
  let internalDiffs = [];
  let blockVariances = [];
  
  // Check 8x8 block boundaries vs internal
  for (let y = BLOCK_SIZE; y < height - BLOCK_SIZE; y += BLOCK_SIZE) {
    for (let x = 0; x < width; x++) {
      const above = getPixelGray(data, width, x, y - 1);
      const below = getPixelGray(data, width, x, y);
      boundaryDiffs.push(Math.abs(above - below));
    }
  }
  
  for (let y = BLOCK_SIZE + 4; y < height - BLOCK_SIZE; y += BLOCK_SIZE) {
    for (let x = 0; x < width; x++) {
      const above = getPixelGray(data, width, x, y - 1);
      const below = getPixelGray(data, width, x, y);
      internalDiffs.push(Math.abs(above - below));
    }
  }
  
  // Block variances
  for (let by = 0; by < height - BLOCK_SIZE; by += BLOCK_SIZE) {
    for (let bx = 0; bx < width - BLOCK_SIZE; bx += BLOCK_SIZE) {
      let block = [];
      for (let dy = 0; dy < BLOCK_SIZE; dy++) {
        for (let dx = 0; dx < BLOCK_SIZE; dx++) {
          block.push(getPixelGray(data, width, bx + dx, by + dy));
        }
      }
      blockVariances.push(stdDev(block));
    }
  }
  
  const avgBoundary = mean(boundaryDiffs);
  const avgInternal = mean(internalDiffs);
  const ratio = avgBoundary / Math.max(1, avgInternal);
  const avgBlockVar = mean(blockVariances);
  
  let score = 35; // Start lower
  
  // JPEG block structure
  if (ratio < 0.92) score += 25;
  else if (ratio < 0.97) score += 12;
  else if (ratio > 1.08) score -= 20;
  else if (ratio > 1.03) score -= 10;
  
  // Block variance
  if (avgBlockVar < 5) score += 25;
  else if (avgBlockVar < 10) score += 12;
  else if (avgBlockVar > 25) score -= 20;
  else if (avgBlockVar > 18) score -= 10;
  
  return clamp(Math.round(score), 0, 100);
}

// ============================================================================
// MAIN TEST
// ============================================================================

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║     🧪 DEEPFLY DETECTION SYSTEM TEST v2 (Updated Logic)      ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Test 1: Real Image
console.log('📷 TEST 1: Simulated REAL Photo (with noise & JPEG artifacts)');
console.log('─────────────────────────────────────────');
const realImg = createTestImage('real');
const realFreq = analyzeFrequency(realImg.data, realImg.width, realImg.height);
const realNoise = analyzeNoise(realImg.data, realImg.width, realImg.height);
const realComp = analyzeCompression(realImg.data, realImg.width, realImg.height);
const realFinal = Math.round(realFreq * 0.4 + realNoise * 0.35 + realComp * 0.25);

console.log(`   📊 Frequency:    ${realFreq}%`);
console.log(`   🔍 Noise:        ${realNoise}%`);
console.log(`   🗜️ Compression:  ${realComp}%`);
console.log(`   ─────────────────────`);
console.log(`   🎯 FINAL:        ${realFinal}%`);
console.log(`   📋 VERDICT:      ${realFinal < 35 ? '✅ AUTHENTIC' : realFinal < 65 ? '🟡 INCONCLUSIVE' : '🔴 AI-GENERATED'}`);
console.log(`   ✓ Expected:      10-35% (AUTHENTIC)`);
console.log(`   ${realFinal <= 35 ? '✅ PASS' : realFinal <= 50 ? '⚠️ CLOSE' : '❌ FAIL'}\n`);

// Test 2: AI Image
console.log('🤖 TEST 2: Simulated AI-Generated Image (smooth, uniform)');
console.log('─────────────────────────────────────────');
const aiImg = createTestImage('ai');
const aiFreq = analyzeFrequency(aiImg.data, aiImg.width, aiImg.height);
const aiNoise = analyzeNoise(aiImg.data, aiImg.width, aiImg.height);
const aiComp = analyzeCompression(aiImg.data, aiImg.width, aiImg.height);
const aiFinal = Math.round(aiFreq * 0.4 + aiNoise * 0.35 + aiComp * 0.25);

console.log(`   📊 Frequency:    ${aiFreq}%`);
console.log(`   🔍 Noise:        ${aiNoise}%`);
console.log(`   🗜️ Compression:  ${aiComp}%`);
console.log(`   ─────────────────────`);
console.log(`   🎯 FINAL:        ${aiFinal}%`);
console.log(`   📋 VERDICT:      ${aiFinal < 35 ? '✅ AUTHENTIC' : aiFinal < 65 ? '🟡 INCONCLUSIVE' : '🔴 AI-GENERATED'}`);
console.log(`   ✓ Expected:      65-95% (AI-GENERATED)`);
console.log(`   ${aiFinal >= 65 ? '✅ PASS' : aiFinal >= 55 ? '⚠️ CLOSE' : '❌ FAIL'}\n`);

// Summary
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                       📊 TEST SUMMARY                         ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
const realPass = realFinal <= 35;
const aiPass = aiFinal >= 65;
const separation = aiFinal - realFinal;
console.log(`║ Real Photo:    ${realPass ? '✅ PASS' : realFinal <= 50 ? '⚠️ CLOSE' : '❌ FAIL'} (${realFinal}%, target ≤35%)               ║`);
console.log(`║ AI Image:      ${aiPass ? '✅ PASS' : aiFinal >= 55 ? '⚠️ CLOSE' : '❌ FAIL'} (${aiFinal}%, target ≥65%)               ║`);
console.log(`║ Separation:    ${separation >= 30 ? '✅ GOOD' : separation >= 20 ? '⚠️ OK' : '❌ LOW'} (${separation}% difference)               ║`);
console.log('╠══════════════════════════════════════════════════════════════╣');
if (realPass && aiPass && separation >= 30) {
  console.log('║          🎉 ALL TESTS PASSED! Detection working well.         ║');
} else if (separation >= 25) {
  console.log('║          ⚠️ Close enough - fine tuning may help.              ║');
} else {
  console.log('║          ❌ Tests need attention. Review thresholds.          ║');
}
console.log('╚══════════════════════════════════════════════════════════════╝\n');
