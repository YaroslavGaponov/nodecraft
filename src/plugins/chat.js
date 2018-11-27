module.exports = root => {
    const server = root.getServer();
    const users = new Map();

    server
        .on('packet:handshake', (clientID, packet) => users.set(clientID, packet.username))
        .on('client:leave', clientID => users.delete(clientID))
        .on('packet:chat_message', (clientID, packet, direction) => {
            if (direction === 'client_to_server') {
                const from = users.get(clientID);
                users.forEach((_, id) => {
                    if (id != clientID) {
                        server.chat_message(id, {
                            message: `${from} ${packet.message}`
                        });
                    }
                });
            }
        });
};