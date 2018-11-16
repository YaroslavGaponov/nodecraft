Nodecraft
======================================
Node.JS Minecraft server 

# Start demo server
```sh
npm run demo
```

![nodecraft](https://raw.githubusercontent.com/YaroslavGaponov/nodecraft/master/images/nodecraft.jpg "nodecraft")


# Simple server
```js
const {
    Server,
    Chunk,
    PIDS
} = require('../index.js');

const users = new Map();
let timerId;

const server = new Server(25565);
server

    .on('client:leave', clientID => {
        clearInterval(timerId);
        users.delete(clientID);
    })

    .on('packet:chat_message', (clientID, packet) => {
        [...users.keys()]
        .filter(e => e != clientID)
            .forEach(e => server.send(e, {
                pid: PIDS.chat_message,
                message: users.get(clientID) + '> ' + packet.message
            }));
    })

    .on('packet:handshake', (clientID, packet) => {

        [...users.keys()]
        .forEach(e => server.send(e, {
            pid: PIDS.chat_message,
            message: `New user ${packet.username}!`
        }));

        server.send(clientID, {
            pid: PIDS.chat_message,
            message: `Hi, ${packet.username}!`
        });

        users.set(clientID, packet.username);

        server
            .send(clientID, {
                pid: PIDS.login,
                eid: 0,
                level_type: 'flat',
                game_mode: 1,
                dimension: 0,
                difficalty: 0,
                magic: 0,
                max_player: 25
            })
            .send(clientID, {
                pid: PIDS.spawn_position,
                x: 0,
                y: 30,
                z: 0
            })
            .send(clientID, {
                pid: PIDS.player_position_and_look,
                x: 0,
                stance: 94.62,
                y: 30,
                z: 0,
                yaw: 0,
                pitch: 0,
                on_ground: 1
            });


        for (let x = -7; x <= 7; x++) {
            for (let z = -7; z <= 7; z++) {
                const chunk = new Chunk();
                server.send(clientID, {
                    pid: PIDS.map_chunk,
                    x,
                    z,
                    solid: 1,
                    primary_bitmap: 65535,
                    add_bitmap: 65535,
                    data: chunk.raw()
                });
            }
        }

        timerId = setInterval(_ =>
            server.send(clientID, {
                pid: PIDS.explosion,
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
                player_motion_z: 0,
            }), 1000);

    })

    .on('packet:kick', (clientID, packet) => {
        console.log(`See you, ${users.get(clientID)}! ${packet.reason}!`);
    })

    .start();
```