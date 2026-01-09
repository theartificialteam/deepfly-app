/**
 * Firebase Service for optional analytics and logging
 * 
 * This service is optional and disabled by default.
 * To enable, set FIREBASE_ENABLED to true in firebaseConfig.js
 * and configure your Firebase credentials.
 */

import { FIREBASE_ENABLED } from '../firebaseConfig';

// Lazy load Firebase only when enabled
let firestore = null;
let isInitialized = false;

/**
 * Initialize Firebase services
 */
async function initializeFirebase() {
  if (!FIREBASE_ENABLED || isInitialized) {
    return false;
  }

  try {
    // Dynamic import to avoid loading Firebase when disabled
    const firebase = await import('@react-native-firebase/app');
    const firestoreModule = await import('@react-native-firebase/firestore');
    
    firestore = firestoreModule.default();
    isInitialized = true;
    
    console.log('[Firebase] Initialized successfully');
    return true;
  } catch (error) {
    console.warn('[Firebase] Initialization failed:', error.message);
    console.log('[Firebase] Running in offline mode');
    return false;
  }
}

/**
 * Log analysis result to Firestore (optional)
 * @param {Object} result - Analysis result object
 * @returns {boolean} Success status
 */
export async function logAnalysisResult(result) {
  if (!FIREBASE_ENABLED) {
    console.log('[Firebase] Logging disabled');
    return false;
  }

  try {
    await initializeFirebase();
    
    if (!firestore) {
      console.log('[Firebase] Firestore not available');
      return false;
    }

    const logData = {
      confidence: result.confidence,
      isProbablyDeepfake: result.isProbablyDeepfake,
      model1: result.model1,
      model2: result.model2,
      model3: result.model3,
      model4: result.model4,
      faces: result.faces,
      processingTime: result.processingTime,
      fileType: result.fileType,
      timestamp: new Date(),
      // Don't log file paths or URIs for privacy
    };

    await firestore.collection('analyses').add(logData);
    
    console.log('[Firebase] Result logged successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Logging error:', error);
    return false;
  }
}

/**
 * Get analysis statistics from Firestore
 * @returns {Object|null} Statistics object or null if unavailable
 */
export async function getAnalyticsStats() {
  if (!FIREBASE_ENABLED) {
    return null;
  }

  try {
    await initializeFirebase();
    
    if (!firestore) {
      return null;
    }

    const snapshot = await firestore
      .collection('analyses')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) {
      return {
        totalAnalyses: 0,
        deepfakesDetected: 0,
        authenticDetected: 0,
        averageConfidence: 0,
      };
    }

    const analyses = snapshot.docs.map(doc => doc.data());
    
    const deepfakes = analyses.filter(a => a.isProbablyDeepfake).length;
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

    return {
      totalAnalyses: analyses.length,
      deepfakesDetected: deepfakes,
      authenticDetected: analyses.length - deepfakes,
      averageConfidence: Math.round(avgConfidence),
    };
  } catch (error) {
    console.error('[Firebase] Stats error:', error);
    return null;
  }
}

/**
 * Log app event for analytics
 * @param {string} eventName - Event name
 * @param {Object} params - Event parameters
 */
export async function logEvent(eventName, params = {}) {
  if (!FIREBASE_ENABLED) {
    return;
  }

  try {
    await initializeFirebase();
    
    if (!firestore) {
      return;
    }

    await firestore.collection('events').add({
      event: eventName,
      params,
      timestamp: new Date(),
    });
  } catch (error) {
    console.warn('[Firebase] Event logging failed:', error);
  }
}

/**
 * Check if Firebase is enabled and available
 * @returns {boolean}
 */
export function isFirebaseAvailable() {
  return FIREBASE_ENABLED && isInitialized;
}

/**
 * Export configuration status
 */
export const firebaseStatus = {
  enabled: FIREBASE_ENABLED,
  get initialized() {
    return isInitialized;
  },
};

