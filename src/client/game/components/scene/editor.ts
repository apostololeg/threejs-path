import { Euler, Quaternion } from 'three';
import Time from 'timen';

import gui, { getKey, saveKey } from '../../../tools/gui';

const scope = 'scene';

export const state = {
  cameraHeight: getKey(scope, 'cameraHeight') ?? 1,
  cameraAngle: getKey(scope, 'cameraAngle') ?? 0,
  rotationAndgle: getKey(scope, 'rotationAndgle') ?? 0,
  speed: getKey(scope, 'speed') ?? 35,
};

export default _ => {
  const folder = gui.addFolder('Scene');
  const { rotationAndgle, cameraHeight } = state;

  _.camera.position.y = cameraHeight;
  _.camera.rotation.x = state.cameraAngle;
  _.observer.object.rotation.y = rotationAndgle;

  Time.every(100, () => {
    saveKey(scope, 'rotationAndgle', _.observer.object.rotation.y);
    saveKey(scope, 'cameraAngle', _.camera.rotation.x);
  });

  folder.add(state, 'cameraHeight', 1, 3000, 1).onChange(value => {
    saveKey(scope, 'cameraHeight', value);
    _.camera.position.y = value;
  });

  folder.add(state, 'speed', 1, 300, 1).onChange(value => {
    saveKey(scope, 'speed', value);
  });
};
