import { CircleGeometry, MeshPhongMaterial, RepeatWrapping, Mesh } from 'three';

import textureLoader from '../loaders/texture';

export default function createGround({ sceneSize }) {
  const geometry = new CircleGeometry(sceneSize / 2 + 10, 32);
  const texture = textureLoader.load('/images/asphalt.jpg');
  const bumpMap = textureLoader.load('/images/asphalt-normals.png');
  const material = new MeshPhongMaterial({
    color: '#222',
    map: texture,
    bumpMap,
    bumpScale: 1,
    shininess: 0,
  });

  texture.anisotropy = 2;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(512, 512);
  const ground = new Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}
