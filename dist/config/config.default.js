"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (appInfo) => {
    const config = {};
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name;
    config.cluster = {
        listen: {
            port: 7001
        }
    };
    config.i18n = {
        enable: true,
        defaultLocale: 'zh-CN'
    };
    config.middleware = [
        'errorHandler', 'identityAuthentication'
    ];
    config.static = {
        enable: false
    };
    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ ret: -1, msg: err.toString(), data: null });
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
    config.clientCredentialInfo = {
        clientId: 1002,
        publicKey: 'ad472200bda12d65666df7b97282a7c6',
        privateKey: '9d3761da71ee041e648cafb2e322d968'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0JBQWUsQ0FBQyxPQUFtQixFQUFFLEVBQUU7SUFDbkMsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBRXZCLHVFQUF1RTtJQUN2RSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFM0IsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLElBQUksR0FBRztRQUNWLE1BQU0sRUFBRSxJQUFJO1FBQ1osYUFBYSxFQUFFLE9BQU87S0FDekIsQ0FBQztJQUVGLE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsY0FBYyxFQUFFLHdCQUF3QjtLQUMzQyxDQUFDO0lBRUYsTUFBTSxDQUFDLE1BQU0sR0FBRztRQUNaLE1BQU0sRUFBRSxLQUFLO0tBQ2hCLENBQUM7SUFFRixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxDQUFDLElBQUksR0FBRyxrQkFBa0IsQ0FBQztZQUM5QixHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUN0RSxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNyQixDQUFDO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxRQUFRLEdBQUc7UUFDZCxNQUFNLEVBQUU7WUFDSixNQUFNLEVBQUUsS0FBSztTQUNoQjtRQUNELElBQUksRUFBRTtZQUNGLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRztRQUMxQixRQUFRLEVBQUUsSUFBSTtRQUNkLFNBQVMsRUFBRSxrQ0FBa0M7UUFDN0MsVUFBVSxFQUFFLGtDQUFrQztLQUNqRCxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=