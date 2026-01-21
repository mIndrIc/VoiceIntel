import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';

export type EnrichmentMode = 'original' | 'structured' | 'summary' | 'context';
export type RecordingStatus = 'idle' | 'recording' | 'transcribing' | 'enriching' | 'done' | 'error';
export type LLMProvider = 'openai' | 'anthropic';

// Context sub-types for the "Kontext" mode
export type ContextType = 
  | 'email_formal'      // Förmliche E-Mail
  | 'email_casual'      // Lockere E-Mail
  | 'newsletter'        // Newsletter
  | 'social_media'      // Social Media Post
  | 'meeting_notes'     // Meeting-Notizen
  | 'todo_list'         // TODO-Liste
  | 'blog_post'         // Blog-Artikel
  | 'report';           // Bericht/Report

export const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  email_formal: 'Förmliche E-Mail',
  email_casual: 'Lockere E-Mail',
  newsletter: 'Newsletter',
  social_media: 'Social Media Post',
  meeting_notes: 'Meeting-Notizen',
  todo_list: 'TODO-Liste',
  blog_post: 'Blog-Artikel',
  report: 'Bericht / Report',
};

interface HistoryEntry {
  id: string;
  timestamp: number;
  transcript: string;
  enrichedText: string;
  mode: EnrichmentMode;
  contextType?: ContextType;
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface AppState {
  // Recording state
  status: RecordingStatus;
  recordingTime: number;
  currentTranscript: string;
  liveTranscript: string;
  enrichedOutput: string;
  errorMessage: string;
  
  // Mode
  selectedMode: EnrichmentMode;
  selectedContextType: ContextType;
  
  // Settings
  openaiApiKey: string;
  anthropicApiKey: string;
  selectedLLM: LLMProvider;
  selectedMicrophone: string;
  availableMicrophones: AudioDevice[];
  language: Language;
  
  // History
  history: HistoryEntry[];
  
  // UI state
  showSettings: boolean;
  showHistory: boolean;
  isReprocessing: boolean;
  
  // Actions
  setStatus: (status: RecordingStatus) => void;
  setRecordingTime: (time: number) => void;
  setCurrentTranscript: (transcript: string) => void;
  setLiveTranscript: (transcript: string) => void;
  appendLiveTranscript: (text: string) => void;
  setEnrichedOutput: (output: string) => void;
  setErrorMessage: (message: string) => void;
  setSelectedMode: (mode: EnrichmentMode) => void;
  setSelectedContextType: (type: ContextType) => void;
  setOpenaiApiKey: (key: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setSelectedLLM: (provider: LLMProvider) => void;
  setSelectedMicrophone: (deviceId: string) => void;
  setAvailableMicrophones: (devices: AudioDevice[]) => void;
  setLanguage: (lang: Language) => void;
  setIsReprocessing: (value: boolean) => void;
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  toggleSettings: () => void;
  toggleHistory: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      status: 'idle',
      recordingTime: 0,
      currentTranscript: '',
      liveTranscript: '',
      enrichedOutput: '',
      errorMessage: '',
      selectedMode: 'structured',
      selectedContextType: 'email_formal',
      openaiApiKey: '',
      anthropicApiKey: '',
      selectedLLM: 'openai',
      selectedMicrophone: '',
      availableMicrophones: [],
      language: 'de',
      history: [],
      showSettings: false,
      showHistory: false,
      isReprocessing: false,
      
      // Actions
      setStatus: (status) => set({ status }),
      setRecordingTime: (recordingTime) => set({ recordingTime }),
      setCurrentTranscript: (currentTranscript) => set({ currentTranscript }),
      setLiveTranscript: (liveTranscript) => set({ liveTranscript }),
      appendLiveTranscript: (text) => set((state) => ({ 
        liveTranscript: state.liveTranscript + ' ' + text 
      })),
      setEnrichedOutput: (enrichedOutput) => set({ enrichedOutput }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setSelectedMode: (selectedMode) => set({ selectedMode }),
      setSelectedContextType: (selectedContextType) => set({ selectedContextType }),
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
      setAnthropicApiKey: (anthropicApiKey) => set({ anthropicApiKey }),
      setSelectedLLM: (selectedLLM) => set({ selectedLLM }),
      setSelectedMicrophone: (selectedMicrophone) => set({ selectedMicrophone }),
      setAvailableMicrophones: (availableMicrophones) => set({ availableMicrophones }),
      setLanguage: (language) => set({ language }),
      setIsReprocessing: (isReprocessing) => set({ isReprocessing }),
      
      addHistoryEntry: (entry) => set((state) => ({
        history: [
          {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 10),
      })),
      
      clearHistory: () => set({ history: [] }),
      toggleSettings: () => set((state) => ({ 
        showSettings: !state.showSettings,
        showHistory: false 
      })),
      toggleHistory: () => set((state) => ({ 
        showHistory: !state.showHistory,
        showSettings: false 
      })),
      
      reset: () => set({
        status: 'idle',
        recordingTime: 0,
        currentTranscript: '',
        liveTranscript: '',
        enrichedOutput: '',
        errorMessage: '',
      }),
    }),
    {
      name: 'voiceintel-storage',
      partialize: (state) => ({
        openaiApiKey: state.openaiApiKey,
        anthropicApiKey: state.anthropicApiKey,
        selectedLLM: state.selectedLLM,
        selectedMode: state.selectedMode,
        selectedContextType: state.selectedContextType,
        selectedMicrophone: state.selectedMicrophone,
        language: state.language,
        history: state.history,
      }),
    }
  )
);
