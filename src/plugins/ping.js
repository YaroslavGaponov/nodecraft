module.exports = options => root => {
    const clients = new Set();
    root
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('client:leave', clientID => clients.delete(clientID))
        .on('packet:ping', (clientID, packet) => {
            root.getServer().kick(clientID, {
                reason: ['§1', options.PROTOCOL, options.VERSION, 'NodeCraft', clients.size, options.USERS].join('\x00')
            });
        });
};