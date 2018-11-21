const pointsInPolygon = require('../');

pointsInPolygon([
  [
    [0, 0],
    [3, 0],
    [3, 3],
    [0, 3]
  ]
], (x, y) => console.log(x, y));
