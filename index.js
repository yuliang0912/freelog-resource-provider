'use strict';

// npm run dev DO NOT read this file

require('egg').startCluster({
    baseDir: __dirname,
    port: process.env.PORT || 7001,
    workers: 1
});

const lodash = require('lodash')

console.log(lodash.truncate('ABCDEFGHIJ', {
    length: 9,
    omission: ''
}))