const zlib = require('zlib');
const Info = require('./info');
const Type = require('./type');

class Parser {
    constructor() {

    }

    pack(packet) {

        const format = (Info[packet.pid] || '').split('$').pop();

        const arr = format
            .split(';')
            .filter(Boolean)
            .map(e => ({
                name: e.split(':')[0],
                type: e.split(':')[1]
            }))
            .map(e => this._write(e.type, packet[e.name]));

        arr.unshift(this._write(Type.Byte, packet.pid));
        
        return Buffer.concat(arr);


    }

    unpack(buffer) {
        const data = {
            position: 0,
            buffer
        };

        const packet = Object.create(null);
        packet.pid = this._read(Type.Byte, data);

        const format = (Info[packet.pid] || 'unknown$').split('$');

        return {
            event: format[0],
            packet: format[1]
                .split(';')
                .filter(Boolean)
                .map(e => ({
                    name: e.split(':')[0],
                    type: e.split(':')[1]
                }))
                .reduce((a, e) => (a[e.name] = this._read(e.type, data), a), packet)
        };

    }

    _read(type, data) {
        let value;
        switch (type) {
            case Type.Byte:
                value = data.buffer.readUInt8(data.position);
                data.position += 1;
                break;
            case Type.Short:
                value = data.buffer.readUInt16BE(data.position);
                data.position += 2;
                break;
            case Type.SInt:
                value = data.buffer.readInt32BE(data.position);
                data.position += 4;
                break;
            case Type.Int:
                value = data.buffer.readUInt32BE(data.position);
                data.position += 4;
                break;
            case Type.Double:
                value = data.buffer.readDoubleBE(data.position);
                data.position += 8;
                break;
            case Type.Float:
                value = data.buffer.readFloatBE(data.position);
                data.position += 4;
                break;
            case Type.Str:
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

    _write(type, value) {
        let buffer;
        switch (type) {
            case Type.Byte:
                buffer = new Buffer(1);
                buffer.writeUInt8(value, 0);
                break;
            case Type.Short:
                buffer = new Buffer(2);
                buffer.writeUInt16BE(value, 0);
                break;
            case Type.SInt:
                buffer = new Buffer(4);
                buffer.writeInt32BE(value, 0);
                break;
            case Type.Int:
                buffer = new Buffer(4);
                buffer.writeUInt32BE(value, 0);
                break;
            case Type.Double:
                buffer = new Buffer(8);
                buffer.writeDoubleBE(value, 0);
                break;
            case Type.Float:
                buffer = new Buffer(4);
                buffer.writeFloatBE(value, 0);
                break;
            case Type.Str:
                buffer = new Buffer(2 + (value.length << 1));
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
            case Type.Chunk:
                const data = zlib.deflateSync(value);
                buffer = new Buffer(data.length + 4);
                buffer.fill(0);
                buffer.writeInt32BE(data.length);
                data.copy(buffer, 4);
                break;

        }
        return buffer;
    }

}

module.exports = Parser;