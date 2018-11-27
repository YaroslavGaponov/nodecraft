const Brick = require('../brick');

class Message extends Brick {
    constructor(root, coor, type = 'sign') {
        super(root, coor, type);
    }

    update(clientID, text = '') {
        const coor = this.getCoor();
        const type = this._root.getLand().getType(coor.x, coor.y, coor.z);
        if (type === this.getType()) {
            text = text.split('\n').map(s => s.trim(s));
            this._root.getServer()
                .update_sign(clientID, {
                    x: coor.x,
                    y: coor.y,
                    z: coor.z,
                    text1: text[0] || '',
                    text2: text[1] || '',
                    text3: text[2] || '',
                    text4: text[3] || ''
                });
        }
        return this;
    }
}

module.exports = Message;