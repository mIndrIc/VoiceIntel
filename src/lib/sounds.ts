// Sound-Feedback mit Web Audio API (keine externen Dateien nötig)

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function playStartSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Aufsteigender Ton (Start)
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.log('Sound nicht verfügbar:', e);
  }
}

export function playStopSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Absteigender Ton (Stop)
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.log('Sound nicht verfügbar:', e);
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    
    // Zwei kurze aufsteigende Töne
    [0, 0.1].forEach((delay, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(500 + i * 200, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.1);
      
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.1);
    });
  } catch (e) {
    console.log('Sound nicht verfügbar:', e);
  }
}
