const v8 = require('v8');
const WebSocket = require('ws');

const URL = 'ws://localhost:25566';

function connect(url) {
    return new Promise(resolve => {
        const ws = new WebSocket(url);
        ws
            .on('open', _ => resolve(ws))
            .on('error', _ => setTimeout(_ => connect(url), 1000));
    });
}

connect(URL)
    .then(ws => {
        ws.on('message', message => {
            const {clientID,packet,direction} = v8.deserialize(message);
            if (packet.name === 'keepalive') {
                ws.send(
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
                );
            }
        });
    });
