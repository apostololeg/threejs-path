import gui, { getKey, saveKey } from '../../../tools/gui';

const scope = 'scene';

export const state = {
  cameraHeight: getKey(scope, 'cameraHeight') ?? 1,
  speed: getKey(scope, 'speed') ?? 35,
};

export default _ => {
  const folder = gui.addFolder('Scene');
  const camera = _.observer.object.children[0];

  camera.position.y = state.cameraHeight;
  folder.add(state, 'cameraHeight', 1, 300, 1).onChange(value => {
    saveKey(scope, 'cameraHeight', value);
    camera.position.y = value;
  });

  folder.add(state, 'speed', 1, 300, 1).onChange(value => {
    saveKey(scope, 'speed', value);
  });
};
