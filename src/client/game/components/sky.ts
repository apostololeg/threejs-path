import { WebGLCubeRenderTarget } from 'three';

import textureLoader from '../loaders/texture';

export default function create(_) {
  const texture = textureLoader.load('/images/sky.jpeg', () => {
    const rt = new WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(_.renderer, texture);
    _.scene.background = rt.texture;
  });
}
