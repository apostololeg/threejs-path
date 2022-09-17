import { Message } from './types';

type ReplyResponse = {
  message: string;
  data: string;
};

export async function getReply(messages: Message[]): Promise<string> {
  try {
    const response = await fetch('/api/nlp/gpt', {
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
}
