
export enum WaveType {
  Delta = 'Delta',
  Theta = 'Theta',
  Alpha = 'Alpha',
  Beta = 'Beta',
  Gamma = 'Gamma',
}

export interface BrainwaveData {
  mood: string;
  waveType: WaveType;
  binauralBeat: number;
  baseFrequency: number;
  description: string;
  color: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
}
