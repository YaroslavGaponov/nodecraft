module.exports = root => {

    const server = root.getServer();
    const clients = new Set();

    let age_of_the_world = 0;
    let time_of_day = 0;

    let timerId;

    server
        .on('packet:handshake', clientID => clients.add(clientID))
        .on('client:leave', clientID => clients.delete(clientID))
        .on('plugin:start', _ => {
            timerId = setInterval(_ => {
                clients.forEach(clientID =>
                    server.time_update(clientID, {
                        age_of_the_world: age_of_the_world += 20,
                        time_of_day: time_of_day += 20
                    }));
            }, 1000);
        })
        .on('plugin:stop', _ => clearInterval(timerId));
};