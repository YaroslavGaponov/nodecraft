module.exports = distance => root => {
    distance = distance || 5;

    const server = root.getServer();
    const land = root.getLand();

    const clients = new Map();

    server
        .on('packet:player_position', (clientID, packet) => {
            const chunkX = packet.x >> 4;
            const chunkZ = packet.z >> 4;
            for (let x = chunkX - distance; x < chunkX + distance; x++) {
                for (let z = chunkZ - distance; z < chunkZ + distance; z++) {
                    const chunkId = `${x}:${z}`;
                    if (!clients.get(clientID).has(chunkId)) {
                        clients.get(clientID).add(chunkId)
                        server.map_chunk(clientID, {
                            x: x,
                            z: z,
                            solid: 1,
                            primary_bitmap: 65535,
                            add_bitmap: 65535,
                            data: land.getChunk(x, z).raw()
                        });
                    }
                }
            }
        })
        .on('packet:handshake', clientID => clients.set(clientID, new Set()))
        .on('packet:kick', clientID => clients.delete(clientID))
        .on('client:leave', clientID => clients.delete(clientID));

    land
        .on('changed', (chunkX, chunkZ) => {
            const chunkId = `${chunkX}:${chunkZ}`;
            clients.forEach(chunks => chunks.delete(chunkId));
        });

};