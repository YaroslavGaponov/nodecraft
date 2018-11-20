class Chunk {
    constructor() {
        this._block = Buffer.alloc(196864, 0);
    }

    setType(x, y, z, type) {
        this._block[x + (z << 4) + (y << 8)] = type;
    }

    setLightSky(x, y, z, light) {
        const index = 131072 + Math.floor((x + (z << 4) + (y << 8)) / 2);
        if (x % 2) {
            this._block[index] &= 0xf0;
            this._block[index] |= (light & 0x0f);
        } else {
            this._block[index] &= 0x0f;
            this._block[index] |= (light << 4) & 0xf0;
        }
    }

    setLightBlock(x, y, z, light) {
        const index = 98304 + Math.floor((x + (z << 4) + (y << 8)) / 2);

        if (x % 2) {
            this._block[index] &= 0xf0;
            this._block[index] |= (light & 0x0f);
        } else {
            this._block[index] &= 0x0f;
            this._block[index] |= (light << 4) & 0xf0;
        }
    }

    raw() {
        return this._block;
    }

}

module.exports = Chunk;