const {
    Server,
    Chunk,
    PIDS
} = require('../index.js');

const users = new Map();

var server = new Server(25565);
server
    .on('client:join', clientID => console.log(`client:join ${clientID}`))
    .on('client:leave', clientID => console.log(`client:leave ${clientID}`))
    .on('packet:chat_message', (clientID, packet) => console.log(`chat: ${users.get(clientID)}> ${packet.message}`))
    .on('packet:handshake', (clientID, packet) => {
        console.log(`Hi user <${packet.username}>!`);
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

        setInterval(_ =>
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
    .on('packet:kick', (clientId, packet) => {
        console.log(`Bye user <${users.get(clientId)}>!`);
        console.log(`Reason: ${packet.reason}`);
        users.delete(clientId);
    })
    .start();