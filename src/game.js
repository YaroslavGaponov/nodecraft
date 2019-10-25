const Emitter = require('./utils/emitter');
const Server = require('./server');
const Parser = require('./parser');
const Plugin = require('./plugins');
const Land = require('./land');
const Schematic = require('./schematic');

class Game extends Emitter {

    constructor(options = {}) {
        super();

        this._server = new Server(Parser);
        this._server.on('start', _ => this.emit('plugin:start'));
        this._server.on('stop', _ => this.emit('plugin:stop'));

        this._land = new Land();

        this
            .use(Plugin.keepalive)
            .use(Plugin.chat)
            .use(Plugin.time)
            .use(Plugin.land(options.DISTANCE))
            .use(Plugin.gateway({port:25566}))
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
        return this;
    }

    stop() {
        this.getServer().stop();
        return this;
    }

    createSchematic(fileName, callback) {
        const s =  new Schematic(fileName);
        s.load(err => {
            if (err) callback(err);
            else callback(null, s);
        });
    }
}

module.exports = Game;