const PING_TIMEOUT = 1000;

const MESSAGE = {
    token: 0
};

module.exports = server => {
    const clients = new Set();

    let timerId;

    server
        .on('plugin:start', _ => {
            timerId = setInterval(_ => clients.forEach(client => server.keepalive(client, MESSAGE), PING_TIMEOUT))
        })
        .on('plugin:stop', _ => clearInterval(timerId))
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('packet:kick', clientID => clients.delete(clientID))
        .on('client:leave', clientID => clients.delete(clientID));
};