// Einfache i18n Implementierung

export type Language = 'de' | 'en';

export const translations = {
  de: {
    // Header
    history: 'Verlauf',
    settings: 'Einstellungen',
    
    // Recording
    clickToRecord: 'Zum Aufnehmen klicken',
    orShortcut: 'oder Ctrl+Shift+V',
    recording: 'Aufnahme läuft...',
    transcribing: 'Transkribiere...',
    processing: 'Verarbeite...',
    
    // Loading phases
    audioProcessing: 'Audio wird verarbeitet',
    speechRecognition: 'Sprache wird erkannt',
    textExtraction: 'Text wird extrahiert',
    textAnalysis: 'Text wird analysiert',
    aiProcessing: 'KI verarbeitet Inhalt',
    outputFormatting: 'Ausgabe wird formatiert',
    
    // Sections
    transcript: 'TRANSKRIPT',
    selectFormat: 'FORMAT WÄHLEN',
    result: 'ERGEBNIS',
    noTranscriptYet: 'Noch kein Transkript vorhanden. Starte eine Aufnahme.',
    selectFormatHint: 'Wähle ein Format, um den Text zu verarbeiten.',
    
    // Modes
    original: 'Original',
    structured: 'Strukturiert',
    summary: 'Zusammenfassung',
    context: 'Kontext',
    
    // Context types
    formalEmail: 'Förmliche E-Mail',
    informalEmail: 'Informelle E-Mail',
    newsletter: 'Newsletter',
    blogPost: 'Blog-Beitrag',
    socialMedia: 'Social Media Post',
    report: 'Bericht',
    protocol: 'Protokoll',
    
    // Buttons
    copyTranscript: 'Transkript kopieren',
    delete: 'Löschen',
    save: 'Speichern',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    
    // Stats
    word: 'Wort',
    words: 'Wörter',
    characters: 'Zeichen',
    
    // Footer
    ready: 'Bereit',
    apiKeyMissing: 'API Key fehlt',
    developedBy: 'Developed by',
    
    // Errors
    configureApiKey: 'Bitte OpenAI API Key in den Einstellungen konfigurieren.',
    recordingTooShort: 'Aufnahme zu kurz.',
    noSpeechDetected: 'Keine Sprache erkannt.',
    error: 'Fehler',
    
    // Settings
    settingsTitle: 'Einstellungen',
    apiAndAi: 'API & KI',
    audio: 'Audio',
    language: 'Sprache',
    openaiApiKey: 'OpenAI API Key',
    anthropicApiKey: 'Anthropic API Key',
    selectLlm: 'KI-Modell wählen',
    microphone: 'Mikrofon',
    selectMicrophone: 'Mikrofon auswählen',
    allowMicAccess: 'Mikrofon-Zugriff erlauben',
    close: 'Schließen',
    
    // History
    historyTitle: 'Verlauf',
    noHistory: 'Noch keine Einträge vorhanden.',
    clearAll: 'Alle löschen',
  },
  en: {
    // Header
    history: 'History',
    settings: 'Settings',
    
    // Recording
    clickToRecord: 'Click to record',
    orShortcut: 'or Ctrl+Shift+V',
    recording: 'Recording...',
    transcribing: 'Transcribing...',
    processing: 'Processing...',
    
    // Loading phases
    audioProcessing: 'Processing audio',
    speechRecognition: 'Recognizing speech',
    textExtraction: 'Extracting text',
    textAnalysis: 'Analyzing text',
    aiProcessing: 'AI processing content',
    outputFormatting: 'Formatting output',
    
    // Sections
    transcript: 'TRANSCRIPT',
    selectFormat: 'SELECT FORMAT',
    result: 'RESULT',
    noTranscriptYet: 'No transcript yet. Start a recording.',
    selectFormatHint: 'Select a format to process the text.',
    
    // Modes
    original: 'Original',
    structured: 'Structured',
    summary: 'Summary',
    context: 'Context',
    
    // Context types
    formalEmail: 'Formal Email',
    informalEmail: 'Informal Email',
    newsletter: 'Newsletter',
    blogPost: 'Blog Post',
    socialMedia: 'Social Media Post',
    report: 'Report',
    protocol: 'Protocol',
    
    // Buttons
    copyTranscript: 'Copy Transcript',
    delete: 'Clear',
    save: 'Save',
    copy: 'Copy',
    copied: 'Copied!',
    
    // Stats
    word: 'word',
    words: 'words',
    characters: 'characters',
    
    // Footer
    ready: 'Ready',
    apiKeyMissing: 'API Key missing',
    developedBy: 'Developed by',
    
    // Errors
    configureApiKey: 'Please configure OpenAI API Key in settings.',
    recordingTooShort: 'Recording too short.',
    noSpeechDetected: 'No speech detected.',
    error: 'Error',
    
    // Settings
    settingsTitle: 'Settings',
    apiAndAi: 'API & AI',
    audio: 'Audio',
    language: 'Language',
    openaiApiKey: 'OpenAI API Key',
    anthropicApiKey: 'Anthropic API Key',
    selectLlm: 'Select AI Model',
    microphone: 'Microphone',
    selectMicrophone: 'Select Microphone',
    allowMicAccess: 'Allow Microphone Access',
    close: 'Close',
    
    // History
    historyTitle: 'History',
    noHistory: 'No entries yet.',
    clearAll: 'Clear all',
  }
} as const;

export type TranslationKey = keyof typeof translations.de;

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.de[key] || key;
}
