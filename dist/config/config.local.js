"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.development = void 0;
exports.development = {
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
exports.default = () => {
    const config = {};
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
        logLevel: 1,
        brokers: ['192.168.164.165:9090']
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQWEsUUFBQSxXQUFXLEdBQUc7SUFDdkIsU0FBUyxFQUFFO1FBQ1AsS0FBSztRQUNMLFlBQVk7UUFDWixLQUFLO1FBQ0wsU0FBUztRQUNULFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFVBQVU7UUFDVixjQUFjO0tBQ2pCO0lBQ0QsZUFBZSxFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLHNCQUFzQixFQUFFLDRCQUE0QixFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFFdkcsTUFBTSxDQUFDLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztJQUNqRCxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLGtCQUFrQixDQUFDLGdRQUFnUSxDQUFDO0tBQzVSLENBQUM7SUFFRixNQUFNLENBQUMsYUFBYSxHQUFHO1FBQ25CLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsR0FBRyxFQUFFLDJCQUEyQjtLQUNuQyxDQUFDO0lBRUYsTUFBTSxDQUFDLGFBQWEsR0FBRztRQUNuQixNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSxTQUFTO1FBQ25CLEtBQUssRUFBRSxxQkFBcUI7S0FDL0IsQ0FBQztJQUVGLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxNQUFNLEVBQUUsS0FBSztRQUNiLFFBQVEsRUFBRSwwQkFBMEI7UUFDcEMsUUFBUSxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztLQUNwQyxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=