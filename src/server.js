const events = require('events');
const net = require('net');

const Parser = require('./parser');

const PING_TIMEOUT = 1000;

class Server extends events.EventEmitter {
    constructor(port, host) {
        super();

        this._port = port || 25565;
        this._host = host || '0.0.0.0';

        this._clients = new Map();

        this._server = net.createServer(client => {
            const clientID = Math.random().toString(36).slice(2);
            this._clients.set(clientID, client);
            this.emit('client:join', clientID);
            let timerId = setInterval(_ => this.send(clientID, {
                pid: Parser.PIDS.keepalive,
                token: 0
            }), PING_TIMEOUT);
            client
                .on('data', chunk => {
                    const message = Parser.unpack(chunk);
                    console.log(message.packet);
                    this.emit('packet:' + message.name, clientID, message.packet);
                })
                .on('end', _ => {
                    clearInterval(timerId);
                    this._clients.delete(clientID);
                    this.emit('client:leave', clientID);
                });
        });
    }

    start() {
        this._server.listen(this._port, this._host);
        return this;
    }

    stop() {
        this._server.stop();
        return this;
    }

    send(clientID, packet) {
        this._clients.get(clientID).write(Parser.pack(packet));
        return this;
    }
}

module.exports = Server;