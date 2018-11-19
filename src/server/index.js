const events = require('events');
const net = require('net');

class Server extends events.EventEmitter {
    constructor(parser) {
        super();

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
            this.emit('client:join', clientID);

            client
                .on('data', chunk => {
                    chunks.push(chunk);
                    const result = this._parser.unpack(Buffer.concat(chunks));
                    chunks = result.tail.length > 0 ? [result.tail] : [];
                    result.messages.forEach(message => {
                        this.emit('packet:' + message.name, clientID, message.packet);
                    });
                })
                .on('end', _ => {
                    this.emit('client:leave', clientID);
                    this._clients.delete(clientID);
                })
                .on('error', err => {
                    console.log(err);
                });
        });
    }

    start(port = 25565, host = '0.0.0.0') {
        this._server.listen(port, host, _ => this.emit('plugin:start'));
        return this;
    }

    stop() {
        this.emit('plugin:stop');
        this._server.stop();
        return this;
    }

    use(plugin) {
        plugin(this);
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