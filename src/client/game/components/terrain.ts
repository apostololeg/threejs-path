import {
  DoubleSide,
  RepeatWrapping,
  PlaneGeometry,
  MeshPhongMaterial,
  Mesh,
} from 'three';

import textureLoader from '../loaders/texture';

const size = 512;
const plane = { width: 10, height: 10 };
const yAmplitude = 0.01;
const yOffset = 1000;

const buildURL = (x, y, zoom) =>
  `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${x}/${y}@2x.jpg90?access_token=pk.eyJ1IjoiYXBvc3RvbG9sZWciLCJhIjoiY2tnNWk4aWI3MHVsbDJzcjJudGVkMWJyMCJ9.5N7wWFkKxF-JSGlvT3bsBA`;

async function blobToImageData(blob) {
  let blobUrl = URL.createObjectURL(blob);

  function onLoad(img: HTMLImageElement) {
    URL.revokeObjectURL(blobUrl);
    // Limit to 256x256px while preserving aspect ratio
    let [w, h] = [img.width, img.height];

    let aspectRatio = w / h;
    // Say the file is 1920x1080
    // divide max(w,h) by 256 to get factor
    let factor = Math.max(w, h) / size; // TODO previosly we divided it to 256, divide to width is correct?
    w = w / factor;
    h = h / factor;
    // REMINDER
    // 256x256 = 65536 pixels with 4 channels (RGBA) = 262144 data points for each image
    // Data is encoded as Uint8ClampedArray with BYTES_PER_ELEMENT = 1
    // So each images = 262144bytes
    // 1000 images = 260Mb
    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return ctx.getImageData(0, 0, w, h); // some browsers synchronously decode image here
  }

  return new Promise((resolve, reject) => {
    let img = new Image(size, size);

    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = blobUrl;
  }).then(onLoad);
}

async function loadImage(url: string): Promise<ImageData> {
  try {
    const res = await fetch(url);
    const imageBlob = await res.blob();

    return await blobToImageData(imageBlob);
  } catch (err) {
    console.log('Error loading terrain', err);
  }
}

function getBinaryDataFromImageData(imageData: ImageData, yAmplitude, yOffset) {
  const { data, width, height } = imageData;
  const terrainData = new Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const R = data[i];
    const G = data[i + 1];
    const B = data[i + 2];
    const height = (R * 256 * 256 + G * 256 + B) * yAmplitude - yOffset;

    terrainData[i / 4] = height;
  }

  return terrainData;
}

async function getTile(x, y, zoom) {
  const imageUrl = buildURL('3826', '6127', 14);
  const textureUrl = imageUrl;

  const imageData = await loadImage(imageUrl);
  const data = getBinaryDataFromImageData(imageData, yAmplitude, yOffset);
  const geometry = new PlaneGeometry(
    plane.width,
    plane.width,
    size - 1,
    size - 1
  );

  const texture = textureLoader.load(textureUrl);
  // const bumpMap = textureLoader.load('/images/asphalt-normals.jpg');
  const vertices = geometry.attributes.position.array;

  console.log(imageUrl, imageData);
  console.log(vertices.length / 3, data.length, data);
  console.log('\n');

  if (vertices.length / 3 !== data.length) {
    throw new Error('Invalid data length');
  }

  for (let i = 0; i < data.length; i++) {
    //@ts-ignore
    vertices[i * 3 + 2] = data[i];
  }

  const material = new MeshPhongMaterial({
    color: 0x333333,
    map: texture,
    bumpScale: 1,
    shininess: 0,
    side: DoubleSide,
    // bumpMap,
    // wireframe: true,
  });
  const terrain = new Mesh(geometry, material);

  // texture.rotation.x = Math.PI;
  // texture.anisotropy = 2;
  // texture.wrapS = texture.wrapT = RepeatWrapping;
  // texture.repeat.set(8, 8);

  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -5;
  // terrain.receiveShadow = true;

  return terrain;
}

export default class Terrain {
  _;
  obj;
  position = [];

  constructor({ _ }) {
    this._ = _;
    this.init();
  }

  async init() {
    this.updateTile();
    // _.on('user-move', this.checkPosition);
  }

  checkPosition = position => {};

  async loadTerrain(url: RequestInfo | URL): Promise<Uint16Array> {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    return new Uint16Array(buffer);
  }

  async updateTile() {
    const obj = await getTile(0, 0, 1);

    if (this.obj) {
      this._.scene.remove(this.obj);
      this._.observer.removeTeleportTargets([this.obj]);
    }

    this._.scene.add(obj);
    this._.observer.addTeleportTargets([obj]);

    this.obj = obj;

    // obj.computeBoundingBox();

    // @ts-ignore
    window.terrain = obj;

    // obj.rotation.x = -Math.PI / 2;
    // obj.scale.set(200, 200, 200);
  }
}
