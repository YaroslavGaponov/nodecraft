const net = require('net');
const EventEmmiter = require('events').EventEmitter;

class Server extends EventEmmiter {
    constructor(parser) {
        super();

        this._parser = parser;

        for (let name in this._parser.PIDS) {
            const p = this._parser.PIDS[name];
            if (p.direction === 'server_to_client' || p.direction === 'both') {
                this[name] = (clientID, packet) => {
                    packet.pid = p.pid;
                    this.send(clientID, packet);
                    this.emit('packet:' + p.name, clientID, packet, 'server_to_client');
                    return this;
                };
            }
        }

        this._clients = new Map();

        this._server = net.createServer(client => {

            let chunks = [];

            const clientID = Math.random().toString(36).slice(2);

            this._clients.set(clientID, client);
            this.emit('client:join', clientID);

            client
                .on('data', chunk => {
                    chunks.push(chunk);
                    try {
                        let packet = this._parser.unpack(Buffer.concat(chunks));
                        chunks = [];
                        this.emit('packet:' + packet.name, clientID, packet, 'client_to_server');
                    } catch (ex) {
                        this.emit('error', ex);
                    }
                })
                .on('end', _ => {
                    this.emit('client:leave', clientID);
                    this._clients.delete(clientID);
                })
                .on('error', err => this.emit('error', err));
        });
    }

    start(port = 25565, host = '0.0.0.0') {
        this.emit('start');
        this._server.listen(port, host);
        return this;
    }

    stop() {
        this.emit('stop');
        this._server.stop();
        return this;
    }

    send(clientID, packet) {
        if (this._clients.has(clientID)) {
            this._clients.get(clientID).write(this._parser.pack(packet));
        }
        return this;
    }
}

module.exports = Server;