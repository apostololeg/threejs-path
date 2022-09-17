export default class SpeechSynthesiser {
  synth: any;
  onend: () => void = () => {};

  constructor() {
    const synth = window.speechSynthesis;
    this.synth = synth;
  }

  speak(text: string) {
    const utterThis = new SpeechSynthesisUtterance(text);
    const voice = getVoice(this.synth, 'Alex');

    utterThis.voice = voice;
    this.synth.speak(utterThis);

    utterThis.onend = () => {
      this.onend();
    };
  }
}

function getVoice(synth, name) {
  return synth.getVoices().find(voice => voice.name === name);
}
