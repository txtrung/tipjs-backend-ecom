'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

const _SECOND = -1;

const countConnect = () => {
    const numConnect = mongoose.connections.length;
    console.log(`Number of connection: ${numConnect}`);
}

const checkOverload = () => {
    setInterval(() => {
        const numConnect = mongoose.connections.length;
        const numCore = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        const maxConnection = numCore * 5;

        console.log(`active connection: ${numConnect}`);
        console.log(`memory usage: ${memoryUsage / 1024 /1024} MB`);

        if (numConnect > maxConnection) {
            console.log('connection overload detected!');
        }

    }, _SECOND);
}

module.exports = {
    countConnect,
    checkOverload,
};