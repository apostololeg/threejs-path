import { Group, DirectionalLight, AmbientLight } from 'three';

export default function createLight({ sceneSize }) {
  const group = new Group();

  const dirLight = new DirectionalLight(0xffb341, 1);
  dirLight.position.set(-sceneSize, sceneSize, -sceneSize);
  dirLight.castShadow = true;
  // dirLight.shadow.mapSize.width = 512 * sceneSize;
  // dirLight.shadow.mapSize.height = 512 * sceneSize;
  group.add(dirLight);

  // const helper = new DirectionalLightHelper(dirLight, 5);
  // group.add(helper);

  const ambient = new AmbientLight(0xffffff, 1);
  ambient.position.set(100, 100, 100);
  group.add(ambient);

  return group;
}
