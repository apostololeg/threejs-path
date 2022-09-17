import AudioRecorder from './recorder';
import { ResultEvent } from './types';

type TranscriptResponse = {
  message: string;
  data: { transcript: string };
};

class SpeechRecognition {
  recorder: AudioRecorder;
  onspeechend: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: ResultEvent) => {};
  isStopped = false;
  minVolume: number = 7;
  continuous: boolean;
  lang: 'en-US';
  interimResults: boolean;
  maxAlternatives: number;

  constructor(public url: string) {
    this.url = url;
    console.log('Custom SpeechRecognition constructor');

    this.init();
  }

  async init() {
    this.recorder = new AudioRecorder({
      onRecordStart: stream => {
        // console.log('audio: onRecordStart');
      },
      onRecordStop: async chunks => {
        // console.log('audio: onRecordStop');
        this.transcript(new Blob(chunks));
      },
    });
  }

  async transcript(blob: Blob) {
    const transcript = await this.recognize(this.url, blob);

    const event: ResultEvent = {
      results: [
        [
          {
            transcript,
          },
        ],
      ],
    };

    if (!this.isStopped) {
      this.onresult(event);
      // this.onspeechend();
      // this.onend();
    }
  }

  async recognize(url: string, blob: Blob) {
    try {
      const formData = new FormData();
      formData.append('sample', blob, 'filename.wav');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const result: TranscriptResponse =
        (await response.json()) as TranscriptResponse;

      if (response.status >= 300) {
        throw new Error(response.statusText);
      }

      return result.data.transcript;
    } catch (err) {
      console.error(err);
    }
  }

  start() {
    // console.log('recognition: start()');
    this.isStopped = false;

    this.recorder.startRecord();
  }

  stop() {
    // console.log('recognition: stop()');
    this.isStopped = true;

    this.recorder.stopRecord();
  }
}

export default SpeechRecognition;
// export default window.SpeechRecognition ||
//   window.webkitSpeechRecognition ||
//   SpeechRecognition;
