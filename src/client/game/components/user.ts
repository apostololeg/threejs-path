import { Mesh, SphereGeometry, MeshStandardMaterial, Color } from 'three';

export default function createUser(
  color = [Math.random(), Math.random(), Math.random()]
) {
  const obj = new Mesh(
    new SphereGeometry(0.1, 32, 32),
    new MeshStandardMaterial({ color: new Color(...color) })
  );

  obj.castShadow = true;
  // obj.position.y = 0.2;

  return obj;
}
