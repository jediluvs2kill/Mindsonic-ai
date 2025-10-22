
import { useState, useRef, useEffect, useCallback } from 'react';
import { BrainwaveData } from '../types';

export const useBrainwave = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentWave, setCurrentWave] = useState<BrainwaveData | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const stopSound = useCallback(() => {
    if (leftOscillatorRef.current) {
      leftOscillatorRef.current.stop();
      leftOscillatorRef.current.disconnect();
    }
    if (rightOscillatorRef.current) {
      rightOscillatorRef.current.stop();
      rightOscillatorRef.current.disconnect();
    }
    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop vibration
    }
    leftOscillatorRef.current = null;
    rightOscillatorRef.current = null;
    setIsPlaying(false);
  }, []);
  
  const playSound = useCallback((waveData: BrainwaveData) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        return;
      }
    }
    
    const audioContext = audioContextRef.current;
    
    // Resume context on user interaction
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Stop any currently playing sound before starting a new one
    if (isPlaying) {
      stopSound();
    }
    setCurrentWave(waveData);

    const { baseFrequency, binauralBeat } = waveData;

    const leftOscillator = audioContext.createOscillator();
    const rightOscillator = audioContext.createOscillator();
    const panner = audioContext.createStereoPanner();
    const gainNode = audioContext.createGain();
    const analyserNode = audioContext.createAnalyser();

    analyserNode.fftSize = 2048;
    analyserNodeRef.current = analyserNode;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.5); // Fade in

    leftOscillator.type = 'sine';
    leftOscillator.frequency.setValueAtTime(baseFrequency, audioContext.currentTime);

    rightOscillator.type = 'sine';
    rightOscillator.frequency.setValueAtTime(baseFrequency + binauralBeat, audioContext.currentTime);

    const merger = audioContext.createChannelMerger(2);
    leftOscillator.connect(merger, 0, 0);
    rightOscillator.connect(merger, 0, 1);
    
    merger.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    leftOscillator.start();
    rightOscillator.start();

    leftOscillatorRef.current = leftOscillator;
    rightOscillatorRef.current = rightOscillator;
    gainNodeRef.current = gainNode;

    setIsPlaying(true);

    if (navigator.vibrate && binauralBeat > 0) {
      const vibrationPattern = Math.round(1000 / binauralBeat);
      navigator.vibrate(Array(20).fill(vibrationPattern)); // Vibrate for a pattern
    }
  }, [isPlaying, stopSound]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopSound();
    } else if(currentWave){
      playSound(currentWave);
    }
  }, [isPlaying, stopSound, playSound, currentWave]);


  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSound();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopSound]);

  return { isPlaying, playSound, stopSound, togglePlayPause, analyserNode: analyserNodeRef.current, currentWave };
};
