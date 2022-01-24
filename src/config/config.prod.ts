export default () => {
    const config: any = {};

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

    config.kafka = {
        enable: false,
        clientId: 'freelog-resource-service',
        logLevel: 1, // logLevel.ERROR,
        brokers: ['192.168.164.165:9090']
    };

    config.elasticSearch = {
        url: 'http://elasticsearch.common:9200'
    };

    return config;
};
