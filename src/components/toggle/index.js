const Brick = require('../brick');

class Toggle {
    constructor(root, coor, blocks = ['unlit_redstone_torch', 'redstone_torch']) {
        this._flag = false;

        this._disabled = new Brick(root, coor, blocks[0]);
        this._enabled = new Brick(root, coor, blocks[1]);

        this._handler = null;

        this._disabled.onChanged(_ => {
            this.set(!this._flag);
            if (this._handler) {
                this._handler(this._flag);
            }
        });

        this.set(this._flag);
    }

    onChanged(handler) {
        this._handler = handler;
        return this;
    }


    set(bool) {
        this._flag = !!bool;
        if (this._flag) {
            this._disabled.hide();
            this._enabled.show();
        } else {            
            this._enabled.hide();
            this._disabled.show();
        }
        return this;
    }

    get() {
        return this._flag;
    }

}

module.exports = Toggle;