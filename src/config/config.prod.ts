export default () => {
    const config: any = {};

    config.mongoose = {
        url: 'mongodb://mongo-prod.common:27017/resource-beta'
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
    }

    return config;
};
