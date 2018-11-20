const EventEmmiter = require('events').EventEmitter;
const Server = require('./server');
const Parser = require('./parser');
const Plugin = require('./plugins');
const Land = require('./land');

class Game extends EventEmmiter {

    constructor(options = {}) {
        super();

        this._server = new Server(Parser, this);
        this._land = new Land(this);

        this
            .use(Plugin.keepalive)
            .use(Plugin.chat)
            .use(Plugin.time)
            .use(Plugin.land)
            .use(Plugin.ping({
                PROTOCOL: Parser.PROTOCOL,
                VERSION: Parser.VERSION,
                USERS: options.USERS || 20
            }));
    }

    use(plugin) {
        plugin(this);
        return this;
    }

    getServer() {
        return this._server;
    }

    getLand() {
        return this._land;
    }
    start(port, host) {
        this.getServer().start(port, host);
    }

    stop() {
        this.getServer().stop();
    }
}

module.exports = Game;