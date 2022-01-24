"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (appInfo) => {
    const config = {};
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name;
    config.cluster = {
        listen: {
            port: 7101
        }
    };
    config.i18n = {
        enable: true,
        defaultLocale: 'zh-CN'
    };
    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler'];
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
    config.elasticSearch = {
        url: ''
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0JBQWUsQ0FBQyxPQUFtQixFQUFFLEVBQUU7SUFDbkMsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO0lBRXZCLHVFQUF1RTtJQUN2RSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFM0IsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxJQUFJO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLElBQUksR0FBRztRQUNWLE1BQU0sRUFBRSxJQUFJO1FBQ1osYUFBYSxFQUFFLE9BQU87S0FDekIsQ0FBQztJQUVGLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0lBRTNFLE1BQU0sQ0FBQyxNQUFNLEdBQUc7UUFDWixNQUFNLEVBQUUsS0FBSztLQUNoQixDQUFDO0lBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7WUFDOUIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDdEUsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDckIsQ0FBQztLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsTUFBTSxFQUFFO1lBQ0osTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCxJQUFJLEVBQUU7WUFDRixNQUFNLEVBQUUsS0FBSztTQUNoQjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsb0JBQW9CLEdBQUc7UUFDMUIsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsa0NBQWtDO1FBQzdDLFVBQVUsRUFBRSxrQ0FBa0M7S0FDakQsQ0FBQztJQUVGLE1BQU0sQ0FBQyxhQUFhLEdBQUc7UUFDbkIsR0FBRyxFQUFFLEVBQUU7S0FDVixDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=