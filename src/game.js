const Server = require('./server');
const Parser = require('./parser');
const Plugin = require('./plugins');
const Land = require('./land');

class Game extends Server {

    constructor(options = {}) {
        super(Parser);

        this._land = new Land();

        this
            .use(Plugin.keepalive)
            .use(Plugin.chat)
            .use(Plugin.ping({
                PROTOCOL: Parser.PROTOCOL,
                VERSION: Parser.VERSION,
                USERS: options.USERS || 20
            }));
    }

    getLand(x, z) {
        return this._land.get(x, z);
    }
}

module.exports = Game;