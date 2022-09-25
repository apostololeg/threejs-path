interface Window {
  webkitAudioContext: typeof AudioContext;
  speechSynthesis: any;
  SpeechRecognition: any;
  SpeechGrammarList: any;
  SpeechRecognitionEvent: any;
  webkitSpeechRecognition: any;
  webkitSpeechGrammarList: any;
  webkitSpeechRecognitionEvent: any;
}

declare global {
  var MAPBOX_TOKEN: string;
}

export {};
