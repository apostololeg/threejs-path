import { BoxGeometry, Matrix4, Mesh, MeshPhongMaterial } from 'three';

import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

export default function createSkyscrapers({ sceneSize }) {
  const boxes = [] as BoxGeometry[];
  const xLength = sceneSize;
  const yLength = sceneSize;
  const density = 0.7;

  for (let x = 0; x < xLength; x += 3) {
    for (let y = 0; y < yLength; y += 3) {
      const lengthToCenter = Math.sqrt(
        Math.pow(x - xLength / 2, 2) + Math.pow(y - yLength / 2, 2)
      );

      if (lengthToCenter < sceneSize / 2 && Math.random() < density) {
        const height = Math.max(1, Math.random() * 10);
        const geometry = new BoxGeometry(1, 1, 1);

        geometry.applyMatrix4(
          new Matrix4().makeTranslation(x - xLength / 2, 0.5, y - yLength / 2)
        );

        geometry.applyMatrix4(new Matrix4().makeScale(1, height, 1));
        boxes.push(geometry);
      }
    }
  }

  const mesh = new Mesh(
    mergeBufferGeometries(boxes, false),
    new MeshPhongMaterial({ color: '#222' })
  );

  // mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}
