import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Current analysis state
  currentAnalysis: null,
  analysisResult: null,
  
  // Analysis history
  history: [],
  
  // App settings
  settings: {
    saveToHistory: true,
    enableFirebaseLogging: false,
  },

  // Actions
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

  // Computed getters
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
}));

