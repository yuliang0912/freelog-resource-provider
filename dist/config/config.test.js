"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
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
        logLevel: 1,
        brokers: ['kafka-svc.common:9093']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFFLElBQUk7U0FDYjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLDBOQUEwTjtLQUNsTyxDQUFDO0lBRUYsTUFBTSxDQUFDLGFBQWEsR0FBRztRQUNuQixRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLEdBQUcsRUFBRSxrQ0FBa0M7S0FDMUMsQ0FBQztJQUVGLE1BQU0sQ0FBQyxZQUFZLEdBQUc7UUFDbEIsTUFBTSxFQUFFO1lBQ0osUUFBUSxFQUFFLElBQUk7U0FDakI7UUFDRCxLQUFLLEVBQUUsRUFBRTtLQUNaLENBQUM7SUFFRixNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDLFFBQVEsRUFBRSxDQUFDO1FBQ1gsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUM7S0FDckMsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9