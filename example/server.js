const fs = require('fs');
const NodeCraft = require('../index.js');

const game = new NodeCraft();

// init world land
for (let x = -160; x < 160; x++)
    for (let z = -160; z < 160; z++) {
        game.getLand().setType(x, 0, z, 1);
        for (let y = 0; y < 255; y++) {
            game.getLand().setLightSky(x, y, z, 15);
        }
    }


//  init banner
const banner = fs.readFileSync(__dirname + '/banner.txt').toString().split('\n').filter(Boolean);
const px = banner.length >>> 1;
const pz = banner[0].length >>> 1;
for (let x = 0; x < banner.length; x++) {
    for (let z = 0; z < banner[x].length; z++) {
        if (banner[x][z] === '#') {
            game.getLand().setType(x - px, 1, z - pz, 3);
            game.getLand().setType(x - px, 2, z - pz, 3);
            game.getLand().setLightBlock(x - px, 1, z - pz, 15);
            game.getLand().setLightBlock(x - px, 2, z - pz, 15);
        }
    }
}

game.on('packet:handshake', (clientID, packet) => {
        console.log(`Hi, ${packet.username}`);

        game.getServer()
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

        game.getLand().updateAll(clientID);
    })
    .on('packet:keepalive', clientID =>
        game.getServer().explosion(clientID, {
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