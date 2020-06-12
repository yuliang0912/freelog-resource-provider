"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("midway-mock/bootstrap");
describe('test/app/service/resourceService.test.ts', () => {
    it('#getResourceInfo', async () => {
        // 取出 userService
        const resourceService = await bootstrap_1.app.applicationContext.getAsync('resourceService');
        const resourceInfo = await resourceService.findOneByResourceName('yuliang/my-first-resource');
        bootstrap_1.assert(resourceInfo.resourceType === 'text');
        bootstrap_1.assert(resourceInfo.username === 'yuliang');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9hcHAvc2VydmljZS9yZXNvdXJjZS1zZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBa0Q7QUFHbEQsUUFBUSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtJQUN0RCxFQUFFLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDOUIsaUJBQWlCO1FBQ2pCLE1BQU0sZUFBZSxHQUFHLE1BQU0sZUFBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBbUIsaUJBQWlCLENBQUMsQ0FBQztRQUNuRyxNQUFNLFlBQVksR0FBRyxNQUFNLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO1FBQzdGLGtCQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQztRQUM3QyxrQkFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUM7SUFDaEQsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9