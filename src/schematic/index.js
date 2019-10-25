const fs = require('fs');
const nbt = require('nbt-reader');

class Schematic {

    constructor(fileName) {
        this.fileName = fileName;
        this.data = null;
    }

    load(callback) {

        if (this.data) {
            return callback();
        }

        nbt.read(fs.readFileSync(this.fileName), (err, data) => {
            if (err) {
                return callback(err);
            }

            this.data = data;

            this.width = data.value.Width.value;
            this.height = data.value.Height.value;
            this.length = data.value.Length.value;

            this.blocks = data.value.Blocks.value;
            this.meta = data.value.Data.value;

            return callback();
        });
    }

    _getOffet(x, y, z) {
        return (y * this.length + z) * this.width + x;
    }
    getBlockId(x, y, z) {
        return this.blocks[this._getOffet(x, y, z)].value;
    }

    getMeta(x, y, z) {
        return this.meta[this._getOffet(x, y, z)].value;
    }

}

module.exports = Schematic;