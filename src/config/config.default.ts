import {EggAppInfo} from 'midway';

export default (appInfo: EggAppInfo) => {
    const config: any = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name

    config.cluster = {
        listen: {
            port: 7001
        }
    };

    config.middleware = [
        'errorHandler', 'identityAuthentication'
    ];

    config.static = {
        enable: false
    }

    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ret: -1, msg: err.toString(), data: null});
            ctx.status = 500;
        }
    };

    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        }
    };

    return config;
};
