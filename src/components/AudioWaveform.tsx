'use client';

import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

export function AudioWaveform({ isRecording, stream }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isRecording || !stream || !canvasRef.current) {
      // Cleanup when not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    // Setup Audio Context
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) return;
      
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw symmetric waveform bars (mirror effect)
      const barCount = 40;
      const halfCount = barCount / 2;
      const barWidth = canvas.width / barCount - 2;
      const barSpacing = 2;
      
      // Only use the lower frequency range (where speech lives)
      const usableRange = Math.floor(bufferLength * 0.3); // Use first 30% of frequencies
      
      for (let i = 0; i < barCount; i++) {
        // Calculate mirror index - bars expand from center
        let dataIndex;
        if (i < halfCount) {
          // Left side - map from center outward
          dataIndex = Math.floor((halfCount - 1 - i) * usableRange / halfCount);
        } else {
          // Right side - mirror of left
          dataIndex = Math.floor((i - halfCount) * usableRange / halfCount);
        }
        
        const value = dataArray[dataIndex];
        // Add some randomness for more organic look
        const noise = Math.random() * 15;
        const barHeight = Math.max(4, ((value + noise) / 255) * canvas.height * 0.85);
        
        const x = i * (barWidth + barSpacing);
        const y = (canvas.height - barHeight) / 2;
        
        // Gradient from orange to lighter orange
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(0.5, '#fb923c');
        gradient.addColorStop(1, '#f97316');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isRecording, stream]);

  if (!isRecording) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <canvas 
        ref={canvasRef} 
        width={280} 
        height={50}
        style={{ 
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />
      <span className="text-xs text-zinc-500">Aufnahme läuft...</span>
    </div>
  );
}
