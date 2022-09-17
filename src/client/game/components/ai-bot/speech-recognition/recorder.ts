import {
  MediaRecorder,
  IMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import VolumeDetector from './volume-detector';

export default class AudioRecorder {
  stream: any;
  chunks = [];
  mediaRecorder: IMediaRecorder;
  onRecordStop: (chunks: Blob[]) => void;
  onRecordStart: (stream: any) => void;
  isSpeaking = false;
  volumeDetector: VolumeDetector;
  inited = false;

  constructor({ onRecordStop, onRecordStart }) {
    this.onRecordStop = onRecordStop;
    this.onRecordStart = onRecordStart;
  }

  init = async () => {
    if (this.inited) return;

    this.inited = true;

    await register(await connect());

    if (!navigator.mediaDevices) return;

    const constraints = { audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/wav',
    });

    this.mediaRecorder.onstop = e => {
      this.onRecordStop(this.chunks);
      this.chunks = [];
    };

    this.stream = stream;

    const onSpeechStart = () => {
      // console.log('recorder: onSpeechStart()');
      this.isSpeaking = true;
    };

    const onVoidDetected = () => {
      // console.log('recorder: onVoidDetected()');
      this.stopRecord();
      this.isSpeaking = false;
    };

    this.volumeDetector = new VolumeDetector(
      stream,
      onSpeechStart,
      onVoidDetected
    );

    this.mediaRecorder.ondataavailable = e => {
      if (this.isSpeaking || this.chunks.length === 0) {
        this.chunks.push(e.data);
      }
    };
  };

  async startRecord() {
    try {
      await this.init();
      console.log('recorder: startRecord()');
      this.mediaRecorder.start(1000);
      this.onRecordStart(this.stream);
      this.volumeDetector.start();
    } catch (err) {
      console.warn('AudioRecorder', err);
    }
  }

  stopRecord() {
    if (this.mediaRecorder.state === 'inactive') return;

    try {
      // console.log('recorder: stopRecord()');
      this.mediaRecorder.stop();
      this.volumeDetector.stop();
    } catch (e) {
      console.warn(e);
    }
  }
}
