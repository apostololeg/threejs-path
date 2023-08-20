import { MeshPhongMaterial } from 'three';
import Terrain from 'terrain-navigator';
import type { TerrainParams } from 'terrain-navigator';

import throttle from '../../../tools/throttle';

import Editor, { tileColors } from './editor';

const material = new MeshPhongMaterial({
  color: tileColors.default,
  shininess: 0.1,
  // side: DoubleSide,
  // wireframe: true,
});

const MAX_UPDATE_FREQ = 200;

const DEFAULT_PARAMS = {
  coords: { lat: 44.449268, lon: 34.056132 }, // Yalta
  // coords: { lat: 42.65147, lon: 18.08251 }); // Dubrovnik
  // coords: { lat: 43.508441, lon: 16.417467 }); // Split
  // coords: { lat: 44.346033, lon: 15.561401 }); // Split
};

export default (_, [x, y, z]) => {
  const { renderer, scene, observer } = _._;
  const editor = new Editor({ material });

  renderer.localClippingEnabled = true;

  const params = {
    mapBoxToken: MAPBOX_TOKEN,
    container: scene,
    material,
    scale: 1 / 16,
    zoom: 14,
    minZoom: 11,
    getPosition() {
      return observer.target.position;
    },
    setPosition(pos) {
      const { position } = observer.object;

      Object.entries(pos).forEach(([key, val]) => {
        if (Number.isFinite(val)) position[key] = val;
      });
    },
    onTileRebuilded(level, tile, oldObject) {
      if (level === 0) {
        if (oldObject) observer.removeTeleportTargets([oldObject]);
        observer.addTeleportTargets([tile.object]);
      }

      scene.add(tile.object);
      editor.dyeTile(tile);
    },
  } as TerrainParams;

  if (x && z) params.position = [x, z];
  else params.coords = DEFAULT_PARAMS.coords;

  const terrain = new Terrain(params);
  terrain.start();
  // @ts-ignore
  window.terrain = terrain;

  editor.init({ material, tiles: terrain.tiles });

  _.addEventListener(
    'user-move',
    throttle(() => terrain.update(), MAX_UPDATE_FREQ, { trailing: true })
  );

  return terrain;
};
