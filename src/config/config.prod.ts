export default () => {
    const config: any = {};

    config.mongoose = {
        url: 'mongodb://mongo-prod.common:27017/resource-beta'
    };

    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    }

    return config;
};
