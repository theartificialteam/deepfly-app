/**
 * Storage Service - Persistent Data Management
 * 
 * Handles all persistent storage operations using AsyncStorage.
 * Manages user data, analysis history, usage tracking, and preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  USER: '@deepfly_user',
  HISTORY: '@deepfly_history',
  USAGE_TODAY: '@deepfly_usage_today',
  LAST_RESET_DATE: '@deepfly_last_reset_date',
  LEGAL_AGREED: '@deepfly_legal_agreed',
  SETTINGS: '@deepfly_settings',
};

/**
 * Save user data to persistent storage
 * @param {Object} user - User object to save
 */
export async function saveUser(user) {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      console.log('[Storage] User saved');
    }
  } catch (error) {
    console.error('[Storage] Error saving user:', error);
  }
}

/**
 * Load user data from persistent storage
 * @returns {Object|null} User object or null if not found
 */
export async function loadUser() {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      console.log('[Storage] User loaded');
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('[Storage] Error loading user:', error);
    return null;
  }
}

/**
 * Delete user data from persistent storage
 */
export async function deleteUser() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.USAGE_TODAY);
    console.log('[Storage] User deleted');
  } catch (error) {
    console.error('[Storage] Error deleting user:', error);
  }
}

/**
 * Save a single history item (appends to existing history)
 * @param {Object} item - Analysis result to save
 */
export async function saveHistoryItem(item) {
  try {
    const existingHistory = await loadHistory();
    const newHistory = [item, ...existingHistory].slice(0, 100); // Keep max 100 items
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    console.log('[Storage] History item saved');
  } catch (error) {
    console.error('[Storage] Error saving history item:', error);
  }
}

/**
 * Load all analysis history from persistent storage
 * @returns {Array} Array of analysis results
 */
export async function loadHistory() {
  try {
    const historyData = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (historyData) {
      console.log('[Storage] History loaded');
      return JSON.parse(historyData);
    }
    return [];
  } catch (error) {
    console.error('[Storage] Error loading history:', error);
    return [];
  }
}

/**
 * Clear all analysis history
 */
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    console.log('[Storage] History cleared');
  } catch (error) {
    console.error('[Storage] Error clearing history:', error);
  }
}

/**
 * Save today's usage count
 * @param {number} count - Number of analyses used today
 */
export async function saveUsageToday(count) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USAGE_TODAY, JSON.stringify(count));
  } catch (error) {
    console.error('[Storage] Error saving usage:', error);
  }
}

/**
 * Load today's usage count
 * @returns {number} Usage count for today
 */
export async function loadUsageToday() {
  try {
    const usageData = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_TODAY);
    if (usageData) {
      return JSON.parse(usageData);
    }
    return 0;
  } catch (error) {
    console.error('[Storage] Error loading usage:', error);
    return 0;
  }
}

/**
 * Save the last reset date (for daily usage reset)
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 */
export async function saveLastResetDate(dateString) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, dateString);
  } catch (error) {
    console.error('[Storage] Error saving reset date:', error);
  }
}

/**
 * Load the last reset date
 * @returns {string|null} ISO date string or null
 */
export async function loadLastResetDate() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
  } catch (error) {
    console.error('[Storage] Error loading reset date:', error);
    return null;
  }
}

/**
 * Save legal agreement status
 * @param {boolean} agreed - Whether user agreed to terms
 */
export async function saveLegalAgreement(agreed) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LEGAL_AGREED, JSON.stringify(agreed));
    console.log('[Storage] Legal agreement saved');
  } catch (error) {
    console.error('[Storage] Error saving legal agreement:', error);
  }
}

/**
 * Check if user has agreed to legal terms
 * @returns {boolean} True if user has agreed
 */
export async function hasAgreedToLegal() {
  try {
    const agreed = await AsyncStorage.getItem(STORAGE_KEYS.LEGAL_AGREED);
    return agreed === 'true' || agreed === true;
  } catch (error) {
    console.error('[Storage] Error checking legal agreement:', error);
    return false;
  }
}

/**
 * Save app settings
 * @param {Object} settings - Settings object
 */
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('[Storage] Error saving settings:', error);
  }
}

/**
 * Load app settings
 * @returns {Object} Settings object
 */
export async function loadSettings() {
  try {
    const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsData) {
      return JSON.parse(settingsData);
    }
    return {};
  } catch (error) {
    console.error('[Storage] Error loading settings:', error);
    return {};
  }
}

/**
 * Clear all app data (for debugging/reset)
 */
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    console.log('[Storage] All data cleared');
  } catch (error) {
    console.error('[Storage] Error clearing all data:', error);
  }
}

/**
 * Get current date string in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check if daily usage needs to be reset
 * @returns {boolean} True if reset is needed
 */
export async function shouldResetDailyUsage() {
  try {
    const lastResetDate = await loadLastResetDate();
    const today = getTodayDateString();
    return lastResetDate !== today;
  } catch (error) {
    console.error('[Storage] Error checking daily reset:', error);
    return true; // Reset on error to be safe
  }
}




