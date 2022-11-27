import {
  PerspectiveCamera,
  Fog,
  Color,
  PCFSoftShadowMap,
  Object3D,
  AxesHelper,
  Vector3,
} from 'three';
import RootThree from 'roothree';

import move from '../../move';
import navigation from '../navigation';
import createLight from '../light';
import createTerrain from '../terrain';
import createSky from '../sky';
import createUser from '../user';
// import createSkyscrapers from './components/skyscrapers';
// import AIBot from './components/ai-bot';

import editor, { state } from './editor';

const sceneSize = 500;
const colors = {
  fog: 0xffffff,
  skyscrapers: 0x0057b800,
};

export default class Scene extends EventTarget {
  _;
  params;
  users = {};
  csm;
  updaters = [];
  observerMoveUpdater;
  moveTarget;
  targetPosition: Vector3;
  moveUpdaters = {}; // [userId]: fn
  terrain;

  constructor(params: any) {
    super();

    this.params = params;

    this._ = new RootThree({
      renderer: {
        antialias: true,
        configure: renderer => {
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = PCFSoftShadowMap;
        },
      },
      controllers: true,
      onReady: this.onSceneReady,
      observer: {
        enabled: true, // enable movement by default
        onMove: this.onObserverMove,
        line: navigation.line,
      },
      camera() {
        const camera = new PerspectiveCamera(
          90,
          window.innerWidth / window.innerHeight,
          0.1,
          3000
        );

        camera.position.y = 2;

        return camera;
      },
      update: time => {
        this.updaters.forEach(u => u(time));
      },
    });
  }

  onSceneReady = async _ => {
    // const ground = createGround({ sceneSize });
    // const skyscrapers = createSkyscrapers({ sceneSize });

    this.targetPosition = _.observer.object.position.clone();
    // _.observer.target.castShadow = true;

    // @ts-ignore
    window.observer = _.observer;

    if (this._.isVRSupported) this._.controllers.primaryIndex = 1;

    // _.scene.fog = new Fog(colors.fog, 50, 3000);

    // _.scene.add(new AxesHelper(1000));

    createSky(_);
    createLight(this, sceneSize);
    // _.scene.add(ground);
    // _.scene.add(skyscrapers);

    _.camera.position.y = 0.3;
    _.camera.position.z = 0.1;

    // _.observer.addTeleportTargets([ground, skyscrapers]);
    // _.observer.object.position.y = 10;

    // AIBot();

    editor(this._);
  };

  initObserver({ color, position }) {
    const { object, target } = this._.observer;

    object.add(createUser(color));

    // navigator.geolocation.getCurrentPosition(
    //   async ({ coords: { longitude, latitude } }) => {
    //     this.rebuild(longitude, latitude);
    //   }
    // );
    // -----------------
    // object.position.set(...position);
    this.terrain = createTerrain(this, position);

    target.scale.set(0.5, 0.5, 0.5);
    target.material.color.setHex(object.children[1].material.color.getHex());
    target.material.transparent = true;
    target.material.opacity = 0.5;
    // this.addUpdater(this.updateNavigationGeometry);
  }

  addUser({ id, ...data }) {
    const obj = createUser();

    this.users[id] = obj;
    if (data) this.updateUser(id, data, true);
    this._.scene.add(obj);
  }

  updateUser(id, data, isInitial = false) {
    const obj = this.users[id];

    Object.entries(data).forEach(([key, v]: any) => {
      switch (key) {
        case 'color':
          obj.material.color = new Color(...v);
          break;
        case 'position':
          if (isInitial) obj.position.set(...v);
          else this.moveUser(obj, v);
          break;
      }
    });
  }

  // updateNavigationGeometry = () => {
  //   if (this._.observer.isNavigationGeometryVisible)
  //     navigation.update(this._.observer);
  // };

  onObserverMove = position => {
    this.targetPosition = position;
    this.moveUser(this._.observer.object, position);

    const posWidthOffset = position.clone();
    posWidthOffset.x += this.terrain.offset.x;
    posWidthOffset.z += this.terrain.offset.z;
    this.params.onMove?.(posWidthOffset);
  };

  moveUser(obj: Object3D, pos) {
    const id = obj.uuid;
    const startPos = Object.values(obj.position.clone());
    const endPos = Object.values(pos);

    const clear = () => {
      this.removeUpdater(this.moveUpdaters[id]);
      this._.scene.remove(this.moveTarget);
    };

    clear();

    if (this.moveTarget) this._.scene.remove(this.moveTarget);
    this.moveTarget = this._.observer.target.clone();
    this._.scene.add(this.moveTarget);

    this.moveUpdaters[id] = move(obj, [startPos, endPos], state.speed, clear);
    this.addUpdater(this.moveUpdaters[id]);

    this.dispatchEvent(new Event('user-move'));
  }

  removeUser(id) {
    this._.scene.remove(this.users[id]);
    delete this.users[id];
  }

  addUpdater(fn) {
    this.updaters.push(fn);
  }

  removeUpdater(fn) {
    if (!fn) return;

    const index = this.updaters.indexOf(fn);
    if (index > -1) this.updaters.splice(index, 1);
  }
}
