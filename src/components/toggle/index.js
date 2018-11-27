const Brick = require('../brick');

class Toggle extends Brick {
    constructor(root, coor, types = ['unlit_redstone_torch', 'redstone_torch']) {
        super(root, coor, types[0]);
        this._flag = false;
        this._types = types;

        super.onChanged(_ => this.set(!this._flag));

        this.set(this._flag);
    }

    onChanged(handler) {
        this.handler = handler;
        return this;
    }

    set(flag) {
        this._flag = !!flag;
        this.setType(this._flag ? this._types[1] : this._types[0]);
        this.show();

        if (this.handler) {
            this.handler(this._flag);
        }

        return this;
    }

    get() {
        return this._flag;
    }

    enabled() {
        return this.set(true);
    }

    disabled() {
        return this.set(false);
    }
}

module.exports = Toggle;