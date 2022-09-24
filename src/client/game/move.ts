import { CubicBezierCurve3 } from 'three';

import { getCubicCurve3 } from './tools/line';

const getDistance = ([x1, y1, z1], [x2, y2, z2]) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

const getLineLength = points =>
  points.reduce((acc, point, i) => {
    if (i === 0) return acc;
    return acc + getDistance(points[i - 1], point);
  }, 0);

export function getMovingCurve(from, to, length = getLineLength([from, to])) {
  return new CubicBezierCurve3(
    // @ts-ignore
    ...getCubicCurve3(from, to, length / 3)
  );
}

export default function move(obj, [from, to], speed, onComplete) {
  const length = getLineLength([from, to]);
  const curve = getMovingCurve(from, to, length);
  const step = speed / length;
  let progress = 0;

  return () => {
    progress += step;
    if (progress > 1) progress = 1;

    const pos = curve.getPoint(progress);

    obj.position.copy(pos);

    if (progress == 1) onComplete();
  };
}
