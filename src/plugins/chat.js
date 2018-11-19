module.exports = server => {
    const users = new Map();

    server
        .on('packet:handshake', (clientID, packet) => users.set(clientID, packet.username))
        .on('client:leave', clientID => users.delete(clientID))
        .on('packet:chat_message', (clientID, packet) => {
            [...users.keys()]
            .filter(e => e != clientID)
                .forEach(e => server.chat_message(e, {
                    message: users.get(clientID) + '> ' + packet.message
                }));
        });
};