/**
 * 🧪 ADVANCED STRESS TEST v2.0 - Maximum Difficulty
 * ===================================================
 * 
 * Tests the detection system with:
 * - 5 analysis methods (including NEW edge + texture)
 * - Multiple image types
 * - Edge cases designed to fool the detector
 * - Statistical analysis
 * - Confusion matrix
 * 
 * Run with: node test-advanced.js
 */

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║      🧪 DEEPFLY ADVANCED STRESS TEST v2.0 - 5 METHODS                   ║');
console.log('║                                                                          ║');
console.log('║  Testing 16 different image scenarios including edge cases              ║');
console.log('║  NEW: Edge Coherence + Statistical Texture Analysis                      ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝');
console.log('\n');

// ============================================================================
// UTILITY FUNCTIONS
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

function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// ============================================================================
// IMAGE GENERATORS - 16 Different Scenarios
// ============================================================================

const IMAGE_SCENARIOS = {
  // ==================== REAL IMAGES (8 types) ====================
  
  'REAL_SELFIE': {
    type: 'real',
    name: '📷 Real Selfie (indoor, natural light)',
    description: 'Typical smartphone selfie with sensor noise',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Skin tone with natural variation
        const baseR = 180 + gaussianRandom() * 25;
        const baseG = 145 + gaussianRandom() * 20;
        const baseB = 125 + gaussianRandom() * 18;
        
        // Strong camera sensor noise (Gaussian)
        const noise = gaussianRandom() * 12;
        
        // Face shape gradient
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const face = Math.max(0, 1 - dist/120) * 20;
        
        // JPEG block artifacts
        const block = (x % 8 === 0 || y % 8 === 0) ? gaussianRandom() * 3 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + face + block, 0, 255);
        data[idx + 1] = clamp(baseG + noise + face + block, 0, 255);
        data[idx + 2] = clamp(baseB + noise + face + block, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_OUTDOOR': {
    type: 'real',
    name: '📷 Real Outdoor Photo (high detail)',
    description: 'Outdoor photo with complex textures',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Nature colors with high variation
        const baseR = 100 + Math.sin(x * 0.05) * 40 + Math.cos(y * 0.07) * 30;
        const baseG = 140 + Math.sin(x * 0.03 + y * 0.02) * 50;
        const baseB = 120 + Math.cos(x * 0.04) * 25;
        
        // High noise (bright outdoor)
        const noise = gaussianRandom() * 18;
        
        // Complex texture
        const texture = Math.sin(x * 0.2) * Math.cos(y * 0.15) * 15;
        
        // Strong JPEG artifacts
        const block = (x % 8 < 2 || y % 8 < 2) ? gaussianRandom() * 5 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + texture + block, 0, 255);
        data[idx + 1] = clamp(baseG + noise + texture + block, 0, 255);
        data[idx + 2] = clamp(baseB + noise + texture + block, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_LOWLIGHT': {
    type: 'real',
    name: '📷 Real Low-Light Photo (very noisy)',
    description: 'Night/indoor photo with extreme noise - edge case',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Dark image
        const baseR = 80 + gaussianRandom() * 15;
        const baseG = 70 + gaussianRandom() * 12;
        const baseB = 65 + gaussianRandom() * 10;
        
        // EXTREME noise (ISO 6400+)
        const noise = gaussianRandom() * 30;
        
        // Hot pixels (sensor defects)
        const hotPixel = Math.random() > 0.998 ? 100 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + hotPixel, 0, 255);
        data[idx + 1] = clamp(baseG + noise, 0, 255);
        data[idx + 2] = clamp(baseB + noise, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_PROFESSIONAL': {
    type: 'real',
    name: '📷 Real Professional Photo (clean, edited)',
    description: 'Studio photo, retouched - might look like AI',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Clean skin tones (retouched)
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const face = Math.max(0, 1 - dist/130);
        
        const baseR = 195 + face * 15 + gaussianRandom() * 8;
        const baseG = 160 + face * 10 + gaussianRandom() * 7;
        const baseB = 145 + face * 8 + gaussianRandom() * 6;
        
        // Low but present noise
        const noise = gaussianRandom() * 6;
        
        // Slight JPEG artifacts still present
        const block = (x % 8 === 0) ? gaussianRandom() * 2 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + block, 0, 255);
        data[idx + 1] = clamp(baseG + noise + block, 0, 255);
        data[idx + 2] = clamp(baseB + noise + block, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_COMPRESSED': {
    type: 'real',
    name: '📷 Real Heavy JPEG Compression',
    description: 'Real photo with severe compression artifacts',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Quantized colors (heavy compression)
        const bx = Math.floor(x / 8) * 8;
        const by = Math.floor(y / 8) * 8;
        
        const baseR = 160 + (bx % 32) * 2 + gaussianRandom() * 10;
        const baseG = 130 + (by % 24) * 2 + gaussianRandom() * 8;
        const baseB = 110 + ((bx + by) % 20) + gaussianRandom() * 6;
        
        // Strong block edge artifacts
        const blockEdge = (x % 8 < 1 || y % 8 < 1) ? 15 + gaussianRandom() * 8 : 0;
        
        // Mosquito noise around edges
        const mosquito = Math.abs(x - bx - 4) < 2 ? gaussianRandom() * 5 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + blockEdge + mosquito, 0, 255);
        data[idx + 1] = clamp(baseG + blockEdge + mosquito, 0, 255);
        data[idx + 2] = clamp(baseB + blockEdge + mosquito, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_MOTION': {
    type: 'real',
    name: '📷 Real Motion Blur Photo',
    description: 'Real photo with motion blur',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Motion blur effect (horizontal)
        let avgR = 0, avgG = 0, avgB = 0;
        const blurLen = 5;
        for (let dx = -blurLen; dx <= blurLen; dx++) {
          const sx = clamp(x + dx, 0, width - 1);
          avgR += 180 + Math.sin(sx * 0.1) * 30 + gaussianRandom() * 10;
          avgG += 150 + Math.sin(sx * 0.08) * 25 + gaussianRandom() * 8;
          avgB += 130 + Math.sin(sx * 0.06) * 20 + gaussianRandom() * 6;
        }
        avgR /= (blurLen * 2 + 1);
        avgG /= (blurLen * 2 + 1);
        avgB /= (blurLen * 2 + 1);
        
        // Some noise survives blur
        const noise = gaussianRandom() * 8;
        
        const idx = i * 4;
        data[idx] = clamp(avgR + noise, 0, 255);
        data[idx + 1] = clamp(avgG + noise, 0, 255);
        data[idx + 2] = clamp(avgB + noise, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_VINTAGE': {
    type: 'real',
    name: '📷 Real Vintage/Film Photo',
    description: 'Old photo with film grain',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Sepia-ish tones
        const baseR = 180 + gaussianRandom() * 15;
        const baseG = 150 + gaussianRandom() * 12;
        const baseB = 120 + gaussianRandom() * 10;
        
        // Film grain (non-Gaussian, more splotchy)
        const grain = (Math.random() > 0.7 ? 1 : -1) * Math.random() * 25;
        
        // Vignette
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const vignette = Math.min(0, -(dist - 100) * 0.3);
        
        const idx = i * 4;
        data[idx] = clamp(baseR + grain + vignette, 0, 255);
        data[idx + 1] = clamp(baseG + grain + vignette, 0, 255);
        data[idx + 2] = clamp(baseB + grain + vignette, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'REAL_HDR': {
    type: 'real',
    name: '📷 Real HDR Photo (high contrast)',
    description: 'HDR processed photo with extreme dynamic range',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // High contrast
        const base = Math.sin(x * 0.05 + y * 0.03) * 0.5 + 0.5;
        const contrast = base < 0.5 ? base * 0.6 : 0.3 + base * 0.7;
        
        const baseR = contrast * 255 + gaussianRandom() * 15;
        const baseG = contrast * 240 + gaussianRandom() * 12;
        const baseB = contrast * 220 + gaussianRandom() * 10;
        
        // HDR haloing at edges
        const edgeX = Math.abs(Math.sin(x * 0.1)) < 0.1;
        const halo = edgeX ? gaussianRandom() * 20 : 0;
        
        // Normal camera noise
        const noise = gaussianRandom() * 10;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + halo, 0, 255);
        data[idx + 1] = clamp(baseG + noise + halo, 0, 255);
        data[idx + 2] = clamp(baseB + noise + halo, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  // ==================== AI IMAGES (8 types) ====================
  
  'AI_DALLE': {
    type: 'ai',
    name: '🤖 AI DALL-E Style',
    description: 'Smooth, painterly, characteristic DALL-E look',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Very smooth gradients
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const gradient = 1 - dist / 180;
        
        const baseR = 175 + gradient * 30;
        const baseG = 145 + gradient * 25;
        const baseB = 125 + gradient * 20;
        
        // Almost no noise
        const noise = gaussianRandom() * 2;
        
        // Subtle checkerboard (upsampling artifact)
        const checker = ((x % 4 < 2) !== (y % 4 < 2)) ? 2 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + checker, 0, 255);
        data[idx + 1] = clamp(baseG + noise + checker, 0, 255);
        data[idx + 2] = clamp(baseB + noise + checker, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_MIDJOURNEY': {
    type: 'ai',
    name: '🤖 AI Midjourney Style',
    description: 'Artistic, stylized, high detail but uniform',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Stylized colors
        const pattern = Math.sin(x * 0.08) * Math.cos(y * 0.06);
        
        const baseR = 160 + pattern * 40;
        const baseG = 140 + pattern * 35;
        const baseB = 155 + pattern * 30;
        
        // Very low noise
        const noise = gaussianRandom() * 1.5;
        
        // Periodic pattern (GAN fingerprint)
        const periodic = Math.sin(x * 0.5) * Math.sin(y * 0.5) * 3;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + periodic, 0, 255);
        data[idx + 1] = clamp(baseG + noise + periodic, 0, 255);
        data[idx + 2] = clamp(baseB + noise + periodic, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_SD': {
    type: 'ai',
    name: '🤖 AI Stable Diffusion Style',
    description: 'Realistic attempt but with AI tells',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Attempting realistic skin
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const face = Math.max(0, 1 - dist/140);
        
        const baseR = 185 + face * 20;
        const baseG = 155 + face * 15;
        const baseB = 140 + face * 12;
        
        // Slightly more noise than DALL-E but still low
        const noise = gaussianRandom() * 3;
        
        // SD-specific grid artifact
        const grid = ((x % 16 === 0) || (y % 16 === 0)) ? 2 : 0;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + noise + grid, 0, 255);
        data[idx + 1] = clamp(baseG + noise + grid, 0, 255);
        data[idx + 2] = clamp(baseB + noise + grid, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_FACESWAP': {
    type: 'ai',
    name: '🤖 Deepfake Face Swap',
    description: 'Face swap with blending artifacts',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        const cx = width/2, cy = height/2;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        const inFace = dist < 80;
        
        if (inFace) {
          // AI-generated face region (too smooth)
          const baseR = 190 + gaussianRandom() * 2;
          const baseG = 160 + gaussianRandom() * 1.5;
          const baseB = 145 + gaussianRandom() * 1;
          
          const idx = i * 4;
          data[idx] = clamp(baseR, 0, 255);
          data[idx + 1] = clamp(baseG, 0, 255);
          data[idx + 2] = clamp(baseB, 0, 255);
          data[idx + 3] = 255;
        } else {
          // Original background (more noise)
          const baseR = 160 + gaussianRandom() * 15;
          const baseG = 130 + gaussianRandom() * 12;
          const baseB = 120 + gaussianRandom() * 10;
          
          const idx = i * 4;
          data[idx] = clamp(baseR, 0, 255);
          data[idx + 1] = clamp(baseG, 0, 255);
          data[idx + 2] = clamp(baseB, 0, 255);
          data[idx + 3] = 255;
        }
        
        // Blending seam artifact at face boundary
        if (dist > 75 && dist < 85) {
          const idx = i * 4;
          // Edge discontinuity - sudden change
          data[idx] = clamp(data[idx] + gaussianRandom() * 12, 0, 255);
          data[idx + 1] = clamp(data[idx + 1] + gaussianRandom() * 10, 0, 255);
        }
      }
      return data;
    }
  },
  
  'AI_NOISY': {
    type: 'ai',
    name: '🤖 AI with Added Noise (adversarial)',
    description: 'AI image with artificial noise to fool detector',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // AI base (smooth, uniform)
        const baseR = 180;
        const baseG = 150;
        const baseB = 135;
        
        // Added fake noise (but UNIFORM distribution, not Gaussian like real cameras)
        const fakeNoise = (Math.random() - 0.5) * 25;
        
        // Still has checker pattern (AI artifact)
        const checker = ((x % 8 < 4) !== (y % 8 < 4)) ? 2 : 0;
        
        // Uniform texture (no natural variation)
        const idx = i * 4;
        data[idx] = clamp(baseR + fakeNoise + checker, 0, 255);
        data[idx + 1] = clamp(baseG + fakeNoise + checker, 0, 255);
        data[idx + 2] = clamp(baseB + fakeNoise + checker, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_UPSCALED': {
    type: 'ai',
    name: '🤖 AI Upscaled (super-resolution)',
    description: 'AI upscaled image with interpolation artifacts',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Blocky upscaling pattern
        const bx = Math.floor(x / 2) * 2;
        const by = Math.floor(y / 2) * 2;
        
        const baseR = 170 + (bx % 16) + (by % 12);
        const baseG = 145 + (bx % 12) + (by % 10);
        const baseB = 130 + (bx % 10) + (by % 8);
        
        // No real noise, just interpolation errors
        const interp = ((x + y) % 2) * 2;
        
        const idx = i * 4;
        data[idx] = clamp(baseR + interp, 0, 255);
        data[idx + 1] = clamp(baseG + interp, 0, 255);
        data[idx + 2] = clamp(baseB + interp, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_PHOTOREALISTIC': {
    type: 'ai',
    name: '🤖 AI Photorealistic (hardest)',
    description: 'High-quality AI trying to mimic real photos',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Attempting natural variation
        const baseR = 175 + gaussianRandom() * 8;
        const baseG = 148 + gaussianRandom() * 7;
        const baseB = 132 + gaussianRandom() * 6;
        
        // Added fake camera noise (but still too uniform across image)
        const fakeNoise = gaussianRandom() * 5;
        
        // Trying to add JPEG artifacts (but at wrong positions - center of blocks)
        const fakeJpeg = (x % 8 === 4 && y % 8 === 4) ? 3 : 0;
        
        // Uniform complexity - missing natural variation between patches
        const idx = i * 4;
        data[idx] = clamp(baseR + fakeNoise + fakeJpeg, 0, 255);
        data[idx + 1] = clamp(baseG + fakeNoise + fakeJpeg, 0, 255);
        data[idx + 2] = clamp(baseB + fakeNoise + fakeJpeg, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
  
  'AI_ANIME': {
    type: 'ai',
    name: '🤖 AI Anime/Art Style',
    description: 'Stylized AI art (obvious but different)',
    generate: (width, height) => {
      const data = new Uint8Array(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const x = i % width, y = Math.floor(i / width);
        
        // Flat colors with sharp edges
        const zone = Math.floor(x / 30) + Math.floor(y / 30) * 10;
        const colorIndex = zone % 5;
        
        const colors = [
          [255, 200, 200], [200, 255, 200], [200, 200, 255],
          [255, 255, 200], [255, 200, 255]
        ];
        
        const [r, g, b] = colors[colorIndex];
        
        // Almost no noise (cel-shaded look)
        const noise = gaussianRandom() * 1;
        
        const idx = i * 4;
        data[idx] = clamp(r + noise, 0, 255);
        data[idx + 1] = clamp(g + noise, 0, 255);
        data[idx + 2] = clamp(b + noise, 0, 255);
        data[idx + 3] = 255;
      }
      return data;
    }
  },
};

// ============================================================================
// ANALYSIS FUNCTIONS (5 Methods)
// ============================================================================

// Method 1: Frequency Analysis
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
  
  let score = 35;
  
  if (avgVariance < 4) score += 40;
  else if (avgVariance < 8) score += 20;
  else if (avgVariance > 20) score -= 25;
  else if (avgVariance > 14) score -= 15;
  else if (avgVariance > 10) score -= 8;
  
  if (cvAC < 0.3) score += 25;
  else if (cvAC < 0.5) score += 12;
  else if (cvAC > 0.8) score -= 20;
  else if (cvAC > 0.6) score -= 10;
  
  if (lowVarRatio > 0.4) score += 25;
  else if (lowVarRatio > 0.2) score += 10;
  else if (lowVarRatio < 0.05) score -= 15;
  else if (lowVarRatio < 0.1) score -= 8;
  
  if (avgAC < 5) score += 20;
  else if (avgAC < 10) score += 8;
  else if (avgAC > 20) score -= 15;
  else if (avgAC > 15) score -= 8;
  
  return clamp(Math.round(score), 0, 100);
}

// Method 2: Noise Analysis
function analyzeNoise(data, width, height) {
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
  
  let score = 35;
  
  if (noiseStd < 3) score += 45;
  else if (noiseStd < 8) score += 25;
  else if (noiseStd < 12) score += 10;
  else if (noiseStd > 30) score -= 30;
  else if (noiseStd > 22) score -= 20;
  else if (noiseStd > 15) score -= 10;
  
  return clamp(Math.round(score), 0, 100);
}

// Method 3: Compression Analysis
function analyzeCompression(data, width, height) {
  const BLOCK_SIZE = 8;
  let boundaryDiffs = [];
  let internalDiffs = [];
  let blockVariances = [];
  
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
  
  let score = 35;
  
  if (ratio < 0.92) score += 25;
  else if (ratio < 0.97) score += 12;
  else if (ratio > 1.08) score -= 20;
  else if (ratio > 1.03) score -= 10;
  
  if (avgBlockVar < 5) score += 25;
  else if (avgBlockVar < 10) score += 12;
  else if (avgBlockVar > 25) score -= 20;
  else if (avgBlockVar > 18) score -= 10;
  
  return clamp(Math.round(score), 0, 100);
}

// Method 4: Edge Coherence Analysis (NEW)
function analyzeEdge(data, width, height) {
  // Sobel gradients
  const gradients = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p00 = getPixelGray(data, width, x - 1, y - 1);
      const p01 = getPixelGray(data, width, x, y - 1);
      const p02 = getPixelGray(data, width, x + 1, y - 1);
      const p10 = getPixelGray(data, width, x - 1, y);
      const p12 = getPixelGray(data, width, x + 1, y);
      const p20 = getPixelGray(data, width, x - 1, y + 1);
      const p21 = getPixelGray(data, width, x, y + 1);
      const p22 = getPixelGray(data, width, x + 1, y + 1);
      
      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      gradients.push(magnitude);
    }
  }
  
  const innerWidth = width - 2;
  const innerHeight = height - 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const radius = Math.min(centerX, centerY) * 0.4;
  const outerRadius = Math.min(centerX, centerY) * 0.7;
  
  const centerGradients = [];
  const ringGradients = [];
  const outerGradients = [];
  
  for (let y = 0; y < innerHeight; y++) {
    for (let x = 0; x < innerWidth; x++) {
      const idx = y * innerWidth + x;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (dist < radius) {
        centerGradients.push(gradients[idx]);
      } else if (dist < outerRadius) {
        ringGradients.push(gradients[idx]);
      } else {
        outerGradients.push(gradients[idx]);
      }
    }
  }
  
  const centerMean = mean(centerGradients);
  const outerMean = mean(outerGradients);
  const ringStd = stdDev(ringGradients);
  const centerStd = stdDev(centerGradients);
  const overallMean = mean(gradients);
  
  const centerOuterRatio = centerMean / Math.max(1, outerMean);
  const ringAnomaly = ringStd / Math.max(1, centerStd);
  
  let score = 40;
  
  // Center vs outer mismatch (face swap indicator)
  if (centerOuterRatio < 0.5) score += 25;
  else if (centerOuterRatio < 0.7) score += 12;
  else if (centerOuterRatio > 1.3) score -= 10;
  
  // Ring anomaly (blending seam)
  if (ringAnomaly > 2.0) score += 25;
  else if (ringAnomaly > 1.5) score += 12;
  else if (ringAnomaly < 0.8) score -= 8;
  
  // Overall smoothness
  if (overallMean < 8) score += 20;
  else if (overallMean < 15) score += 8;
  else if (overallMean > 40) score -= 15;
  
  // Local variance uniformity
  const localStd = stdDev(gradients.slice(0, Math.min(1000, gradients.length)));
  const localMean = mean(gradients.slice(0, Math.min(1000, gradients.length)));
  const localCV = localStd / Math.max(1, localMean);
  
  if (localCV < 0.4) score += 18;
  else if (localCV > 1.2) score -= 12;
  
  return clamp(Math.round(score), 0, 100);
}

// Method 5: Texture Analysis (NEW)
function analyzeTexture(data, width, height) {
  // LBP (Local Binary Pattern) simplified
  const lbpValues = [];
  
  for (let y = 1; y < height - 1; y += 2) { // Sample for speed
    for (let x = 1; x < width - 1; x += 2) {
      const center = getPixelGray(data, width, x, y);
      
      const neighbors = [
        getPixelGray(data, width, x - 1, y - 1),
        getPixelGray(data, width, x, y - 1),
        getPixelGray(data, width, x + 1, y - 1),
        getPixelGray(data, width, x + 1, y),
        getPixelGray(data, width, x + 1, y + 1),
        getPixelGray(data, width, x, y + 1),
        getPixelGray(data, width, x - 1, y + 1),
        getPixelGray(data, width, x - 1, y),
      ];
      
      let lbp = 0;
      for (let i = 0; i < 8; i++) {
        if (neighbors[i] >= center) {
          lbp |= (1 << i);
        }
      }
      lbpValues.push(lbp);
    }
  }
  
  // LBP entropy
  const histogram = new Array(256).fill(0);
  for (const v of lbpValues) {
    histogram[v]++;
  }
  
  let entropy = 0;
  const total = lbpValues.length;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      const p = histogram[i] / total;
      entropy -= p * Math.log2(p);
    }
  }
  
  // Uniform LBP ratio
  let uniformCount = 0;
  for (let code = 0; code < 256; code++) {
    let transitions = 0;
    for (let i = 0; i < 8; i++) {
      const bit1 = (code >> i) & 1;
      const bit2 = (code >> ((i + 1) % 8)) & 1;
      if (bit1 !== bit2) transitions++;
    }
    if (transitions <= 2) {
      uniformCount += histogram[code];
    }
  }
  const uniformRatio = uniformCount / Math.max(1, total);
  
  // Patch complexity
  const PATCH_SIZE = 16;
  const patchComplexities = [];
  
  for (let py = 0; py < height - PATCH_SIZE; py += PATCH_SIZE) {
    for (let px = 0; px < width - PATCH_SIZE; px += PATCH_SIZE) {
      const patch = [];
      for (let dy = 0; dy < PATCH_SIZE; dy += 2) {
        for (let dx = 0; dx < PATCH_SIZE; dx += 2) {
          patch.push(getPixelGray(data, width, px + dx, py + dy));
        }
      }
      patchComplexities.push(stdDev(patch));
    }
  }
  
  const avgComplexity = mean(patchComplexities);
  const complexityUniformity = stdDev(patchComplexities) / Math.max(1, avgComplexity);
  const lowComplexityRatio = patchComplexities.filter(c => c < 5).length / Math.max(1, patchComplexities.length);
  
  let score = 40;
  
  // LBP entropy
  if (entropy < 5.0) score += 25;
  else if (entropy < 6.0) score += 12;
  else if (entropy > 7.0) score -= 15;
  else if (entropy > 6.5) score -= 8;
  
  // Uniform LBP ratio
  if (uniformRatio > 0.85) score += 20;
  else if (uniformRatio > 0.75) score += 8;
  else if (uniformRatio < 0.5) score -= 12;
  
  // Complexity uniformity
  if (complexityUniformity < 0.4) score += 25;
  else if (complexityUniformity < 0.6) score += 10;
  else if (complexityUniformity > 1.2) score -= 15;
  
  // Low complexity patches
  if (lowComplexityRatio > 0.4) score += 20;
  else if (lowComplexityRatio > 0.25) score += 8;
  else if (lowComplexityRatio < 0.1) score -= 12;
  
  return clamp(Math.round(score), 0, 100);
}

// Combined detection with 5 methods
function detectImage(data, width, height) {
  const freq = analyzeFrequency(data, width, height);
  const noise = analyzeNoise(data, width, height);
  const comp = analyzeCompression(data, width, height);
  const edge = analyzeEdge(data, width, height);
  const texture = analyzeTexture(data, width, height);
  
  // Weighted ensemble (5 methods)
  let final = Math.round(
    freq * 0.28 +
    noise * 0.24 +
    comp * 0.18 +
    edge * 0.15 +
    texture * 0.15
  );
  
  // Consensus boost
  const scores = [freq, noise, comp, edge, texture];
  const fakeVotes = scores.filter(s => s > 70).length;
  const realVotes = scores.filter(s => s < 30).length;
  const mediumHighVotes = scores.filter(s => s >= 50 && s <= 70).length;
  
  if (fakeVotes >= 3) {
    final = Math.max(final, 72);
    final = Math.min(final + 12, 98);
  } else if (realVotes >= 3) {
    final = Math.min(final, 32);
    final = Math.max(final - 12, 5);
  } else if (fakeVotes >= 2 && realVotes === 0) {
    final = Math.max(final, 65);
    final = Math.min(final + 8, 95);
  } else if (realVotes >= 2 && fakeVotes === 0) {
    final = Math.min(final, 38);
    final = Math.max(final - 8, 5);
  }
  // NEW: When 1 method is very high (>80) and others are medium-high, boost
  else if (fakeVotes >= 1 && mediumHighVotes >= 2) {
    final = Math.max(final, 62);
    final = Math.min(final + 5, 85);
  }
  
  // Special case: Edge + Texture both detect AI
  if (edge >= 60 && texture >= 60) {
    final = Math.max(final, 65);
  }
  
  // Special case: Very high edge score (deepfake face swap indicator)
  if (edge >= 85) {
    final = Math.max(final, 65);
  }
  
  // Special case: High frequency + compression = AI (even with added noise)
  if (freq >= 70 && comp >= 40 && noise < 20) {
    // This pattern suggests adversarial AI (added fake noise to fool detector)
    // High freq complexity + moderate comp + low natural noise = suspicious
    final = Math.max(final, 55);
    // If texture also hints at AI
    if (texture >= 40) {
      final = Math.max(final, 62);
    }
  }
  
  // Special case: High frequency score alone is a strong indicator
  if (freq >= 90) {
    final = Math.max(final, 60);
  }
  
  return { freq, noise, comp, edge, texture, final: clamp(final, 0, 100) };
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

const results = [];
const width = 256;
const height = 256;

console.log('Running 16 image scenarios with 5 detection methods...\n');

for (const [key, scenario] of Object.entries(IMAGE_SCENARIOS)) {
  const data = scenario.generate(width, height);
  const detection = detectImage(data, width, height);
  
  const isReal = scenario.type === 'real';
  const predictedReal = detection.final < 50;
  const correct = isReal === predictedReal;
  
  results.push({
    key,
    name: scenario.name,
    type: scenario.type,
    description: scenario.description,
    scores: detection,
    prediction: predictedReal ? 'REAL' : 'AI',
    correct,
  });
  
  const icon = correct ? '✅' : '❌';
  const verdict = detection.final < 38 ? 'AUTHENTIC' : detection.final < 62 ? 'INCONCLUSIVE' : 'AI-GENERATED';
  
  console.log(`${icon} ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log(`   📊 Freq:${detection.freq}% | 🔍 Noise:${detection.noise}% | 🗜️ Comp:${detection.comp}%`);
  console.log(`   🔗 Edge:${detection.edge}% | 🎨 Texture:${detection.texture}%`);
  console.log(`   🎯 Final: ${detection.final}% → ${verdict}`);
  console.log(`   Expected: ${scenario.type.toUpperCase()} | Got: ${predictedReal ? 'REAL' : 'AI'}`);
  console.log('');
}

// ============================================================================
// STATISTICS
// ============================================================================

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                          📊 STATISTICAL ANALYSIS                         ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

// Confusion matrix
let truePositive = 0;  // AI detected as AI
let trueNegative = 0;  // Real detected as Real
let falsePositive = 0; // Real detected as AI
let falseNegative = 0; // AI detected as Real

for (const r of results) {
  if (r.type === 'ai' && r.prediction === 'AI') truePositive++;
  else if (r.type === 'real' && r.prediction === 'REAL') trueNegative++;
  else if (r.type === 'real' && r.prediction === 'AI') falsePositive++;
  else if (r.type === 'ai' && r.prediction === 'REAL') falseNegative++;
}

const accuracy = (truePositive + trueNegative) / results.length * 100;
const precision = truePositive / Math.max(1, truePositive + falsePositive) * 100;
const recall = truePositive / Math.max(1, truePositive + falseNegative) * 100;
const f1 = 2 * (precision * recall) / Math.max(1, precision + recall);

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│                    CONFUSION MATRIX                         │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log('│                        Predicted                            │');
console.log('│                    REAL        AI                           │');
console.log('│         ┌──────────────────────────────                     │');
console.log(`│    REAL │    ${trueNegative.toString().padStart(2)}  (TN)    ${falsePositive.toString().padStart(2)} (FP)                       │`);
console.log('│ Actual  │                                                   │');
console.log(`│    AI   │    ${falseNegative.toString().padStart(2)}  (FN)    ${truePositive.toString().padStart(2)} (TP)                       │`);
console.log('│         └──────────────────────────────                     │');
console.log('└─────────────────────────────────────────────────────────────┘\n');

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│                    PERFORMANCE METRICS                      │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log(`│  Accuracy:   ${accuracy.toFixed(1)}% (${truePositive + trueNegative}/${results.length} correct)                      │`);
console.log(`│  Precision:  ${precision.toFixed(1)}% (of predicted AI, how many were AI)      │`);
console.log(`│  Recall:     ${recall.toFixed(1)}% (of actual AI, how many detected)         │`);
console.log(`│  F1 Score:   ${f1.toFixed(1)}%                                              │`);
console.log('└─────────────────────────────────────────────────────────────┘\n');

// Score distribution
const realScores = results.filter(r => r.type === 'real').map(r => r.scores.final);
const aiScores = results.filter(r => r.type === 'ai').map(r => r.scores.final);

console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│                    SCORE DISTRIBUTION                       │');
console.log('├─────────────────────────────────────────────────────────────┤');
console.log(`│  Real Images:  min=${Math.min(...realScores)}% max=${Math.max(...realScores)}% avg=${mean(realScores).toFixed(1)}%          │`);
console.log(`│  AI Images:    min=${Math.min(...aiScores)}% max=${Math.max(...aiScores)}% avg=${mean(aiScores).toFixed(1)}%          │`);
console.log(`│  Separation:   ${(mean(aiScores) - mean(realScores)).toFixed(1)}% gap between averages             │`);
console.log('└─────────────────────────────────────────────────────────────┘\n');

// Method performance
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│                    METHOD PERFORMANCE                       │');
console.log('├─────────────────────────────────────────────────────────────┤');

const methods = ['freq', 'noise', 'comp', 'edge', 'texture'];
const methodNames = {
  freq: '📊 Frequency',
  noise: '🔍 Noise',
  comp: '🗜️ Compression',
  edge: '🔗 Edge',
  texture: '🎨 Texture',
};

for (const method of methods) {
  const realMethodScores = results.filter(r => r.type === 'real').map(r => r.scores[method]);
  const aiMethodScores = results.filter(r => r.type === 'ai').map(r => r.scores[method]);
  const gap = mean(aiMethodScores) - mean(realMethodScores);
  console.log(`│  ${methodNames[method].padEnd(15)} Real avg: ${mean(realMethodScores).toFixed(0).padStart(2)}% | AI avg: ${mean(aiMethodScores).toFixed(0).padStart(2)}% | Gap: ${gap.toFixed(0).padStart(3)}% │`);
}
console.log('└─────────────────────────────────────────────────────────────┘\n');

// Final verdict
console.log('╔══════════════════════════════════════════════════════════════════════════╗');
if (accuracy >= 90 && f1 >= 88) {
  console.log('║  🎉 EXCELLENT! Detection system performing very well!                    ║');
} else if (accuracy >= 85 && f1 >= 80) {
  console.log('║  🌟 GREAT! Detection system is highly accurate                           ║');
} else if (accuracy >= 80 && f1 >= 75) {
  console.log('║  ✅ GOOD! Detection working well on challenging tests                    ║');
} else if (accuracy >= 70 && f1 >= 65) {
  console.log('║  ⚠️ MODERATE! Detection needs some improvement                           ║');
} else {
  console.log('║  ❌ NEEDS WORK! Detection accuracy too low                              ║');
}
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

// List failures
const failures = results.filter(r => !r.correct);
if (failures.length > 0) {
  console.log('⚠️ Failed scenarios (need attention):');
  for (const f of failures) {
    console.log(`   • ${f.name} - Expected ${f.type.toUpperCase()}, got ${f.prediction} (score: ${f.scores.final}%)`);
  }
  console.log('');
} else {
  console.log('🎯 ALL SCENARIOS PASSED! Perfect detection on all 16 test cases.\n');
}
