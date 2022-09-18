import { Vector3 } from 'three';

export const getDistance = ([x1, y1, z1], [x2, y2, z2]) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

export const getLineLength = points =>
  points.reduce((acc, point, i) => {
    if (i === 0) return acc;
    return acc + getDistance(points[i - 1], point);
  }, 0);

export const getMiddlePoint = (first, last) => first + (last - first) / 2;

export function getCubicCurve3([x0, y0, z0], [x1, y1, z1], zOffset = 1) {
  return [
    new Vector3(x0, y0, z0),
    new Vector3(
      getMiddlePoint(x0, x1),
      getMiddlePoint(y0, y1) + zOffset,
      getMiddlePoint(z0, z1)
    ),
    new Vector3(
      getMiddlePoint(x0, x1),
      getMiddlePoint(y0, y1) + zOffset,
      getMiddlePoint(z0, z1)
    ),
    new Vector3(x1, y1, z1),
  ];
}
