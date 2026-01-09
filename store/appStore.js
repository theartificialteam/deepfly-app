import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // ============ USER & AUTH ============
  user: null, // { id, name, email, isPro, isGuest }
  
  // ============ USAGE LIMITS ============
  usageToday: 0,
  dailyLimit: 5, // Default for guest
  
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

  // ============ AUTH ACTIONS ============
  setUser: (user) => {
    let limit = 5; // Guest default
    if (user && !user.isGuest) {
      limit = user.isPro ? 100 : 20;
    }
    set({ 
      user, 
      dailyLimit: limit,
      // Reset usage when switching accounts
      usageToday: 0,
    });
  },
  
  clearUser: () => set({ 
    user: null, 
    usageToday: 0, 
    dailyLimit: 5,
  }),
  
  // ============ USAGE ACTIONS ============
  incrementUsage: () => set((state) => ({
    usageToday: state.usageToday + 1,
  })),
  
  resetDailyUsage: () => set({ usageToday: 0 }),
  // TODO: Implement automatic daily reset with AsyncStorage timestamp check
  
  setDailyLimit: (limit) => set({ dailyLimit: limit }),
  
  canAnalyze: () => {
    const state = get();
    return state.usageToday < state.dailyLimit;
  },

  // ============ ANALYSIS ACTIONS ============
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  setAnalysisResult: (result) => set({ analysisResult: result }),
  
  clearCurrentAnalysis: () => set({ 
    currentAnalysis: null, 
    analysisResult: null 
  }),
  
  addToHistory: (result) => set((state) => {
    if (!state.settings.saveToHistory) return state;
    
    const newHistory = [
      {
        id: Date.now().toString(),
        ...result,
        savedAt: Date.now(),
      },
      ...state.history,
    ].slice(0, 50); // Keep only last 50 analyses
    
    return { history: newHistory };
  }),
  
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
}));
