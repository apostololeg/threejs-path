import openaiApi from 'openai';

import env from '../../env';
import { Author } from './constants.js';

const { Configuration, OpenAIApi } = openaiApi;

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function generatePrompt(messages) {
  const startText = `${Author.Bot} is a chatbot that reluctantly answers questions with sarcastic responses:\n\n`;

  function getName(message) {
    if (message.isBot) {
      return Author.Bot;
    } else {
      return Author.You;
    }
  }

  function mapMessage(message) {
    return `${getName(message)}: ${message.text}\n`;
  }

  const mappedList = messages.map(mapMessage).join('');

  return `${startText}\n\n${mappedList}\n${Author.Bot}:`;
}

export async function getReply(messages) {
  try {
    const completion = await openai.createCompletion({
      model: 'text-babbage-001',
      prompt: generatePrompt(messages),
      temperature: 0.6,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });

    // @ts-ignore
    return completion.data.choices[0].text;
  } catch (error) {
    console.log(error.message);
  }
}
