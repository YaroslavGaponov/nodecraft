module.exports = distance => root => {
    distance = distance || 5;
    
    const clients = new Set();

    root
        .on('packet:player_position', (clientID, packet) => {            
            const chunkX = packet.x >> 4;
            const chunkZ = packet.z >> 4;
            for (let x = chunkX - distance; x < chunkX + distance; x++) {
                for (let z = chunkZ - distance; z < chunkZ + distance; z++) {
                    root.getServer().map_chunk(clientID, {
                        x: x,
                        z: z,
                        solid: 1,
                        primary_bitmap: 65535,
                        add_bitmap: 65535,
                        data: root.getLand().getChunk(x, z).raw()
                    });
                }
            }
        })
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('packet:kick', clientID => clients.delete(clientID))
        .on('client:leave', clientID => clients.delete(clientID));
};