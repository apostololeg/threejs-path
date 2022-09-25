import dat from 'dat.gui';

import LS from './localStorage';

const gui = new dat.GUI();

gui.closed = false;

const _ = (...args) => ['editor', ...args].join('.');

export function saveKey(scope, key, value) {
  LS.set(_(scope, key), value);
}

export function getKey(scope, key) {
  return LS.get(_(scope, key));
}

export default gui;
