"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
    // config.mongoose = {
    //     url: decodeURIComponent('mongodb%3A%2F%2Fresource_service%3AQzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk%3D%40freelog-prod-public.mongodb.rds.aliyuncs.com%3A3717%2Cfreelog-prod-public-secondary.mongodb.rds.aliyuncs.com%3A3717%2Fprod-resources%3FreplicaSet%3Dmgset-58730021')
    // };
    config.mongoose = {
        url: 'mongodb://resource_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@freelog-prod-public.mongodb.rds.aliyuncs.com:3717,freelog-prod-public-secondary.mongodb.rds.aliyuncs.com:3717/prod-resources?replicaSet=mgset-58730021&authSource=admin'
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
        logLevel: 1,
        brokers: ['kafka-svc.common:9093']
    };
    config.elasticSearch = {
        url: 'http://elasticsearch.common:9200'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5wcm9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixzQkFBc0I7SUFDdEIsd1JBQXdSO0lBQ3hSLEtBQUs7SUFFTCxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLGlQQUFpUDtLQUN6UCxDQUFDO0lBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFlBQVksR0FBRztRQUNsQixNQUFNLEVBQUU7WUFDSixRQUFRLEVBQUUsSUFBSTtTQUNqQjtRQUNELEtBQUssRUFBRSxFQUFFO0tBQ1osQ0FBQztJQUVGLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSwwQkFBMEI7UUFDcEMsUUFBUSxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztLQUNyQyxDQUFDO0lBRUYsTUFBTSxDQUFDLGFBQWEsR0FBRztRQUNuQixHQUFHLEVBQUUsa0NBQWtDO0tBQzFDLENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==