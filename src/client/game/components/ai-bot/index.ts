import { getReply, getAudio, replayBlob } from './gpt';
import SpeechRecognition from './speech-recognition/main';
import SpeechSynthesiser from './speech-synthesis';
import { Author, Message } from './types';

const transcriptUrl = 'http://localhost:5000/transcript';
const recognition = new SpeechRecognition(transcriptUrl);
const speechSynthesiser = new SpeechSynthesiser();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

type State = {
  isStoppedByUser: boolean;
  lastStartedAt: number;
  timer?: number;
  messages: Message[];
};

const state: State = {
  lastStartedAt: 0,
  isStoppedByUser: false,
  messages: [],
};

recognition.onresult = async event => {
  const transcript = event.results[0][0].transcript;

  state.messages.push({
    text: transcript,
    author: Author.You,
  });
  logMessages();

  if (!transcript) {
    restartRecognition();
    return;
  }

  const reply = await getReply(state.messages);

  if (!reply) {
    restartRecognition();
    return;
  }

  state.messages.push({
    text: reply,
    author: Author.Bot,
    isBot: true,
  });
  logMessages();

  speechSynthesiser.speak(reply);
  speechSynthesiser.onend = restartRecognition;

  // TODO implement receiving audio from API insetad of using speechSynthesiser
  // const blob = await getAudio(reply);
  // replayBlob(blob);
  // setTimeout(restartRecognition, 3000);
};

recognition.onerror = event => {
  console.log('error', event);
};

function startRecognition() {
  try {
    recognition.start();

    state.lastStartedAt = Date.now();
    console.log('Listening...');
  } catch (err) {
    console.log('start error', err);
  }
}

function restartRecognition() {
  if (state.isStoppedByUser) {
    return;
  }

  let timeSinceLastStart = Date.now() - state.lastStartedAt;

  if (timeSinceLastStart < 1000) {
    clearTimeout(state.timer);
    state.timer = window.setTimeout(
      () => startRecognition(),
      1000 - timeSinceLastStart
    );
  } else {
    startRecognition();
  }
}

function stopRecognition() {
  try {
    recognition.stop();

    console.log('Stopped');
  } catch (err) {
    console.log('stop error', err);
  }
}

function logMessages() {
  const messagesString = state.messages
    .map(message => `${message.author} > ${message.text}`)
    .join('\n');

  console.log(messagesString);
  console.log('\n');
}

logMessages();

class AIBot {
  isStarted: boolean = false;

  constructor() {
    console.log("AI Bot is ready to work. Press 'Enter' to start or stop");
  }

  toggle() {
    if (this.isStarted) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.isStarted = true;
    state.isStoppedByUser = false;
    startRecognition();
  }

  stop() {
    this.isStarted = false;
    state.isStoppedByUser = true;
    stopRecognition();
  }
}

export default () => {
  const bot = new AIBot();

  document.addEventListener('keydown', event => {
    if (
      (!document.activeElement || document.activeElement === document.body) &&
      event.code === 'KeyI'
    )
      bot.toggle();
  });
};
