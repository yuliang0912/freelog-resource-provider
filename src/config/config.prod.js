"use strict";
exports.__esModule = true;
exports["default"] = (function () {
    var config = {};
    config.mongoose = {
        url: decodeURIComponent('mongodb%3A%2F%2Fresource_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40freelog-prod-public.mongodb.rds.aliyuncs.com%3A3717%2Cfreelog-prod-public-secondary.mongodb.rds.aliyuncs.com%3A3717%2Fprod-resources%3FreplicaSet%3Dmgset-58730021')
    };
    config.cluster = {
        listen: {
            port: 7101
        }
    };
    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };
    return config;
});
