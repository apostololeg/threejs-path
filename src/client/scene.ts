import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { CMSMode, CSM } from 'three/examples/jsm/csm/CSM.js';
import RootThree from 'roothree';
import move from './move';
import getTerrain from './terrain';
const textureLoader = new THREE.TextureLoader();

// @ts-ignore
window.THREE = THREE;

const sceneSize = 10;
const yOffset = 0.5;
const updaters = [];
const colors = {
  fog: 0xfdbe6e00,
  boxes: 0x0057b800,
};

function createLight(_) {
  const group = new THREE.Group();

  const dirLight = new THREE.DirectionalLight(0xffb341, 1);
  dirLight.position.set(-sceneSize, sceneSize, -sceneSize);
  dirLight.castShadow = true;
  // dirLight.shadow.mapSize.width = 512 * sceneSize;
  // dirLight.shadow.mapSize.height = 512 * sceneSize;
  group.add(dirLight);

  // const helper = new THREE.DirectionalLightHelper(dirLight, 5);
  // group.add(helper);

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
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

function createUser(color?) {
  const obj = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshStandardMaterial({
      color: color
        ? new THREE.Color(...color)
        : new THREE.Color(Math.random(), Math.random(), Math.random()),
    })
  );

  obj.castShadow = true;
  // obj.position.y = 0.2;

  return obj;
}

export default class Scene {
  _;
  socket;
  users = {};
  observerMoveUpdater;

  constructor(params: any) {
    this.socket = params.socket;

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
      observer: {
        onMove: this.onObserverMove,
      },
      update(time) {
        updaters.forEach(u => u(time));
      },
    });
  }

  onSceneReady = async _ => {
    const ground = await getTerrain();
    const boxes = createBoxes();

    // _.observer.target.material.color = new THREE.Color('#0f0');

    // _.scene.background = new THREE.Color(0xffd700);
    _.scene.fog = new THREE.Fog(colors.fog, 1, 100);

    createSkybox(_);
    _.scene.add(createLight(_));
    _.scene.add(ground);
    _.scene.add(boxes);

    _.camera.position.y = 0.3;
    _.camera.position.z = 0.5;

    // const scale = 10;
    // const upScale = 1 * scale;
    // const downScale = 1 / scale;

    // @ts-ignore
    const color = new URL(window.location).searchParams
      .get('color')
      .split(',')
      .map(n => +n);

    _.observer.object.add(createUser(color));
    _.observer.object.rotation.y = -1.5;
    _.observer.object.position.y = 8;
    _.observer.target.scale.set(0.5, 0.5, 0.5);

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
          this.moveUser(this.users[id], v);
          break;
      }
    });
  }

  onObserverMove = position => {
    this.moveUser(this._.observer.object, position);
    this.socket.emit('user-update', { id: this.socket.id, data: { position } });
  };

  moveUser = (obj, pos) => {
    const startPos = Object.values(obj.position.clone());
    const endPos = Object.values(pos);
    const clear = () => this.removeUpdater(this.observerMoveUpdater);

    clear();
    this.observerMoveUpdater = move(obj, [startPos, endPos], 0.3, clear);

    this.addUpdater(this.observerMoveUpdater);
  };

  removeUser(id) {
    this._.scene.remove(this.users[id]);
    delete this.users[id];
  }

  addUpdater(fn) {
    updaters.push(fn);
  }

  removeUpdater(fn) {
    updaters.splice(updaters.indexOf(fn), 1);
  }
}
