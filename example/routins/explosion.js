const v8 = require('v8');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:25566');
const clients = new Set();

ws.on('open', _ => {
    setInterval(_ =>
        clients.forEach(
            clientID => ws.send(
                v8.serialize({
                    clientID,
                    packet: {
                        pid: 60,
                        name: 'explosion',
                        x: 0,
                        y: 20,
                        z: 0,
                        radius: 3,
                        records: [
                            [-1, -1, -1],
                            [0, 0, 0],
                            [1, 1, 1]
                        ],
                        player_motion_x: 0,
                        player_motion_y: 0,
                        player_motion_z: 0
                    }
                })
            )
        ), 500);
});

ws.on('message', message => {
    const {
        direction,
        clientID,
        packet
    } = v8.deserialize(message);
    switch (packet.name) {
        case 'handshake':
            clients.add(clientID);
            break;
        case 'kick':
            clients.delete(clientID);
            break;
    }
});