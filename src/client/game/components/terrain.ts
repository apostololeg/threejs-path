import * as THREE from 'three/build/three.module.js';

type TerrainType = 'rgb' | 'vector';

const TYPE_TO_METHOD = {
  rgb: 'getTerrainRgb',
  vector: 'getTerrainVector',
};

export default class Terrain {
  _;
  tgeo;
  obj;
  position = [];
  type: TerrainType = 'rgb';

  constructor({ _ }) {
    window.THREE = THREE;
    this._ = _;
    this.init();
  }

  async init() {
    const { default: ThreeGeo } = await import(
      'three-geo/dist/three-geo.esm.js'
    );

    // @ts-ignore
    this.tgeo = new ThreeGeo({ tokenMapbox: MAPBOX_TOKEN });

    this.updateTile();
    // _.on('user-move', this.checkPosition);
  }

  checkPosition = position => {};

  getTerrain(...args) {
    switch (this.type) {
      case 'rgb':
        return this.tgeo.getTerrainRgb(...args);
      case 'vector':
        return this.tgeo.getVectorTerrain(...args);
    }
  }

  updateTile = async () => {
    const obj = await this.tgeo[TYPE_TO_METHOD[this.type]](
      [44.494824, 34.165586], // [lat, lng]
      5.0, // radius of bounding circle (km)
      12 // zoom resolution
    );

    if (this.obj) {
      this._.scene.remove(this.obj);
      this._.observer.removeTeleportTargets(this.obj.children);
    }

    this._.scene.add(obj);
    this._.observer.addTeleportTargets(obj.children);

    this.obj = obj;

    // obj.computeBoundingBox();

    // @ts-ignore
    window.terrain = obj;

    obj.rotation.x = -Math.PI / 2;
    obj.scale.set(200, 200, 200);
  };
}
