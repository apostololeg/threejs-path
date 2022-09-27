import { Message } from './types';
const audioUrl = 'http://localhost:5000/audio';
const gptUrl = '/api/nlp/gpt';

type ReplyResponse = {
  message: string;
  data: string;
};

export const getReply = async (messages: Message[]): Promise<string> => {
  try {
    const response = await fetch(gptUrl, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ReplyResponse = (await response.json()) as ReplyResponse;
    if (response.status >= 300) {
      throw new Error(response.statusText);
    }

    return result.data;
  } catch (err) {
    console.error(err);

    return '';
  }
};

export const getAudio = async (text: string): Promise<Blob | null> => {
  try {
    const response = await fetch(audioUrl, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.blob();

    if (response.status >= 300) {
      throw new Error(response.statusText);
    }

    return result;
  } catch (err) {
    console.error(err);

    return null;
  }
};

export function replayBlob(blob: Blob) {
  console.log('replayBlob', blob);
  const blobURL = window.URL.createObjectURL(blob);
  const audio = new Audio(blobURL);
  audio.play();
}
