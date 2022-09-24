import {
  Line,
  BufferGeometry,
  LineBasicMaterial,
  CubicBezierCurve3,
} from 'three';

import { getCubicCurve3 } from '../tools/line';

const line = new Line(
  new BufferGeometry(),
  new LineBasicMaterial({ color: 0xff0000 })
);

// @ts-ignore
const curve = new CubicBezierCurve3(...getCubicCurve3([0, 0, 0], [0, 0, 0]));

function update(observer) {
  const v = getCubicCurve3(
    observer.object.position.toArray(),
    observer.target.position.toArray()
  );

  curve.v0 = v[0];
  curve.v1 = v[1];
  curve.v2 = v[2];
  curve.v3 = v[3];

  const points = curve.getPoints(50);

  line.geometry.setFromPoints(points);
}

export default {
  line,
  update,
};
