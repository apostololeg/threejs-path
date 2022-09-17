export default class VolumeDetector {
  isSpeaking = false;
  onSpeechStart = () => {};
  onVoidDetected = () => {};
  timer = null;
  minVolumeTreshhold = 14;
  minSilenceDelay = 900;
  isActive = false;

  speechStartTime: number;

  start = () => (this.isActive = true);
  stop = () => (this.isActive = false);

  constructor(stream, onSpeechStart, onVoidDetected) {
    this.onSpeechStart = onSpeechStart;
    this.onVoidDetected = onVoidDetected;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    scriptProcessor.onaudioprocess = () => {
      if (!this.isActive) return;

      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;
      const isHighVolume = average > this.minVolumeTreshhold;

      if (isHighVolume) {
        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.onSpeechStart();
          this.speechStartTime = Date.now();
        } else if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      } else if (this.isSpeaking && !this.timer) {
        this.timer = setTimeout(() => {
          this.isSpeaking = false;
          this.onVoidDetected();
          this.timer = null;
        }, this.minSilenceDelay);
      }
    };
  }
}
