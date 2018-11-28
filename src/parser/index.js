module.exports = {
    PROTOCOL: '61',
    VERSION: '1.5.2',

    Pack: require('./pack'),
    Unpack: require('./unpack'),
    
    PIDS: require('./protocol').PIDS
};