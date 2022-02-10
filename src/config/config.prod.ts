export default () => {
    const config: any = {};

    config.mongoose = {
        url: decodeURIComponent('mongodb%3A%2F%2Fresource_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40freelog-prod-private.mongodb.rds.aliyuncs.com%3A3717%2Cfreelog-prod-private-secondary.mongodb.rds.aliyuncs.com%3A3717%2Fprod-resources%3FreplicaSet%3Dmgset-58730021')
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
        enable: true,
        clientId: 'freelog-resource-service',
        logLevel: 1, // logLevel.ERROR,
        brokers: ['kafka-0.common:9092', 'kafka-1.common:9092', 'kafka-2.common:9092'],
        connectionTimeout: 3000,
        retry: {
            initialRetryTime: 5000,
            retries: 20
        }
    };

    config.elasticSearch = {
        database: 'prod-resources',
        url: 'http://elasticsearch.common:9200'
    };

    return config;
};
