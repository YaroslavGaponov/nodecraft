class Chunk {
    constructor() {
        this._block = Buffer.alloc(196864, 0);

        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                this.setType(x, 0, z, 1);
                for (let y = 0; y < 256; y++) {
                    if (y === 1) {
                        if (Math.random() > 0.9) {
                            this.setType(x, 1, z, 7);
                            this.setType(x, 2, z, 7);
                        }
                    }
                    this.setLightBlock(x, y, z, 15);
                    this.setLightSky(x, y, z, 15);
                }
            }
        }

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