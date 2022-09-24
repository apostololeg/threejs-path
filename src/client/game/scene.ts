import { Fog, Color, PCFSoftShadowMap, Object3D } from 'three';
import RootThree from 'roothree';

import navigation from './components/navigation';
import createLight from './components/light';
import createGround from './components/ground';
import createTerrain from './components/terrain';
import createSky from './components/sky';
import createUser from './components/user';
import createSkyscrapers from './components/skyscrapers';
import AIBot from './components/ai-bot';

import move from './move';

const sceneSize = 500;
const yOffset = 0.5;
const colors = {
  fog: 0xfdbe6e00,
  skyscrapers: 0x0057b800,
};

export default class Scene {
  _;
  params;
  users = {};
  updaters = [];
  observerMoveUpdater;
  moveTarget;

  constructor(params: any) {
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
        onMove: this.onObserverMove,
        line: navigation.line,
      },
      update: time => {
        this.updaters.forEach(u => u(time));
      },
    });
  }

  onSceneReady = async _ => {
    const ground = createGround({ sceneSize });
    const terrain = await createTerrain();
    const skyscrapers = createSkyscrapers({ sceneSize });

    if (this._.isVRSupported) this._.controllers.primaryIndex = 1;

    // _.observer.target.material.color = new Color('#0f0');

    // _.scene.background = new Color(0xffd700);
    _.scene.fog = new Fog(colors.fog, 1, 100);

    createSky(_);
    _.scene.add(createLight({ sceneSize }));
    _.scene.add(ground);
    _.scene.add(terrain);
    _.scene.add(skyscrapers);

    _.camera.position.y = 0.3;
    _.camera.position.z = 0.5;

    // const scale = 10;
    // const upScale = 1 * scale;
    // const downScale = 1 / scale;

    _.observer.addTeleportTargets([ground, terrain, skyscrapers]);
    _.observer.object.position.y = 10;

    AIBot();
  };

  initObserver({ position, color }) {
    const { object, target } = this._.observer;

    object.add(createUser(color));
    object.position.set(...position);
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
    this.moveUser(this._.observer.object, position);
    this.params.onMove?.(position);
  };

  moveUser = (obj: Object3D, pos) => {
    const startPos = Object.values(obj.position.clone());
    const endPos = Object.values(pos);

    const clear = () => {
      this.removeUpdater(this.observerMoveUpdater);
      this._.scene.remove(this.moveTarget);
    };

    clear();

    if (this.moveTarget) this._.scene.remove(this.moveTarget);
    this.moveTarget = this._.observer.target.clone();
    this._.scene.add(this.moveTarget);

    this.observerMoveUpdater = move(obj, [startPos, endPos], 5, clear);
    this.addUpdater(this.observerMoveUpdater);
  };

  removeUser(id) {
    this._.scene.remove(this.users[id]);
    delete this.users[id];
  }

  addUpdater(fn) {
    this.updaters.push(fn);
  }

  removeUpdater(fn) {
    const index = this.updaters.indexOf(fn);
    if (index > -1) this.updaters.splice(index, 1);
  }
}
