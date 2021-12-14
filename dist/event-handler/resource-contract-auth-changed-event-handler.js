"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceContractAuthChangedEventHandler = void 0;
const midway_1 = require("midway");
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceContractAuthChangedEventHandler = class ResourceContractAuthChangedEventHandler {
    consumerGroupId = 'freelog-resource-service#contract-terminated-event-handler-group';
    subscribeTopicName = `resource-contract-auth-status-changed-topic`;
    resourceVersionProvider;
    initial() {
        this.messageHandle = this.messageHandle.bind(this);
    }
    /**
     * 消息处理
     * @param payload
     */
    async messageHandle(payload) {
        const message = JSON.parse(payload.message.value.toString());
        if (message.contractStatus !== egg_freelog_base_1.ContractStatusEnum.Terminated) {
            return;
        }
        const resourceVersions = await this.resourceVersionProvider.find({
            resourceId: message.licenseeId, 'resolveResources.resourceId': message.licensorId
        }, 'versionId resolveResources');
        const tasks = [];
        for (const resourceVersion of resourceVersions) {
            const resolveResource = resourceVersion.resolveResources.find(x => x.resourceId === message.subjectId);
            resolveResource.contracts = resolveResource.contracts.filter(x => x.contractId !== message.contractId);
            tasks.push(this.resourceVersionProvider.updateOne({ versionId: resourceVersion.versionId }, {
                resolveResources: resourceVersion.resolveResources
            }));
        }
        await Promise.all(tasks);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceContractAuthChangedEventHandler.prototype, "resourceVersionProvider", void 0);
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ResourceContractAuthChangedEventHandler.prototype, "initial", null);
ResourceContractAuthChangedEventHandler = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.scope)(midway_1.ScopeEnum.Singleton)
], ResourceContractAuthChangedEventHandler);
exports.ResourceContractAuthChangedEventHandler = ResourceContractAuthChangedEventHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29udHJhY3QtYXV0aC1jaGFuZ2VkLWV2ZW50LWhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQtaGFuZGxlci9yZXNvdXJjZS1jb250cmFjdC1hdXRoLWNoYW5nZWQtZXZlbnQtaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBK0Q7QUFJL0QsdURBQXVFO0FBSXZFLElBQWEsdUNBQXVDLEdBQXBELE1BQWEsdUNBQXVDO0lBRWhELGVBQWUsR0FBRyxrRUFBa0UsQ0FBQztJQUNyRixrQkFBa0IsR0FBRyw2Q0FBNkMsQ0FBQztJQUduRSx1QkFBdUIsQ0FBeUM7SUFHaEUsT0FBTztRQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBMkI7UUFDM0MsTUFBTSxPQUFPLEdBQTJDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNyRyxJQUFJLE9BQU8sQ0FBQyxjQUFjLEtBQUsscUNBQWtCLENBQUMsVUFBVSxFQUFFO1lBQzFELE9BQU87U0FDVjtRQUNELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDO1lBQzdELFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLDZCQUE2QixFQUFFLE9BQU8sQ0FBQyxVQUFVO1NBQ3BGLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUVqQyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRTtZQUM1QyxNQUFNLGVBQWUsR0FBRyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsS0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkcsZUFBZSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsU0FBUyxFQUFDLEVBQUU7Z0JBQ3RGLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxnQkFBZ0I7YUFDckQsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0osQ0FBQTtBQTlCRztJQURDLElBQUEsZUFBTSxHQUFFOzt3RkFDdUQ7QUFHaEU7SUFEQyxJQUFBLGFBQUksR0FBRTs7OztzRUFHTjtBQVhRLHVDQUF1QztJQUZuRCxJQUFBLGdCQUFPLEdBQUU7SUFDVCxJQUFBLGNBQUssRUFBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztHQUNkLHVDQUF1QyxDQW9DbkQ7QUFwQ1ksMEZBQXVDIn0=