const assert = require('assert');
const protocol = require('./protocol');
const Types = require('./types');

function unpack(buffer) {
    assert(buffer);
    assert(Buffer.isBuffer(buffer));

    const data = {
        position: 0,
        buffer
    };

    const packet = Object.create(null);
    packet.pid = _read(Types.Byte, data);

    const info = protocol.PACKETS[packet.pid];

    assert(info, `Packet 0x${packet.pid.toString(16)} is unknown`);

    for (let name in info.format) {
        assert(info.format[name] in Types, `Incorrect type ${info.format[name]}`);
        packet[name] = _read(info.format[name], data);
    }

    return {
        name: info.name,
        packet
    };
}

function _read(type, data) {
    let value;
    switch (type) {
        case Types.Bool:
            value = !!data.buffer.readUInt8(data.position);
            data.position += 1;
            break;
        case Types.Byte:
            value = data.buffer.readUInt8(data.position);
            data.position += 1;
            break;
        case Types.Short:
            value = data.buffer.readUInt16BE(data.position);
            data.position += 2;
            break;
        case Types.SInt:
            value = data.buffer.readInt32BE(data.position);
            data.position += 4;
            break;
        case Types.Int:
            value = data.buffer.readUInt32BE(data.position);
            data.position += 4;
            break;
        case Types.Double:
            value = data.buffer.readDoubleBE(data.position);
            data.position += 8;
            break;
        case Types.Float:
            value = data.buffer.readFloatBE(data.position);
            data.position += 4;
            break;
        case Types.Str:
            const length = data.buffer.readUInt16BE(data.position) << 1;
            data.position += 2;
            value = data.buffer.slice(data.position, data.position + length);
            for (let i = 0; i < value.length; i++) {
                let a = value[i];
                value[i] = value[i + 1];
                value[i + 1] = a;
            }
            value = value.toString('ucs2');
            data.position += length;
            break;
    }
    return value;
}

module.exports = unpack;