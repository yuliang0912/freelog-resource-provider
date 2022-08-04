export const development = {
    watchDirs: [
        'app',
        'controller',
        'lib',
        'service',
        'extend',
        'config',
        'app.ts',
        'agent.ts',
        'interface.ts',
    ],
    overrideDefault: true
};

export default () => {
    const config: any = {};

    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler', 'localIdentityInfoHandler'];

    config.gatewayUrl = 'http://api.testfreelog.com';
    config.mongoose = {
        url: decodeURIComponent(`mongodb%3A%2F%2Fresource_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40dds-wz9ac40fee5c09441604-pub.mongodb.rds.aliyuncs.com%3A3717%2Cdds-wz9ac40fee5c09442584-pub.mongodb.rds.aliyuncs.com%3A3717%2Ftest-resources%3FreplicaSet%3Dmgset-44484047`),
    };

    config.elasticSearch = {
        database: 'test-resources',
        url: 'http://119.23.63.19:32519'
    };

    config.localIdentity = {
        userId: 50060,
        username: 'yuliang',
        email: 'support@freelog.com'
    };

    config.kafka = {
        enable: false,
        clientId: 'freelog-resource-service',
        logLevel: 1, // logLevel.ERROR,
        brokers: ['192.168.164.165:9090']
    };

    return config;
};
