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
    config.middleware = [
        'errorHandler', 'localUserIdentity'
    ];
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/resource-beta'
    };
    //
    // config.gatewayUrl= "http://api.testfreelog.com",
    //
    //
    // config.mongoose = {
    //     url: 'mongodb://39.108.77.211:30772/resource-beta'
    // };
    config.localIdentity = {
        userId: 50021,
        username: 'yuliang'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQWEsUUFBQSxXQUFXLEdBQUc7SUFDdkIsU0FBUyxFQUFFO1FBQ1AsS0FBSztRQUNMLFlBQVk7UUFDWixLQUFLO1FBQ0wsU0FBUztRQUNULFFBQVE7UUFDUixRQUFRO1FBQ1IsUUFBUTtRQUNSLFVBQVU7UUFDVixjQUFjO0tBQ2pCO0lBQ0QsZUFBZSxFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLFVBQVUsR0FBRztRQUNoQixjQUFjLEVBQUUsbUJBQW1CO0tBQ3RDLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLHlDQUF5QztLQUNqRCxDQUFDO0lBQ0YsRUFBRTtJQUNGLG1EQUFtRDtJQUNuRCxFQUFFO0lBQ0YsRUFBRTtJQUNGLHNCQUFzQjtJQUN0Qix5REFBeUQ7SUFDekQsS0FBSztJQUVMLE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixRQUFRLEVBQUUsU0FBUztLQUN0QixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=