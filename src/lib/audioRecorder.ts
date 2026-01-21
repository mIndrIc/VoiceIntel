export interface AudioDevice {
  deviceId: string;
  label: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private selectedDeviceId: string | null = null;
  
  // Get available audio input devices
  async getAudioDevices(requestPermission: boolean = false): Promise<AudioDevice[]> {
    try {
      // Only request permission if explicitly asked
      if (requestPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Mikrofon ${index + 1}`,
        }));
      
      // Filter out devices with empty deviceId
      return audioInputs.filter(d => d.deviceId);
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }
  
  setSelectedDevice(deviceId: string | null): void {
    this.selectedDeviceId = deviceId;
  }
  
  async start(): Promise<void> {
    try {
      // Audio constraints
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      
      // Add device selection if specified
      if (this.selectedDeviceId) {
        audioConstraints.deviceId = { exact: this.selectedDeviceId };
      }
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints
      });
      
      this.audioChunks = [];
      
      // Find supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      const recorderOptions: MediaRecorderOptions = {};
      if (selectedMimeType) {
        recorderOptions.mimeType = selectedMimeType;
      }
      
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };
      
      this.mediaRecorder.start(250); // Collect data every 250ms
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinem Browser.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Mikrofon wird bereits verwendet. Bitte schließe andere Apps, die das Mikrofon nutzen.');
        }
      }
      throw new Error('Aufnahme konnte nicht gestartet werden. Bitte überprüfe deine Mikrofon-Einstellungen.');
    }
  }
  
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Keine aktive Aufnahme'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
  
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
  
  // Get the current media stream for visualization
  getStream(): MediaStream | null {
    return this.stream;
  }
}

// Singleton instance
export const audioRecorder = new AudioRecorder();
