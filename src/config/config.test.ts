export default () => {
    const config: any = {};

    config.cluster = {
        listen: {
            port: 5101
        }
    };

    config.mongoose = {
        url: `mongodb://resource_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@dds-wz9ac40fee5c09441.mongodb.rds.aliyuncs.com:3717,dds-wz9ac40fee5c09442.mongodb.rds.aliyuncs.com:3717/test-resources?replicaSet=mgset-44484047`,
    };

    config.elasticSearch = {
        database: 'test-resources',
        url: 'http://elasticsearch.common:9200'
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
        brokers: ['kafka-0.development:9092']
    };

    return config;
};
