const events = require('events');
const Chunk = require('./chunk');

class Land {
    constructor(events) {
        this._events = events;
        this._map = new Map();
    }

    getChunk(chunkX, chunkZ) {
        const chunkID = `${chunkX}:${chunkZ}`;
        if (!this._map.has(chunkID)) {
            const chunk = new Chunk();
            for (let x = 0; x < 16; x++)
                for (let z = 0; z < 16; z++) {
                    chunk.setType(x, 0, z, 3);
                    for (let y = 1; y < 255; y++) {
                        chunk.setLightSky(x, y, z, 15);
                    }
                }
            this._map.set(chunkID, chunk);
        }
        return this._map.get(chunkID);
    }

    setType(x, y, z, type) {
        this.getChunk(x >> 4, z >> 4).setType(x & 0x0f, y, z & 0x0f, type);
        return this;
    }

    setLightBlock(x, y, z, light) {
        this.getChunk(x >> 4, z >> 4).setLightBlock(x & 0x0f, y, z & 0x0f, light);
        return this;
    }

    setLightSky(x, y, z, light) {
        this.getChunk(x >> 4, z >> 4).setLightSky(x & 0x0f, y, z & 0x0f, light);
        return this;
    }
}

module.exports = Land;