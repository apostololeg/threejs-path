const getDistance = ([x1, y1, z1], [x2, y2, z2]) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

const getLineLength = points =>
  points.reduce((acc, point, i) => {
    if (i === 0) return acc;
    return acc + getDistance(points[i - 1], point);
  }, 0);

function getCubicCurve3([x0, y0, z0], [x2, y2, z2], zOffset = 1) {
  const getMiddlePoint = (first, last) => {
    return first + (last - first) / 2;
  };

  return [
    new THREE.Vector3(x0, y0, z0),
    new THREE.Vector3(
      getMiddlePoint(x0, x2),
      getMiddlePoint(y0, y2) + zOffset,
      getMiddlePoint(z0, z2)
    ),
    new THREE.Vector3(
      getMiddlePoint(x0, x2),
      getMiddlePoint(y0, y2) + zOffset,
      getMiddlePoint(z0, z2)
    ),
    new THREE.Vector3(x2, y2, z2),
  ];
}

export default function move(obj, points, speed, onComplete) {
  const length = getLineLength(points);
  const step = speed / length;
  const offset = length / 3;
  const curve = new THREE.CubicBezierCurve3(
    // @ts-ignore
    ...getCubicCurve3(points[0], points[1], offset)
  );
  let progress = 0;

  return time => {
    progress += step;
    if (progress > 1) progress = 1;

    const pos = curve.getPoint(progress);

    obj.position.copy(pos);

    if (progress == 1) onComplete();
  };
}
