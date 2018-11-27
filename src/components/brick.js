class Brick {
    constructor(root, coor, block) {
        this._root = root;
        this._coor = coor;
        this._block = block;
        this._handler = null;

        this._root.on('packet:player_block_placement', (clientID, packet) => {
            if (packet.x === this._coor.x && packet.y === this._coor.y && packet.z === this._coor.z) {
                if (this._handler) {
                    this._handler(this);
                }
            }
        });

    }

    getCoor() {
        return this._coor;
    }
    
    onChanged(handler) {
        this._handler = handler;
        return this;
    }

    show() {
        this._root.getLand().setType(this._coor.x, this._coor.y, this._coor.z, this._block);
        return this;
    }

    hide() {
        this._root.getLand().setType(this._coor.x, this._coor.y, this._coor.z, 'air');
        return this;
    }
}

module.exports = Brick;