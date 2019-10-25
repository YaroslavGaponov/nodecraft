const fs = require('fs');
const Game = require('../../index.js');

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

game.createSchematic(__dirname + '/test.schematic', (err, schematic) => {
    if (err) {
        console.log(err);
        return;
    }

    land.loadSchematic(0, 1, 0, schematic);

    console.log('Schematic %s is loaded', schematic.fileName);
    console.log('Size %d x %d x %d', schematic.width, schematic.height, schematic.length);

});

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
            y: 1,
            z: 0
        })
        .player_position_and_look(clientID, {
            x: 0,
            stance: 94.62,
            y: 1,
            z: 0,
            yaw: 0,
            pitch: 0,
            on_ground: 1
        });
})
    .start(25565);
