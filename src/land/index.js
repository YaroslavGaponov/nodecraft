const Chunk = require('./chunk');

class Land {
    constructor() {
        this._map = new Map();
    }

    get(x, z) {
        const id = `${x}:${z}`;
        if (!this._map.has(id)) {
            this._map.set(id, new Chunk());
        }
        return this._map.get(id);
    }
}

module.exports = Land;