import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { CMSMode, CSM } from 'three/examples/jsm/csm/CSM.js';
import RootThree from 'roothree';

const textureLoader = new THREE.TextureLoader();

const sceneSize = 500;
// const updaters = [];
const colors = {
  fog: 0xfdbe6e00,
  boxes: 0x0057b800,
};

function getGround() {
  const geometry = new THREE.CircleGeometry(sceneSize / 2 + 10, 32);
  const texture = textureLoader.load('/images/asphalt.jpg');
  const bumpMap = textureLoader.load('/images/asphalt-normals.jpg');
  const material = new THREE.MeshPhongMaterial({
    color: '#222',
    map: texture,
    bumpMap,
    bumpScale: 1,
    shininess: 0,
  });

  texture.anisotropy = 2;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(512, 512);
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

function createLight(_) {
  const group = new THREE.Group();

  const dirLight = new THREE.DirectionalLight(0xffb341, 1);
  dirLight.position.set(50, 100, 100);
  dirLight.castShadow = true;
  group.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  ambient.position.set(100, 100, 100);
  group.add(ambient);

  return group;
}

function createBoxes() {
  const boxes = [] as THREE.BoxGeometry[];
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
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        geometry.applyMatrix4(
          new THREE.Matrix4().makeTranslation(
            x - xLength / 2,
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
    new THREE.MeshPhongMaterial({ color: '#222' })
  );

  // mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createSkybox(_) {
  const texture = textureLoader.load('/images/sky.jpeg', () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(_.renderer, texture);
    _.scene.background = rt.texture;
  });
}

function createUser() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 32, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
    })
  );
}

export default class Scene {
  _;
  users = {};

  constructor() {
    this._ = new RootThree({
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
      onReady: this.onSceneReady,
      // update() {
      //   updaters.forEach(u => u());
      // },
    });
  }

  onSceneReady = _ => {
    const ground = getGround();
    const boxes = createBoxes();

    // _.observer.target.material.color = new THREE.Color('#0f0');

    // _.scene.background = new THREE.Color(0xffd700);
    _.scene.fog = new THREE.Fog(colors.fog, 1, 100);

    createSkybox(_);
    _.scene.add(createLight(_));
    _.scene.add(ground);
    _.scene.add(boxes);

    // const scale = 10;
    // const upScale = 1 * scale;
    // const downScale = 1 / scale;

    _.observer.object.add(createUser());
    _.observer.object.rotation.y = -1.5;

    _.observer.addTeleportTargets([ground, boxes]);
  };

  addUser(id, data?) {
    const obj = createUser();

    this.users[id] = obj;
    if (data) this.updateUser(id, data);
    this._.scene.add(obj);
  }

  updateUser(id, data) {
    Object.entries(data).forEach(([key, v]: any) => {
      switch (key) {
        case 'color':
          this.users[id].material.color = new THREE.Color(...v);
          break;
        case 'position':
          this.users[id].position.set(...v);
          break;
      }
    });
  }

  removeUser(id) {
    this._.scene.remove(this.users[id]);
    delete this.users[id];
  }
}
