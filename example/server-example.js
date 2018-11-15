const {
    Pid,
    Server,
    Chunk
} = require('../index.js');

var server = new Server(25565);
server
    .on('client:join', clientID => console.log(`client:join ${clientID}`))
    .on('client:leave', clientID => console.log(`client:leave ${clientID}`))
    .on('packet:handshake', (clientID, packet) => {
        console.log(packet);
        server
            .send(clientID, {
                pid: Pid.login,
                eid: 0,
                level_type: 'flat',
                game_mode: 1,
                dimension: 0,
                difficalty: 0,
                magic: 0,
                max_player: 25
            })
            .send(clientID, {
                pid: Pid.spawn_position,
                x: 0,
                y: 30,
                z: 0
            })
            .send(clientID, {
                pid: Pid.player_position_and_look,
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
                    pid: Pid.map_chunk,
                    x,
                    z,
                    solid: 1,
                    primary_bitmap: 65535,
                    add_bitmap: 65535,
                    data: chunk.buffer()
                });
            }
        }

    })
    .start();