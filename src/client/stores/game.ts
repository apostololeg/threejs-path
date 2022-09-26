import { createStore } from 'justorm/react';

import game from '../game';

export default createStore('game', {
  isStarted: false,

  start() {
    if (this.isStarted) return;
    this.isStarted = true;
    game.start();
  },
});
