const Chunk = require('./chunk');
const Block = require('./block');

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
                    chunk.setType(x, 0, z, Block.grass);
                    for (let y = 1; y < 255; y++) {
                        chunk.setLightSky(x, y, z, 15); 
                    }
                }
            this._map.set(chunkID, chunk);
        }
        return this._map.get(chunkID);
    }

    setType(x, y, z, type) {
        type = isNaN(type) ? Block[type] : +type;
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setType(x & 0x0f, y, z & 0x0f, type);
        this._events.emit('land:changed', chunkX, chunkZ);
        return this;
    }

    setLightBlock(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setLightBlock(x & 0x0f, y, z & 0x0f, light);
        this._events.emit('land:changed', chunkX, chunkZ);
        return this;
    }

    setLightSky(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setLightSky(x & 0x0f, y, z & 0x0f, light);
        this._events.emit('land:changed', chunkX, chunkZ);
        return this;
    }
}

module.exports = Land;