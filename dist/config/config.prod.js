"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
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
        logLevel: 1,
        brokers: ['kafka-hs.production:9092'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5wcm9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLGtCQUFrQixDQUFDLDBQQUEwUCxDQUFDO0tBQ3RSLENBQUM7SUFFRixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFFLElBQUk7U0FDYjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsWUFBWSxHQUFHO1FBQ2xCLE1BQU0sRUFBRTtZQUNKLFFBQVEsRUFBRSxJQUFJO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLDBCQUEwQjtRQUNwQyxRQUFRLEVBQUUsQ0FBQztRQUNYLE9BQU8sRUFBRSxDQUFDLDBCQUEwQixDQUFDO1FBQ3JDLGlCQUFpQixFQUFFLElBQUk7UUFDdkIsS0FBSyxFQUFFO1lBQ0gsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixPQUFPLEVBQUUsRUFBRTtTQUNkO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixHQUFHLEVBQUUsa0NBQWtDO0tBQzFDLENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==