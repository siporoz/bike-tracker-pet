export function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Радиус Земли в километрах
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);

  // eslint-disable-next-line max-len, no-multi-spaces, operator-linebreak
  const a =
    // eslint-disable-next-line operator-linebreak
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    // eslint-disable-next-line operator-linebreak
    Math.cos(this.toRad(lat1)) *
      // eslint-disable-next-line operator-linebreak
      Math.cos(this.toRad(lat2)) *
      // eslint-disable-next-line operator-linebreak
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function totalDistance(points) {
  let total = 0;

  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    total += this.distance(prev[0], prev[1], curr[0], curr[1]);
  }

  return total;
}
