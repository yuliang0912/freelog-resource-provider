export default () => {
    const config: any = {};

    config.cluster = {
        listen: {
            port: 5002
        }
    }

    config.mongoose = {
        url: 'mongodb://mongo-test.common:27017/resource-beta'
    };

    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };

    return config;
};
