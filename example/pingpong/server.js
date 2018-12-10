const Game = require('../../index.js');

const HEIGHT = 20;
const WIDTH = 20;

const game = new Game();
const land = game.getLand();
const server = game.getServer();


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

for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
        land.setType(x, y, 0, 'wool');
        land.setAddition(x, y, 0, 15); // color black
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

        const init = _ =>
            ({
                dx: 1,
                dy: 1,
                x: Math.floor(Math.random() * HEIGHT),
                y: Math.floor(Math.random() * WIDTH),
                color: Math.floor(Math.random() * 15) + 1
            });

        const p = new Array(5).fill(init).map(fn => fn());

        setInterval(_ => {
            p.forEach(a => {
                land.setAddition(a.x, a.y, 0, 15); // hide
                a.x += a.dx;
                a.y += a.dy;
                if (a.x === 0 || a.x === HEIGHT) {
                    a.dx = -a.dx;
                    a.x += a.dx;
                }
                if (a.y === 0 || a.y === WIDTH) {
                    a.dy = -a.dy;
                    a.y += a.dy;
                }
                land.setAddition(a.x, a.y, 0, a.color); // show
                server.map_chunk(clientID, {
                    x: a.x,
                    z: 0,
                    solid: 1,
                    primary_bitmap: 65535,
                    add_bitmap: 65535,
                    data: land.getChunk(a.x, 0).raw()
                });
            })
        }, 50);

    })
    .start(25565);