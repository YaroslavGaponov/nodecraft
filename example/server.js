const NodeCraft = require('../index.js');

const server = new NodeCraft();

server.on('packet:handshake', (clientID, packet) => {
        console.log(`Hi, ${packet.username}`);

        server
            .login(clientID, {
                eid: 0,
                level_type: 'flat',
                game_mode: 1,
                dimension: 0,
                difficalty: 0,
                magic: 0,
                max_player: 25
            })
            .spawn_position(clientID, {
                x: 0,
                y: 30,
                z: 0
            })
            .player_position_and_look(clientID, {
                x: 0,
                stance: 94.62,
                y: 30,
                z: 0,
                yaw: 0,
                pitch: 0,
                on_ground: 1
            });


        for (let x = -10; x <= 10; x++) {
            for (let z = -10; z <= 10; z++) {
                server.map_chunk(clientID, {
                    x,
                    z,
                    solid: 1,
                    primary_bitmap: 65535,
                    add_bitmap: 65535,
                    data: server.getLand(x, z).raw()
                });
            }
        }
    })
    .on('packet:keepalive', clientID =>
        server.explosion(clientID, {
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
        })
    )
    .start(25565);