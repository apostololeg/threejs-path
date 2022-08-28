import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CMSMode, CSM } from 'three/examples/jsm/csm/CSM.js';
import RootThree from 'roothree';

const sceneSize = 500;
const updaters = [];
const groundMaterial = new THREE.MeshPhongMaterial({ color: '#777' });

function getGround() {
  const geometry = new THREE.CircleGeometry(sceneSize, 32);
  const ground = new THREE.Mesh(geometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

function createLight(_) {
  const group = new THREE.Group();

  const dirLight = new THREE.DirectionalLight(0xffb341, 1);
  dirLight.position.set(50, 100, 100); //.normalize().multiplyScalar(-200);
  dirLight.castShadow = true;
  group.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  ambient.position.set(100, 100, 100);
  group.add(ambient);

  // const csm = new CSM({
  //   parent: _.scene,
  //   camera: _.camera,
  //   // mode: 'practical' as CMSMode,
  //   // mode: 'uniform' as CMSMode,
  //   // mode: 'logarithmic' as CMSMode,
  //   maxFar: 100,
  //   lightFar: 50,
  //   lightNear: 1,
  //   lightMargin: 1,
  //   lightDirection: new THREE.Vector3(-1, -1, -1).normalize(),
  // });
  // csm.setupMaterial(groundMaterial);
  // csm.setupMaterial(new THREE.MeshPhongMaterial({ color: '#08d9d6' }));
  // csm.setupMaterial(new THREE.MeshPhongMaterial({ color: '#ff2e63' }));
  // updaters.push(() => csm.update());

  return group;
}

function createBoxes() {
  const boxes = [] as THREE.BoxGeometry[];
  const xlength = sceneSize;
  const yLength = sceneSize;
  const density = 0.7;

  for (let x = 0; x < xlength; x += 3) {
    for (let y = 0; y < yLength; y += 3) {
      if (Math.random() < density) {
        const height = Math.max(1, Math.random() * 10);
        // const geometry = new THREE.BoxGeometry(2.8, height, 2.8, 2, height, 2);
        // const geometry = new THREE.BoxGeometry(2.8, height, 2.8, 2, height, 2);
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        geometry.applyMatrix4(
          new THREE.Matrix4().makeTranslation(
            x - xlength / 2,
            0.5,
            y - yLength / 2
          )
        );

        geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, height, 1));

        boxes.push(geometry);
      }
    }
  }

  const mesh = new THREE.Mesh(
    mergeBufferGeometries(boxes, false),
    new THREE.MeshPhongMaterial({ color: 0x0057b8 })
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

new RootThree({
  renderer: {
    antialias: true,
    configure: renderer => {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    },
  },
  controllers: true,
  teleportation: {
    targets: [],
  },
  onReady(_) {
    const ground = getGround();
    const boxes = createBoxes();

    _.scene.background = new THREE.Color(0xffd700);
    // _.scene.fog = new THREE.Fog(0xffd700, 1, 70);

    _.scene.add(createLight(_));
    _.scene.add(ground);
    _.scene.add(boxes);

    _.observer.rotation.y = -1.5;

    _.teleportation.addTargets([ground, boxes]);
  },
  update() {
    updaters.forEach(u => u());
  },
});
