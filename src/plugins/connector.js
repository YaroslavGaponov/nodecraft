const v8 = require('v8');
const WebSocket = require('ws');

module.exports = options => root => {

    const server = root.getServer();

    const wss = new WebSocket.Server(options);

    wss.on('connection', ws => {
        server.on('packet:*', (clientID, packet, direction) => ws.send(v8.serialize({
            direction,
            clientID,
            packet
        })));
        ws.on('message', message => {
            const {
                clientID,
                packet
            } = v8.deserialize(message);
            server.send(clientID, packet);
        });
    });

};