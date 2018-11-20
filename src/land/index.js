const events = require('events');
const Chunk = require('./chunk');

class Land {
    constructor(eventEmmiter) {
        this._eventEmmiter = eventEmmiter;
        this._map = new Map();
    }

    getChunk(chunkX, chunkZ) {
        const chunkID = `${chunkX}:${chunkZ}`;
        if (!this._map.has(chunkID)) {
            this._map.set(chunkID, new Chunk());
        }
        return this._map.get(chunkID);
    }

    updateAll(clientID) {
        for (let id of this._map.keys()) {
            let [x, z] = id.split(':').map(e => parseInt(e));
            this._eventEmmiter.emit('land:update', {
                clientID,
                x,
                z
            });
        }
        return this;
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