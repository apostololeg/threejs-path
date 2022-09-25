import {
  Group,
  DirectionalLight,
  AmbientLight,
  MeshPhongMaterial,
  Vector3,
} from 'three';
import CSM from 'three-csm';

export default function createLight(root, sceneSize) {
  const { scene, camera } = root._;
  const group = new Group();

  // const dirLight = new DirectionalLight(0xffb341, 0.1);
  // dirLight.position.set(-10000, 12000, -1000);
  // dirLight.castShadow = true;
  // // dirLight.shadow.mapSize.width = 512 * sceneSize;
  // // dirLight.shadow.mapSize.height = 512 * sceneSize;
  // group.add(dirLight);

  // const helper = new DirectionalLightHelper(dirLight, 5);
  // group.add(helper);

  const ambient = new AmbientLight(0xfff0d3, 1);
  ambient.position.set(-10000, 12000, -10000);
  group.add(ambient);

  scene.add(group);

  // Cascaded shadow maps:
  const material = new MeshPhongMaterial(); // works with Phong and Standard materials
  const csm = new CSM({
    maxFar: camera.far,
    cascades: 1,
    shadowMapSize: 1024,
    lightDirection: new Vector3(1, -1, 1).normalize(),
    camera: camera,
    parent: scene,
    // mode: 'uniform',
  });

  csm.setupMaterial(material); // must be called to pass all CSM-related uniforms to the shader
  root.addUpdater(() => csm.update(camera.matrix));
}
