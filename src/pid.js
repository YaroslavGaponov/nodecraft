const Pid = {
    keepalive: 0x00,
    login: 0x01,
    handshake: 0x02,
    spawn_position: 0x06,
    player: 0x0a,
    player_position: 0x0b,
    player_position_and_look: 0x0d,
    map_chunk: 0x33
};

module.exports = Object.freeze(Pid);