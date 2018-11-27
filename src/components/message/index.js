const Brick = require('../brick');

class Message extends Brick {
    constructor(root, coor, block = 'sign') {
        super(root, coor, block);
    }

    update(clientID, text) {
        text = text.split('\n').map(s => s.trim(s));
        this._root.getServer()
            .update_sign(clientID, {
                x: this.getCoor().x,
                y: this.getCoor().y,
                z: this.getCoor().z,
                text1: text[0] || '',
                text2: text[1] || '',
                text3: text[2] || '',
                text4: text[3] || ''
            });
        return this;
    }
}

module.exports = Message;