module.exports = root => {
    const clients = new Set();

    root
        .on('land:update', c =>
            root.getServer().map_chunk(c.clientID, {
                x: c.x,
                z: c.z,
                solid: 1,
                primary_bitmap: 65535,
                add_bitmap: 65535,
                data: root.getLand().getChunk(c.x, c.z).raw()
            })
        )
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('packet:kick', clientID => clients.delete(clientID))
        .on('client:leave', clientID => clients.delete(clientID));
};