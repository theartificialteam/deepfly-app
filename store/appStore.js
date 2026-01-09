/**
 * App Store - Global State Management
 * 
 * Manages all application state using Zustand.
 * Syncs with persistent storage for data persistence.
 */

import { create } from 'zustand';
import {
  saveUser,
  deleteUser,
  saveHistoryItem,
  saveUsageToday,
  saveLastResetDate,
  getTodayDateString,
} from '../services/storage';

export const useAppStore = create((set, get) => ({
  // ============ APP STATE ============
  isInitialized: false,
  hasAgreedToLegal: false,
  
  // ============ USER & AUTH ============
  user: null, // { id, name, email, isPro, isGuest }
  
  // ============ USAGE LIMITS ============
  usageToday: 0,
  dailyLimit: 5, // Default for guest
  lastResetDate: null,
  
  // ============ CURRENT ANALYSIS STATE ============
  currentAnalysis: null,
  analysisResult: null,
  
  // ============ ANALYSIS HISTORY ============
  history: [],
  
  // ============ APP SETTINGS ============
  settings: {
    saveToHistory: true,
    enableFirebaseLogging: false,
  },

  // ============ INITIALIZATION ============
  setInitialized: (value) => set({ isInitialized: value }),
  
  setHasAgreedToLegal: (value) => set({ hasAgreedToLegal: value }),

  // ============ AUTH ACTIONS ============
  setUser: async (user) => {
    let limit = 5; // Guest default
    if (user && !user.isGuest) {
      limit = user.isPro ? 100 : 20;
    }
    
    set({ 
      user, 
      dailyLimit: limit,
    });
    
    // Persist to storage
    if (user) {
      await saveUser(user);
    }
  },
  
  clearUser: async () => {
    set({ 
      user: null, 
      usageToday: 0, 
      dailyLimit: 5,
    });
    
    // Clear from storage
    await deleteUser();
  },
  
  updateUserPro: async (isPro) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, isPro };
      const newLimit = isPro ? 100 : (user.isGuest ? 5 : 20);
      
      set({ 
        user: updatedUser,
        dailyLimit: newLimit,
      });
      
      await saveUser(updatedUser);
    }
  },
  
  // ============ USAGE ACTIONS ============
  incrementUsage: async () => {
    const newUsage = get().usageToday + 1;
    set({ usageToday: newUsage });
    
    // Persist to storage
    await saveUsageToday(newUsage);
  },
  
  resetDailyUsage: async () => {
    const today = getTodayDateString();
    set({ 
      usageToday: 0,
      lastResetDate: today,
    });
    
    // Persist to storage
    await saveUsageToday(0);
    await saveLastResetDate(today);
  },
  
  setDailyLimit: (limit) => set({ dailyLimit: limit }),
  
  setUsageToday: (usage) => set({ usageToday: usage }),
  
  setLastResetDate: (date) => set({ lastResetDate: date }),
  
  checkAndResetDaily: async () => {
    const { lastResetDate } = get();
    const today = getTodayDateString();
    
    if (lastResetDate !== today) {
      console.log('[Store] New day detected, resetting usage');
      await get().resetDailyUsage();
      return true;
    }
    return false;
  },
  
  canAnalyze: () => {
    const { usageToday, dailyLimit } = get();
    return usageToday < dailyLimit;
  },

  // ============ ANALYSIS ACTIONS ============
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  setAnalysisResult: (result) => set({ analysisResult: result }),
  
  clearCurrentAnalysis: () => set({ 
    currentAnalysis: null, 
    analysisResult: null 
  }),
  
  addToHistory: async (result) => {
    const { settings, history } = get();
    if (!settings.saveToHistory) return;
    
    const historyItem = {
      id: Date.now().toString(),
      ...result,
      savedAt: Date.now(),
    };
    
    const newHistory = [historyItem, ...history].slice(0, 50);
    set({ history: newHistory });
    
    // Persist to storage
    await saveHistoryItem(historyItem);
  },
  
  setHistory: (history) => set({ history }),
  
  clearHistory: () => set({ history: [] }),
  
  removeFromHistory: (id) => set((state) => ({
    history: state.history.filter((item) => item.id !== id),
  })),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  // ============ COMPUTED GETTERS ============
  getHistoryStats: () => {
    const history = get().history;
    if (history.length === 0) return null;
    
    const deepfakeCount = history.filter((h) => h.isProbablyDeepfake).length;
    const authenticCount = history.length - deepfakeCount;
    const avgConfidence = history.reduce((acc, h) => acc + h.confidence, 0) / history.length;
    
    return {
      total: history.length,
      deepfakes: deepfakeCount,
      authentic: authenticCount,
      averageConfidence: Math.round(avgConfidence),
    };
  },
  
  getRecentHistory: (count = 5) => {
    return get().history.slice(0, count);
  },
  
  getRemainingAnalyses: () => {
    const { usageToday, dailyLimit } = get();
    return Math.max(0, dailyLimit - usageToday);
  },
}));
