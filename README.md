# VoiceIntel 🎙️

**Voice Intelligence Desktop App** – Sprachaufnahme mit KI-gestützter Textverarbeitung

![VoiceIntel](https://img.shields.io/badge/Platform-Desktop-blue) ![Tauri](https://img.shields.io/badge/Tauri-2.0-orange) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 🎯 Problem & Lösung

### Das Problem
Im Arbeitsalltag entstehen oft Situationen, in denen gesprochene Inhalte schnell dokumentiert werden müssen – sei es ein spontaner Gedanke, Meeting-Notizen oder eine E-Mail-Idee. Das manuelle Tippen unterbricht den Workflow und kostet Zeit.

### Die Lösung
**VoiceIntel** ist eine Desktop-App, die per Hotkey aktiviert wird und gesprochene Sprache nicht nur transkribiert, sondern intelligent aufbereitet:

- **Original**: Reines Transkript ohne Veränderung
- **Strukturiert**: Automatische Gliederung mit Überschriften und Aufzählungen
- **Zusammenfassung**: Komprimierte Kernaussagen
- **Kontext**: Anpassung an spezifische Formate (E-Mail, Newsletter, Social Media, etc.)

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    VoiceIntel Desktop App                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │    Tauri     │    │   Backend    │  │
│  │   (Next.js)  │◄──►│   (Rust)     │◄──►│   (APIs)     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ React + TS   │    │ Global       │    │ OpenAI API   │  │
│  │ Zustand      │    │ Shortcuts    │    │ (Whisper)    │  │
│  │ Tailwind CSS │    │ Clipboard    │    │ (GPT-4)      │  │
│  └──────────────┘    └──────────────┘    │              │  │
│                                          │ Anthropic    │  │
│                                          │ (Claude)     │  │
│                                          └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Voice-Pipeline

```
🎤 Aufnahme          📝 Transkription       ✨ Enrichment         📋 Output
     │                      │                     │                   │
     ▼                      ▼                     ▼                   ▼
MediaRecorder  ──►  OpenAI Whisper  ──►  GPT-4 / Claude  ──►  Clipboard
(Web Audio API)        (STT API)         (LLM Processing)      / Export
```

### Komponenten-Übersicht

| Komponente | Technologie | Funktion |
|------------|-------------|----------|
| **Desktop Runtime** | Tauri 2.0 (Rust) | Native Desktop-Integration, Hotkeys, Clipboard |
| **Frontend** | Next.js 15 + React 19 | UI/UX, State Management |
| **Styling** | Tailwind CSS | Dark Theme, Responsive Layout |
| **State** | Zustand | Globaler App-State mit Persistenz |
| **Transkription** | OpenAI Whisper API | Speech-to-Text |
| **Enrichment** | GPT-4 / Claude | Textaufbereitung & Formatierung |

---

## ✨ Features

### Kern-Features
- 🎙️ **One-Click Recording** – Großer zentraler Aufnahme-Button
- ⌨️ **Hotkey-Aktivierung** – `Ctrl+Shift+V` startet/stoppt Aufnahme
- 🔄 **Live-Transkription** – Echtzeit-Anzeige während der Aufnahme
- 🎨 **4 Enrichment-Modi** – Original, Strukturiert, Zusammenfassung, Kontext
- 📧 **7 Kontext-Formate** – E-Mail, Newsletter, Social Media, Meeting-Notizen, etc.
- 📋 **Clipboard-Integration** – Ein-Klick-Kopieren
- 💾 **Export-Optionen** – TXT, Markdown, PDF, JSON
- 📜 **Verlauf** – Letzte 10 Aufnahmen gespeichert

### Zusatz-Features
- 🔊 **Sound-Feedback** – Akustische Rückmeldung bei Start/Stop
- 📊 **Wort-/Zeichen-Zähler** – Statistiken unter Transkript und Ergebnis
- 🌐 **Mehrsprachig** – Deutsch / Englisch umschaltbar
- 📈 **Ladeanimation** – Fortschrittsanzeige während der Verarbeitung
- 🎵 **Audio-Wellenform** – Visuelle Darstellung während der Aufnahme
- 🟢 **Status-Anzeige** – API-Bereitschaft im Footer

---

## 🚀 Setup & Installation

### Voraussetzungen

- **Node.js** 18+ 
- **Rust** (für Tauri) – [rustup.rs](https://rustup.rs)
- **OpenAI API Key** – [platform.openai.com](https://platform.openai.com)
- *(Optional)* **Anthropic API Key** – [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# 1. Repository klonen
git clone https://github.com/your-username/voiceintel.git
cd voiceintel/voice-intel

# 2. Dependencies installieren
npm install

# 3. Development Server starten (nur Frontend)
npm run dev

# 4. Oder: Desktop-App starten (Tauri)
npm run tauri dev
```

### Produktion-Build

```bash
# Desktop-App bauen (Windows/Mac/Linux)
npm run tauri build
```

Die fertige App findest du unter `src-tauri/target/release/`.

### API Keys konfigurieren

1. App starten
2. **Einstellungen** (Button oben rechts) öffnen
3. OpenAI API Key eingeben (erforderlich für Whisper + GPT-4)
4. *(Optional)* Anthropic API Key für Claude als Alternative

> 💡 API Keys werden **lokal im Browser** gespeichert (localStorage) und niemals an externe Server gesendet.

---

## 🎮 Nutzung

### Schnellstart

1. **App starten** → Grünes Lämpchen zeigt "Bereit"
2. **Aufnahme starten** → Klick auf den orangenen Button oder `Ctrl+Shift+V`
3. **Sprechen** → Audio-Wellenform zeigt Aktivität
4. **Aufnahme stoppen** → Erneut klicken oder `Ctrl+Shift+V`
5. **Format wählen** → Original, Strukturiert, Zusammenfassung oder Kontext
6. **Ergebnis nutzen** → Kopieren, Speichern oder im Verlauf aufrufen

### Enrichment-Modi

| Modus | Beschreibung | Anwendungsfall |
|-------|--------------|----------------|
| **Original** | Unveränderte Transkription | Wörtliche Protokolle |
| **Strukturiert** | Automatische Gliederung | Meeting-Notizen, Listen |
| **Zusammenfassung** | Kernaussagen extrahiert | Lange Sprachnotizen |
| **Kontext** | Format-spezifisch | E-Mails, Newsletter, Social Media |

---

## 🏛️ Design-Entscheidungen

### Warum Tauri statt Electron?

- **Performance**: Tauri nutzt den System-WebView statt Chromium → ~10x kleinere App-Größe
- **Sicherheit**: Rust-Backend mit Sandbox-Isolation
- **Native Integration**: Bessere OS-Integration für Hotkeys und Clipboard

### Warum Next.js im Desktop-Kontext?

- **React 19 Features**: Server Components, Streaming (für zukünftige Erweiterungen)
- **TypeScript-First**: Typsicherheit im gesamten Stack
- **Ecosystem**: Große Community, viele Libraries

### Warum Zustand statt Redux?

- **Minimalistisch**: Weniger Boilerplate, direktere API
- **Persistenz**: Eingebaute localStorage-Integration
- **Performance**: Selektive Re-Renders out-of-the-box

### API-Strategie: OpenAI + Anthropic

- **OpenAI Whisper**: Industrie-Standard für Speech-to-Text, beste Genauigkeit
- **Wahlfreiheit**: User kann zwischen GPT-4 und Claude wählen
- **Keine eigene Infrastruktur**: Reduziert Komplexität, nutzt bewährte APIs

### UI/UX-Prinzipien

- **Dark Mode Only**: Reduziert Augenbelastung bei längerem Arbeiten
- **Orange Akzentfarbe**: Hoher Kontrast, signalisiert Interaktivität
- **Zentraler CTA**: Großer Aufnahme-Button als Fokuspunkt
- **Minimale Ablenkung**: Nur wesentliche Elemente sichtbar

---

## 📁 Projektstruktur

```
voice-intel/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Haupt-UI
│   │   ├── layout.tsx        # Root-Layout
│   │   └── globals.css       # Globale Styles
│   ├── components/
│   │   ├── RecordingButton.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── Settings.tsx
│   │   ├── History.tsx
│   │   ├── SaveDialog.tsx
│   │   ├── AudioWaveform.tsx
│   │   ├── LoadingIndicator.tsx
│   │   └── TextStats.tsx
│   ├── lib/
│   │   ├── api.ts            # OpenAI/Anthropic Integration
│   │   ├── audioRecorder.ts  # Web Audio Recording
│   │   ├── sounds.ts         # Sound-Feedback
│   │   └── i18n.ts           # Mehrsprachigkeit
│   └── stores/
│       └── appStore.ts       # Zustand State
├── src-tauri/
│   ├── src/
│   │   └── main.rs           # Tauri Backend
│   ├── Cargo.toml
│   └── tauri.conf.json       # Tauri Konfiguration
├── package.json
└── README.md
```

---

## 🔧 Tech-Stack

| Kategorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 15.1 |
| **UI Library** | React | 19.0 |
| **Language** | TypeScript | 5.0 |
| **Desktop** | Tauri | 2.0 |
| **Styling** | Tailwind CSS | 3.4 |
| **State** | Zustand | 5.0 |
| **Icons** | Lucide React | - |
| **PDF Export** | jsPDF | - |

---

## 📝 Lizenz

MIT License – Siehe [LICENSE](LICENSE) für Details.

---

## 👨‍💻 Entwickelt von

**mindric lab**

---

*Built with ❤️ and AI*
