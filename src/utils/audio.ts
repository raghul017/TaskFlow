export class SoundManager {
  private audio: HTMLAudioElement;
  private volume: number = 0.5;

  constructor(soundUrl: string) {
    this.audio = new Audio(soundUrl);
    this.audio.volume = this.volume;
  }

  play() {
    this.audio.currentTime = 0;
    return this.audio.play();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.audio.volume = this.volume;
  }

  getVolume() {
    return this.volume;
  }

  mute() {
    this.audio.volume = 0;
  }

  unmute() {
    this.audio.volume = this.volume;
  }
}
