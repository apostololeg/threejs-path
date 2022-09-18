import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

async function loadTerrain(url: RequestInfo | URL): Promise<Uint16Array> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  return new Uint16Array(buffer);
}

export default async function getTerrain() {
  const worldWidth = 200;
  const worldDepth = 200;

  const geometry = new THREE.PlaneGeometry(
    32,
    32,
    worldWidth - 1,
    worldDepth - 1
  );
  const texture = textureLoader.load('/images/asphalt.jpg');
  const bumpMap = textureLoader.load('/images/asphalt-normals.jpg');
  const vertices = geometry.attributes.position.array;

  const data = Array.from(
    new Uint16Array(await loadTerrain('/assets/terrain.bin'))
  ).map(v => (v / 65535) * 10);

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
    bumpMap,
    bumpScale: 1,
    shininess: 0,
  });
  const terrain = new THREE.Mesh(geometry, material);

  texture.anisotropy = 2;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(128, 128);

  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -5;

  // terrain.receiveShadow = true;
  return terrain;
}
