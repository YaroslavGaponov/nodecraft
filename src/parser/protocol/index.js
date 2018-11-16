const fs = require('fs');
const path = require('path');

const PIDS = Object.create(null);
const PACKETS = [];

const arr = fs
    .readdirSync(__dirname)
    .filter(name => path.extname(name) === '.json')
    .map(name => path.join(__dirname, name))
    .map(name => require(name));

for (let i = 0; i < arr.length; i++) {
    PIDS[arr[i].name] = arr[i].pid;
    PACKETS[arr[i].pid] = arr[i];
}

module.exports = {
    PIDS,
    PACKETS
};