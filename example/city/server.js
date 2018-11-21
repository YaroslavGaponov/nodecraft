const NodeCraft = require('../../index.js');
const pointsInPolygon = require('points-in-polygon');

const game = new NodeCraft();

// build city
function convert([lat, lon]) {
    const MAP_WIDTH = 40075.017 * 500;
    const MAP_HEIGHT = 40007.86 * 500;
    const y = ((-1 * lat) + 90) * (MAP_HEIGHT / 180);
    const x = (lon + 180) * (MAP_WIDTH / 360);
    return [Math.round(x), Math.round(y)];
}

const features = require(__dirname + '/city.json').features;
for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;
    const properties = features[i].properties;
    switch (geometry.type) {
        case 'Polygon':
            pointsInPolygon(
                geometry.coordinates.map(e => e.map(convert)),
                (x, z) => {
                    for (let y = 1; y < properties.height; y++) {
                        game.getLand().setType(x, y, z, properties.type);
                        game.getLand().setLightBlock(x, y, z, 15);
                    }
                });
            break;
    }
}

game.on('packet:handshake', (clientID, packet) => {
        console.log(`Hi, ${packet.username}`);
        const [x, z] = convert([-81.0923011, 32.0783472]);
        with(game.getServer()) {
            login(clientID, {
                eid: 0,
                level_type: 'flat',
                game_mode: 1,
                dimension: 0,
                difficalty: 0,
                magic: 0,
                max_player: 25
            });
            spawn_position(clientID, {
                x,
                y: 30,
                z
            });
            player_position_and_look(clientID, {
                x,
                stance: 94.62,
                y: 30,
                z,
                yaw: 0,
                pitch: 0,
                on_ground: 1
            });
        }
    })
    .start(25565);