module.exports = options => root => {
    const server = root.getServer();
    const clients = new Set();
    server
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('client:leave', clientID => clients.delete(clientID))
        .on('packet:ping', (clientID, packet) => {
            server.kick(clientID, {
                reason: ['§1', options.PROTOCOL, options.VERSION, 'NodeCraft', clients.size, options.USERS].join('\x00')
            });
        });
};