'use strict';

// npm run dev DO NOT read this file

require('egg').startCluster({
    baseDir: __dirname,
    port: process.env.PORT || 7001, // default to 7001
    workers: 2
});


// [[1, 2, 3], [4, 5, 6], [7, 8, 9]].reduce((p, c) => {
//     return p.concat(c)
// })

