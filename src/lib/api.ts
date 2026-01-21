import { EnrichmentMode, LLMProvider, ContextType, CONTEXT_TYPE_LABELS } from '@/stores/appStore';

const ENRICHMENT_PROMPTS: Record<Exclude<EnrichmentMode, 'original' | 'context'>, string> = {
  structured: `Du bist ein Assistent, der Spracheingaben in strukturierte Notizen umwandelt.
Erstelle aus dem folgenden Text eine gut strukturierte Notiz mit:
- Einem prägnanten Titel (als # Überschrift)
- Bullet-Points für die wichtigsten Punkte
- Relevante Tags am Ende (z.B. #meeting, #todo, #idee)

Formatiere die Ausgabe übersichtlich und professionell. Antworte nur mit der formatierten Notiz, ohne Erklärungen.`,
  
  summary: `Du bist ein Assistent, der Texte präzise zusammenfasst.
Extrahiere die Kernaussage(n) aus dem folgenden Text:
- Fasse den Inhalt in 2-3 Sätzen zusammen
- Fokussiere auf das Wesentliche
- Verwende klare, präzise Sprache

Sei knapp aber vollständig. Antworte nur mit der Zusammenfassung, ohne Erklärungen.`,
};

const CONTEXT_PROMPTS: Record<ContextType, string> = {
  email_formal: `Formatiere den folgenden Text als förmliche, professionelle E-Mail.
Struktur:
- Angemessene Anrede (z.B. "Sehr geehrte Damen und Herren,")
- Professioneller Textkörper
- Höfliche Grußformel (z.B. "Mit freundlichen Grüßen")

Behalte den Inhalt bei, verbessere Ton und Struktur. Antworte nur mit der E-Mail.`,

  email_casual: `Formatiere den folgenden Text als lockere, freundliche E-Mail.
Struktur:
- Persönliche Anrede (z.B. "Hallo [Name],", "Hi,")
- Natürlicher, freundlicher Textkörper
- Lockere Grußformel (z.B. "Viele Grüße", "Liebe Grüße")

Behalte den Inhalt bei, mache den Ton persönlicher. Antworte nur mit der E-Mail.`,

  newsletter: `Formatiere den folgenden Text als ansprechenden Newsletter-Abschnitt.
Struktur:
- Aufmerksamkeitsstarke Überschrift
- Einleitender Absatz der neugierig macht
- Gut strukturierter Hauptteil mit Absätzen
- Call-to-Action am Ende (falls passend)

Mache den Text engaging und leicht lesbar. Antworte nur mit dem Newsletter-Text.`,

  social_media: `Formatiere den folgenden Text als Social Media Post.
Anforderungen:
- Kurz und prägnant (max. 280 Zeichen wenn möglich)
- Aufmerksamkeitsstark
- Passende Emojis einbauen
- Relevante Hashtags am Ende

Mache den Post engaging und teilbar. Antworte nur mit dem Post.`,

  meeting_notes: `Formatiere den folgenden Text als strukturierte Meeting-Notizen.
Struktur:
- **Datum/Thema:** (falls erkennbar)
- **Teilnehmer:** (falls erwähnt)
- **Besprochene Punkte:** (als Bullet-Liste)
- **Entscheidungen:** (falls vorhanden)
- **Nächste Schritte / Action Items:** (als Checkliste mit [ ])

Antworte nur mit den Meeting-Notizen.`,

  todo_list: `Formatiere den folgenden Text als klare TODO-Liste.
Struktur:
- Jede Aufgabe als Checkbox: [ ] Aufgabe
- Gruppiere nach Priorität oder Kategorie falls sinnvoll
- Füge Deadlines hinzu falls erwähnt
- Halte die Aufgaben kurz und actionable

Antworte nur mit der TODO-Liste.`,

  blog_post: `Formatiere den folgenden Text als Blog-Artikel.
Struktur:
- Einprägsamer Titel (als # Überschrift)
- Interessante Einleitung
- Gut strukturierter Hauptteil mit Zwischenüberschriften
- Fazit oder Schlussgedanke

Mache den Text informativ und leicht lesbar. Antworte nur mit dem Blog-Artikel.`,

  report: `Formatiere den folgenden Text als professionellen Bericht.
Struktur:
- Titel und ggf. Untertitel
- Executive Summary (kurze Zusammenfassung)
- Hauptteil mit nummerierten Abschnitten
- Schlussfolgerungen/Empfehlungen

Halte den Ton sachlich und professionell. Antworte nur mit dem Bericht.`,
};

