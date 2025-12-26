
export class AudioService {
  private static instance: AudioService;
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async playPCM(base64Data: string, sampleRate: number = 24000) {
    const ctx = this.getContext();
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    // Schedule for gapless playback if needed, or play now
    this.nextStartTime = Math.max(this.nextStartTime, ctx.currentTime);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    
    return new Promise((resolve) => {
      source.onended = resolve;
    });
  }

    async playUrl(buffer: AudioBuffer) {
    const ctx = this.getContext();
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    this.nextStartTime = Math.max(this.nextStartTime, ctx.currentTime);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    
    return new Promise((resolve) => {
      source.onended = resolve;
    });
  }

  async playBlob(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const ctx = this.getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      await this.playUrl(audioBuffer);
      
    } catch (error) {
      console.error('Error playing audio from Blob:', error);
      throw error;
    }
  }

  async playAudioFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status}`);
      }
      
      const blob = await response.blob();
      await this.playBlob(blob);
      
    } catch (error) {
      console.error('Error playing audio from URL:', error);
      throw error;
    }
  }

}
export const audioService = AudioService.getInstance();
