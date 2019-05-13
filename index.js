'use strict';

const lodash = require('lodash')

// npm run dev DO NOT read this file

require('egg').startCluster({
    baseDir: __dirname,
    port: process.env.PORT || 7001,
    workers: 1
});