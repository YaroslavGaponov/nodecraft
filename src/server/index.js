const net = require('net');
const stream = require('stream');
const EventEmmiter = require('events').EventEmitter;

class Server extends EventEmmiter {
    constructor(parser) {
        super();

        this._clients = new Map();

        for (let name in parser.PIDS) {
            const p = parser.PIDS[name];
            if (p.direction === 'server_to_client' || p.direction === 'both') {
                this[name] = (clientID, packet) => {
                    packet.pid = p.pid;
                    this.send(clientID, packet);
                    this.emit('packet:' + p.name, clientID, packet, 'server_to_client');
                    return this;
                };
            }
        }

        this._server = net.createServer(client => {
            const clientID = Math.random().toString(36).slice(2);

            const packer = new parser.Pack();
            packer.pipe(client);
            this._clients.set(clientID, packer);

            this.emit('client:join', clientID);

            const crier = new stream.Writable({
                objectMode: true,
                write: (packet, encoding, callback) => {
                    this.emit('packet:' + packet.name, clientID, packet, 'client_to_server');
                    return callback();
                },
                final: callback => {
                    this.emit('client:leave', clientID);
                    return callback();
                }
            });

            client
                .pipe(new parser.Unpack())
                .pipe(crier)
                .on('end', _ => this._clients.delete(clientID));
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
            this._clients.get(clientID).write(packet);
        }
        return this;
    }
}

module.exports = Server;