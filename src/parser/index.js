module.exports = {
    PROTOCOL: '61',
    VERSION: '1.5.2',
    pack: require('./pack'),
    unpack: require('./unpack'),
    PIDS: require('./protocol').PIDS
};