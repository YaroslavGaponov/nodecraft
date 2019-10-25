const Emitter = require('../utils/emitter');
const Chunk = require('./chunk');
const Block = require('./block');

const DEFAULT_INITIALIZER = chunk => {
    for (let x = 0; x < 16; x++)
        for (let z = 0; z < 16; z++) {
            chunk.setBiome(x, z, 1);
            chunk.setType(x, 0, z, Block.grass);
            for (let y = 0; y < 255; y++) {
                chunk.setLightSky(x, y, z, 15);
            }
        }
};

class Land extends Emitter {
    constructor() {
        super();
        this._map = new Map();
        this._initializer = DEFAULT_INITIALIZER;
    }

    forEachChunk(fn) {
        this._initializer = fn;
        return this;
    }

    getChunk(chunkX, chunkZ) {
        const chunkID = `${chunkX}:${chunkZ}`;
        if (!this._map.has(chunkID)) {
            const chunk = new Chunk();
            this._initializer(chunk);
            this._map.set(chunkID, chunk);
        }
        return this._map.get(chunkID);
    }

    setType(x, y, z, type) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setType(x & 0x0f, y, z & 0x0f, type);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getType(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getType(x & 0x0f, y, z & 0x0f);
    }

    setAddition(x, y, z, type) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setAddition(x & 0x0f, y, z & 0x0f, type);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }


    setLightBlock(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setLightBlock(x & 0x0f, y, z & 0x0f, light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightBlock(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getLightBlock(x & 0x0f, y, z & 0x0f);
    }

    setLightSky(x, y, z, light) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setLightSky(x & 0x0f, y, z & 0x0f, light);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getLightSky(x, y, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getLightSky(x & 0x0f, y, z & 0x0f);
    }


    setBiome(x, z, biome) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        this.getChunk(chunkX, chunkZ).setBiome(x & 0x0f, z & 0x0f, biome);
        this.emit('changed', chunkX, chunkZ);
        return this;
    }

    getBiome(x, z) {
        const chunkX = x >> 4;
        const chunkZ = z >> 4;
        return this.getChunk(chunkX, chunkZ).getBiome(x & 0x0f, z & 0x0f);
    }

    loadSchematic(x, y, z, schematic, merge = true) {
        schematic.load(err => {
            if (err) return;

            for (let dx = 0; dx < schematic.width; dx++) {
                for (let dy = 0; dy < schematic.height; dy++) {
                    for (let dz = 0; dz < schematic.length; dz++) {

                        const blockId = schematic.getBlockId(dx, dy, dz);
                        const meta = schematic.getMeta(dx, dy, dz);

                        if (merge && blockId === 0 && meta === 0) continue;

                        this.setType(x + dx - (schematic.width >> 1), y + dy, z + dz - (schematic.length >> 1), blockId & 0x0f); // fixed for old version of mc client
                        this.setAddition(x + dx - (schematic.width >> 1), y + dy, z + dz - (schematic.length >> 1), meta);

                    }
                }
            }

        });
    }

}

module.exports = Land;