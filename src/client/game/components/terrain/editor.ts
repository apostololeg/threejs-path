import { Color } from 'three';
import gui, { getKey, saveKey } from '../../../tools/gui';

export const tileColors = {
  'top-left': 0xff0000,
  'top-right': 0x00ff00,
  'bottom-left': 0x0000ff,
  'bottom-right': 0xffff00,
  default: 0x424240,
};

export default class TerrainEditor {
  tiles;
  material;
  folder = gui.addFolder('Terrain');

  values = {
    isDye: getKey('terrain', 'isDye') ?? false,
    wireframe: getKey('terrain', 'wireframe') ?? false,
  };

  init({ material, tiles }) {
    this.material = material;
    this.tiles = tiles;

    // const materialParams = {
    //   color: material.color.getHex(),
    //   emissive: material.emissive.getHex(),
    // };

    if (this.values.wireframe) material.wireframe = true;

    // this.folder.open();

    this.folder.add(this.values, 'isDye').onChange(this.onDyeChange);

    // this.folder.add(material, 'flatShading');
    this.folder
      .add(this.material, 'wireframe')
      .onChange(this.onWireframeChange);
    // this.folder
    //   .addColor(materialParams, 'color')
    //   .onChange(value => everyTile(tile => tile.material.color.set(value)));
    // this.folder
    //   .addColor(materialParams, 'emissive')
    //   .onChange(value => everyTile(tile => tile.material.emissive.set(value)));
  }

  everyTile = fn => this.tiles.flat().forEach(fn);

  onDyeChange = value => {
    saveKey('terrain', 'isDye', value);
    this.tiles.flat().forEach(this.dyeTile);
  };

  onWireframeChange = value => {
    saveKey('terrain', 'wireframe', value);
    this.everyTile(tile => (tile.object.material.wireframe = value));
  };

  dyeTile = tile => {
    const color =
      (this.values.isDye && tileColors[tile.side]) || tileColors.default;
    tile.object.material.color = new Color(color);
  };
}
