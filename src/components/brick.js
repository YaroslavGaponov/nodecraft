const AIR = 'air';

class Brick {
    constructor(root, coor, type, light = 15) {
        this._root = root;
        this._coor = coor;
        this._type = type;
        this._light = light;
        this._handler = null;

        const handler = (clientID, packet) => {
            if (packet.x === this._coor.x && packet.y === this._coor.y && packet.z === this._coor.z) {
                const type = this._root.getLand().getType(this._coor.x, this._coor.y, this._coor.z);
                if (this._type === type) {
                    if (this._handler) {
                        this._handler(this);
                    }
                }
            }
        };

        this._root.getServer().on('packet:player_block_placement', handler);
    }

    getType() {
        return this._type;
    }

    setType(type) {
        this._type = type;
        return this;
    }

    getCoor() {
        return this._coor;
    }

    onChanged(handler) {
        this._handler = handler;
        return this;
    }

    show() {
        this._root.getLand().setType(this._coor.x, this._coor.y, this._coor.z, this._type);
        this._root.getLand().setLightBlock(this._coor.x, this._coor.y, this._coor.z, this._light);
        return this;
    }

    hide() {
        this._root.getLand().setType(this._coor.x, this._coor.y, this._coor.z, AIR);
        return this;
    }
}

module.exports = Brick;