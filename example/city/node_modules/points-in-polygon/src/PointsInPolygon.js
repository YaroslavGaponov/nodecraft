const earcut = require('earcut');
const pointsInTriangle = require('points-in-triangle');

module.exports = class PointsInPolygon {
  // Process a given polygon and call the callback for each point in it
  // Format: [[[outerX,outerY],...],[[innerX,innerY],...],[[innerX,innerY],...]]
  process(polygon, callback) {
    // Prepare the given polygon points
    let [vertices, holes] = this._preparePolygon(polygon);

    // Triangulate the polygon
    try {
      var triangles = earcut(vertices, holes);
    } catch (e) {
      throw new Error("Triangulation failed: "+e);
    }

    // Process each resulting triangle
    for (let i=0; i<triangles.length; i+=3) {
      let triangle = [0, 1, 2].map(j => this._extractPoint(vertices, triangles[i+j]));
      pointsInTriangle(triangle, callback);
    }
  }

  // Converts given [[[outerX,outerY],...],[[innerX,innerY],...],[[innerX,innerY],...]]
  // polygon input into the input format which earcut expects to receive
  _preparePolygon(polygon) {
    let vertices = [],
        holes = [];

    polygon.every(ring => {
      // Invalid inner polygons are currently gracefully ignored
      // while the outer polygon must be valid
      if (vertices.length) {
        if (ring.length < 3) {
          return true;
        }
        holes.push(vertices.length/2);
      } else if (ring.length < 3) {
        return false;
      }

      ring.forEach(point => vertices.push(point[0], point[1]));
      return true;
    });

    return [vertices, holes];
  }

  // Extracts the corresponding points of the given vertices' point
  _extractPoint(vertices, pointId) {
    return [vertices[pointId*2], vertices[pointId*2+1]];
  }
}
