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

    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/resource-beta'
    };

    // config.gatewayUrl= "http://api.testfreelog.com",
    //
    // config.mongoose = {
    //     url: 'mongodb://39.108.77.211:30772/resource-beta'
    // };

    config.localIdentity = {
        userId: 50021, //50028
        username: 'yuliang'
    };

    return config;
};
