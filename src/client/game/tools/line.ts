import { Vector3 } from 'three';

export const getDistance = ([x1, y1, z1], [x2, y2, z2]) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

export const getLineLength = points =>
  points.reduce((acc, point, i) => {
    if (i === 0) return acc;
    return acc + getDistance(points[i - 1], point);
  }, 0);

export const getMiddlePoint = (first, last) => first + (last - first) / 2;

export const getMiddleVector = (
  [x0, y0, z0],
  [x1, y1, z1],
  [offsetX = 0, offsetY = 0, offsetZ = 0] = []
) =>
  new Vector3(
    getMiddlePoint(x0, x1) + offsetX,
    getMiddlePoint(y0, y1) + offsetY,
    getMiddlePoint(z0, z1) + offsetZ
  );

export function getCubicCurve3([x0, y0, z0], [x1, y1, z1], _zOffset = 1) {
  const offsetY = (Math.max(z0, z1) - Math.min(z0, z1)) / 2;

  return [
    new Vector3(x0, y0, z0),
    getMiddleVector([x0, y0, z0], [x1, y1, z1], [0, offsetY, 0]),
    getMiddleVector([x0, y0, z0], [x1, y1, z1], [0, offsetY, 0]),
    new Vector3(x1, y1, z1),
  ];
}
