const net = require('net');

class Server {
    constructor(parser, events) {

        this._events = events;
        this._parser = parser;

        for (let name in this._parser.PIDS) {
            const p = this._parser.PIDS[name];
            if (p.direction === 'server_to_client' || p.direction === 'both') {
                this[name] = (clientID, packet) => {
                    packet.pid = p.pid;
                    this.send(clientID, packet);
                    return this;
                };
            }
        }

        this._clients = new Map();

        this._server = net.createServer(client => {

            let chunks = [];

            const clientID = Math.random().toString(36).slice(2);

            this._clients.set(clientID, client);
            this._events.emit('client:join', clientID);

            client
                .on('data', chunk => {
                    chunks.push(chunk);
                    try {
                        let packet = this._parser.unpack(Buffer.concat(chunks));
                        chunks = [];
                        this._events.emit('packet:' + packet.name, clientID, packet);
                    } catch (ex) {
                        this._events.emit('error', ex);
                    }
                })
                .on('end', _ => {
                    this._events.emit('client:leave', clientID);
                    this._clients.delete(clientID);
                })
                .on('error', err => this._events.emit('error', err));
        });
    }

    start(port = 25565, host = '0.0.0.0') {
        this._events.emit('plugin:start')
        this._server.listen(port, host);
        return this;
    }

    stop() {
        this._events.emit('plugin:stop');
        this._server.stop();
        return this;
    }

    send(clientID, packet) {
        if (this._clients.has(clientID)) {
            this._clients
                .get(clientID)
                .write(
                    this._parser.pack(packet)
                );
        }
        return this;
    }
}

module.exports = Server;