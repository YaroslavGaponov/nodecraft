const pointsInPolygon = require('../');

pointsInPolygon([
  [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10]
  ],
  [
    [2, 2],
    [8, 2],
    [8, 8],
    [2, 8]
  ],
], (x, y) => console.log(x, y));