// Get file extension based on mime type
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3',
  };
  return mimeToExt[mimeType] || 'webm';
}

export async function transcribeAudio(audioBlob: Blob, apiKey: string): Promise<string> {
  const extension = getFileExtension(audioBlob.type);
  const filename = `audio.${extension}`;
  
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('model', 'whisper-1');
  formData.append('language', 'de');
  formData.append('response_format', 'text');
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || `Transkription fehlgeschlagen (${response.status})`;
    
    if (response.status === 401) {
      throw new Error('Ungültiger API Key. Bitte überprüfe deinen OpenAI API Key.');
    } else if (response.status === 429) {
      throw new Error('API Rate Limit erreicht. Bitte warte einen Moment.');
    } else if (response.status === 400) {
      throw new Error('Audio konnte nicht verarbeitet werden. Versuche es erneut.');
    }
    
    throw new Error(errorMessage);
  }
  
  const text = await response.text();
  return text.trim();
}

export async function enrichWithOpenAI(
  text: string, 
  mode: EnrichmentMode, 
  apiKey: string,
  contextType?: ContextType
): Promise<string> {
  // For original mode, just return the text as-is
  if (mode === 'original') {
    return text;
  }
  
  // Get the appropriate prompt
  let systemPrompt: string;
  if (mode === 'context' && contextType) {
    systemPrompt = CONTEXT_PROMPTS[contextType];
  } else {
    systemPrompt = ENRICHMENT_PROMPTS[mode as keyof typeof ENRICHMENT_PROMPTS];
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || `OpenAI Anfrage fehlgeschlagen (${response.status})`;
    
    if (response.status === 401) {
      throw new Error('Ungültiger OpenAI API Key.');
    } else if (response.status === 429) {
      throw new Error('API Rate Limit erreicht. Bitte warte einen Moment.');
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

export async function enrichWithAnthropic(
  text: string, 
  mode: EnrichmentMode, 
  apiKey: string,
  contextType?: ContextType
): Promise<string> {
  // For original mode, just return the text as-is
  if (mode === 'original') {
    return text;
  }
  
  // Get the appropriate prompt
  let systemPrompt: string;
  if (mode === 'context' && contextType) {
    systemPrompt = CONTEXT_PROMPTS[contextType];
  } else {
    systemPrompt = ENRICHMENT_PROMPTS[mode as keyof typeof ENRICHMENT_PROMPTS];
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: text },
      ],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || `Anthropic Anfrage fehlgeschlagen (${response.status})`;
    
    if (response.status === 401) {
      throw new Error('Ungültiger Anthropic API Key.');
    } else if (response.status === 429) {
      throw new Error('API Rate Limit erreicht. Bitte warte einen Moment.');
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  return data.content[0]?.text?.trim() || '';
}

export async function enrichText(
  text: string,
  mode: EnrichmentMode,
  provider: LLMProvider,
  openaiKey: string,
  anthropicKey: string,
  contextType?: ContextType
): Promise<string> {
  // For original mode, no API call needed
  if (mode === 'original') {
    return text;
  }
  
  if (provider === 'openai') {
    if (!openaiKey) throw new Error('OpenAI API Key fehlt');
    return enrichWithOpenAI(text, mode, openaiKey, contextType);
  } else {
    if (!anthropicKey) throw new Error('Anthropic API Key fehlt');
    return enrichWithAnthropic(text, mode, anthropicKey, contextType);
  }
}
