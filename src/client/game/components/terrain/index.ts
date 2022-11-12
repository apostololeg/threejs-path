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

const MAX_UPDATE_FREQ = 2000;

const DEFAULT_PARAMS = {
  coords: { lat: 44.449268, lon: 34.056132 }, // Yalta
  // coords: { lat: 42.65147, lon: 18.08251 }); // Dubrovnik
  // coords: { lat: 43.508441, lon: 16.417467 }); // Split
  // coords: { lat: 44.346033, lon: 15.561401 }); // Split
};

export default (_, [x, y, z]) => {
  const { scene, observer } = _._;
  const editor = new Editor();
  const params = {
    mapBoxToken: MAPBOX_TOKEN,
    container: scene,
    material,
    scale: 0.125,
    zoom: 14,
    getPosition() {
      return observer.target.position;
    },
    setPosition(pos) {
      const { position } = observer.object;

      Object.entries(pos).forEach(([key, val]) => {
        if (Number.isFinite(val)) position[key] = val;
      });
    },
    onTileRebuilded(tile, oldObject) {
      if (oldObject) observer.removeTeleportTargets([oldObject]);

      scene.add(tile.object);
      observer.addTeleportTargets([tile.object]);
      editor.dyeTile(tile);
    },
  } as TerrainParams;

  if (x && z) params.position = [x, z];
  else params.coords = DEFAULT_PARAMS.coords;

  const terrain = new Terrain(params);

  window.terrain = terrain;
  terrain.start();

  editor.init({ material, tiles: terrain.tiles });

  _.addEventListener(
    'user-move',
    throttle(terrain.update, MAX_UPDATE_FREQ, { trailing: true })
  );

  return terrain;
};
