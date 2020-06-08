var probe = require('probe-image-size');

probe('https://image.freelog.com/preview/b042cd88-cc9a-43fb-b8fb-1cae320b7977.jpg').then(console.log)

probe('https://freelog-shenzhen.oss-cn-shenzhen.aliyuncs.com/resources/Image/701b1329a94d40cfbf152d7b928b9403').then(console.log)

probe('https://freelog-shenzhen.oss-cn-shenzhen.aliyuncs.com/resources/Image/package.json').then(console.log).catch(console.log)
