const Server = require('./server');
const Parser = require('./parser');
const Plugin = require('./plugins');
const Land = require('./land');

class Game {

    constructor(options = {}) {
        this._server = new Server(Parser);
        this._land = new Land();

        this._server
            .use(Plugin.keepalive)
            .use(Plugin.chat)
            .use(Plugin.ping({
                PROTOCOL: Parser.PROTOCOL,
                VERSION: Parser.VERSION,
                USERS: options.USERS || Number.MAX_SAFE_INTEGER
            }));
    }

    start(port, host) {
        this._server.start(port, host);
        return this;
    }

    use(plugin) {
        this._server.use(plugin);
        return this;
    }

    stop() {
        this._server.stop();
        return this;
    }

    getLand(x, z) {
        return this._land.get(x, z);
    }
}

module.exports = Game;