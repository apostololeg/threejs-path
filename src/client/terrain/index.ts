import * as THREE from 'three';
import drawImage from './drawImage';
const textureLoader = new THREE.TextureLoader();

async function blobToImageData(blob, width = 200, height = 200) {
  let blobUrl = URL.createObjectURL(blob);

  function onLoad(img: HTMLImageElement) {
    URL.revokeObjectURL(blobUrl);
    // Limit to 256x256px while preserving aspect ratio
    let [w, h] = [img.width, img.height];

    let aspectRatio = w / h;
    // Say the file is 1920x1080
    // divide max(w,h) by 256 to get factor
    let factor = Math.max(w, h) / width; // TODO previosly we divided it to 256, divide to width is correct?
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
    let img = new Image(width, height);

    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = blobUrl;
  }).then(onLoad);
}

async function loadImage(
  url: string,
  width?: number,
  height?: number
): Promise<ImageData> {
  try {
    const res = await fetch(url);
    const imageBlob = await res.blob();

    return await blobToImageData(imageBlob, width, height);
  } catch (err) {
    console.log('Error loading terrain', err);
  }
}

function getBinaryDataFromImageData(imageData: ImageData) {
  const { data, width, height } = imageData;
  const terrainData = new Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const x = i / 4;
    // const y = Math.floor(i / 4 / width);
    // const z = data[i] / 255;
    // const index = y * width + x;
    terrainData[x] = (data[i] / 255) * 10;
  }

  return terrainData;
}

export default async function getTerrain() {
  const imageData = await loadImage('/assets/gora.png', 200, 200);
  const data = getBinaryDataFromImageData(imageData);
  const { width, height } = imageData;
  console.log(width, height);

  const worldWidth = width;
  const worldDepth = height;

  const geometry = new THREE.PlaneGeometry(
    20,
    20,
    worldWidth - 1,
    worldDepth - 1
  );
  const texture = textureLoader.load('/assets/rocks.jpeg');
  // const bumpMap = textureLoader.load('/images/asphalt-normals.jpg');
  const vertices = geometry.attributes.position.array;

  console.log(
    'Verticies and binary data lenghts should be equal',
    vertices.length / 3,
    '===',
    data.length
  );

  for (let i = 0; i < data.length; i++) {
    //@ts-ignore
    vertices[i * 3 + 2] = data[i];
  }

  const material = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    map: texture,
    // bumpMap,
    bumpScale: 1,
    shininess: 0,
  });
  const terrain = new THREE.Mesh(geometry, material);

  texture.anisotropy = 2;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -5;

  // terrain.receiveShadow = true;
  return terrain;
}
