const fs = require('fs');
const Game = require('../index.js');

const game = new Game();
const land = game.getLand();
const server = game.getServer();

// initialize chunks
land.forEachChunk(chunk => {
    for (let x = 0; x < 16; x++)
        for (let z = 0; z < 16; z++) {
            chunk.setType(x, 0, z, 'grass');
            chunk.setBiome(x, z, 'desert');
            for (let y = 0; y < 255; y++) {
                chunk.setLightSky(x, y, z, 15);
            }
        }
});

//  init banner
const banner = fs.readFileSync(__dirname + '/banner.txt')
    .toString()
    .split('\n')
    .filter(Boolean);

for (let x = 0; x < banner.length; x++) {
    for (let z = 0; z < banner[x].length; z++) {
        if (banner[x][z] === '#') {
            land.setType(x, 1, z, 'brick_block');
            land.setLightBlock(x, 1, z, 15);
            land.setLightBlock(x, 2, z, 15);
        }
    }
}

server.on('packet:handshake', clientID => {
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
    })
    .start(25565);