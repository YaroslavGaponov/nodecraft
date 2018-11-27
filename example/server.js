const fs = require('fs');
const {
    Game,
    Components
} = require('../index.js');

const game = new Game();
const land = game.getLand();
const server = game.getServer();

// initialize chunks
land.forEachChunk(chunk => {
    for (let x = 0; x < 16; x++)
        for (let z = 0; z < 16; z++) {
            chunk.setBiome(x, z, 'desert');
            chunk.setType(x, 0, z, 'grass');
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
    
const px = banner.length >>> 1;
const pz = banner[0].length >>> 1;
for (let x = 0; x < banner.length; x++) {
    for (let z = 0; z < banner[x].length; z++) {
        if (banner[x][z] === '#') {
            land.setType(x - px, 1, z - pz, 'brick_block');
            land.setType(x - px, 2, z - pz, 'brick_block');
            land.setLightBlock(x - px, 1, z - pz, 15);
            land.setLightBlock(x - px, 2, z - pz, 15);
        }
    }
}

// create toggle
const toggle = new Components.toggle(game, {
    x: 5,
    y: 1,
    z: 5
});
toggle
    .set(false)
    .onChanged(flag => console.log(`Flag is ${flag}`));


// create message
const message = new Components.message(game, {
    x: 5,
    y: 1,
    z: 1
});
message.show();

game.on('packet:handshake', (clientID, packet) => {
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

        setInterval(_ =>
            message.update(clientID,
                `Hello
                ${packet.username}
                Time:
                ${new Date().toLocaleTimeString()}`
            ), 1000);
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