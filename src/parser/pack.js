const assert = require('assert');
const Transform = require('stream').Transform;
const zlib = require('zlib');
const protocol = require('./protocol');
const Types = require('./types');

function pack(packet) {
    assert(packet);
    assert(typeof packet === 'object');
    assert('pid' in packet);

    const result = [_write(Types.Byte, packet.pid)];

    const info = protocol.PACKETS[packet.pid];
    assert(info, `Packet 0x${packet.pid.toString(16)} is unknown`);

    for (let name in info.format) {
        assert(name in packet, `Packet 0x${packet.pid.toString(16)} has no attribute ${name}`);
        assert(info.format[name] in Types, `Incorrect type ${info.format[name]}`);
        result.push(_write(info.format[name], packet[name]));
    }

    return Buffer.concat(result);
}

function _write(type, value) {
    let buffer;
    switch (type) {
        case Types.Bool:
            buffer = Buffer.allocUnsafe(1);
            buffer.writeUInt8(value ? 1 : 0, 0);
            break;
        case Types.Byte:
            buffer = Buffer.allocUnsafe(1);
            buffer.writeUInt8(value, 0);
            break;
        case Types.Short:
            buffer = Buffer.allocUnsafe(2);
            buffer.writeUInt16BE(value, 0);
            break;
        case Types.SInt:
            buffer = Buffer.allocUnsafe(4);
            buffer.writeInt32BE(value, 0);
            break;
        case Types.Int:
            buffer = Buffer.allocUnsafe(4);
            buffer.writeUInt32BE(value, 0);
            break;
        case Types.Long:
            buffer = Buffer.allocUnsafe(8);
            buffer.writeUInt32BE(0, 0);
            buffer.writeUInt32BE(value, 4);
            break;
        case Types.Double:
            buffer = Buffer.allocUnsafe(8);
            buffer.writeDoubleBE(value, 0);
            break;
        case Types.Float:
            buffer = Buffer.allocUnsafe(4);
            buffer.writeFloatBE(value, 0);
            break;
        case Types.Str:
            buffer = Buffer.allocUnsafe(2 + (value.length << 1));
            buffer.fill(0x20);
            buffer.writeUInt16BE(value.length, 0);
            const s = Buffer.from(value, 'ucs2');
            for (let i = 0; i < s.length; i += 2) {
                let t = s[i];
                s[i] = s[i + 1];
                s[i + 1] = t;
            }
            s.copy(buffer, 2);
            break;
        case Types.Record:
            buffer = Buffer.allocUnsafe(4 + (3 * value.length));
            let p = 0;
            buffer.writeInt32BE(value.length, p);
            p += 4;
            for (let i = 0; i < value.length; i++) {
                buffer.writeInt8(value[i][0], p);
                p++;
                buffer.writeInt8(value[i][1], p);
                p++;
                buffer.writeInt8(value[i][2], p);
                p++;
            }
            break;
        case Types.Chunk:
            const data = zlib.deflateSync(value);
            buffer = Buffer.allocUnsafe(data.length + 4);
            buffer.fill(0);
            buffer.writeInt32BE(data.length);
            data.copy(buffer, 4);
            break;

    }
    return buffer;
}


class Pack extends Transform {
    constructor() {
        super({
            objectMode: true
        });
    }

    _transform(chunk, encoding, callback) {
        this.push(pack(chunk));
        return callback();
    }

}

module.exports = Pack;