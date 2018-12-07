const events = require('events');

class Emitter extends events.EventEmitter {
    constructor(options) {
        super(options);
        this._eventNames = new Map();
    }

    on(eventName, ...args) {
        this._eventNames.set(eventName, new RegExp(eventName));
        return super.on(...[eventName, ...args]);
    }

    once(eventName, ...args) {
        this._eventNames.set(eventName, new RegExp(eventName));
        return super.once(...[eventName, ...args]);
    }

    emit(eventName, ...args) {
        this._eventNames.forEach((re, name) => {
            if (re.test(eventName)) {
                super.emit(...[name, ...args]);
            }
        });
        return this;
    }
}

module.exports = Emitter;