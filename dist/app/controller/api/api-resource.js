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
exports.ApiResourceController = void 0;
const midway_1 = require("midway");
const api_resource_service_1 = require("../../service/api/api-resource-service");
const egg_freelog_base_1 = require("egg-freelog-base");
let ApiResourceController = class ApiResourceController {
    ctx;
    apiResourceService;
    async listByTagNameAndAfterCreateDate() {
        this.ctx.checkBody("tagName").exist();
        this.ctx.checkBody("startDate").exist();
        this.ctx.checkBody("limitDate").exist();
        this.ctx.checkBody("projection").exist();
        this.ctx.validateParams();
        this.ctx.success(await this.apiResourceService.listByTagNameAndAfterCreateDate(this.ctx.request.body));
    }
    async listByResourceIds() {
        this.ctx.checkBody("resourceIds").exist();
        this.ctx.checkBody("projection").exist();
        this.ctx.validateParams();
        this.ctx.success(await this.apiResourceService.listByResourceIds(this.ctx.request.body));
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ApiResourceController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", api_resource_service_1.ApiResourceService)
], ApiResourceController.prototype, "apiResourceService", void 0);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    (0, midway_1.post)('/listByTagNameAndAfterCreateDate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiResourceController.prototype, "listByTagNameAndAfterCreateDate", null);
__decorate([
    (0, egg_freelog_base_1.visitorIdentityValidator)(egg_freelog_base_1.IdentityTypeEnum.InternalClient),
    (0, midway_1.post)(`/listByResourceIds`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiResourceController.prototype, "listByResourceIds", null);
ApiResourceController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/resources/api')
], ApiResourceController);
exports.ApiResourceController = ApiResourceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2FwaS9hcGktcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBQ3pELGlGQUEwRTtBQUMxRSx1REFBNEY7QUFLNUYsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFHOUIsR0FBRyxDQUFpQjtJQUdwQixrQkFBa0IsQ0FBcUI7SUFJdkMsS0FBSyxDQUFDLCtCQUErQjtRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0csQ0FBQztJQUlELEtBQUssQ0FBQyxpQkFBaUI7UUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUxQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDSixDQUFBO0FBMUJHO0lBREMsSUFBQSxlQUFNLEdBQUU7O2tEQUNXO0FBR3BCO0lBREMsSUFBQSxlQUFNLEdBQUU7OEJBQ1cseUNBQWtCO2lFQUFDO0FBSXZDO0lBRkMsSUFBQSwyQ0FBd0IsRUFBQyxtQ0FBZ0IsQ0FBQyxjQUFjLENBQUM7SUFDekQsSUFBQSxhQUFJLEVBQUMsa0NBQWtDLENBQUM7Ozs7NEVBU3hDO0FBSUQ7SUFGQyxJQUFBLDJDQUF3QixFQUFDLG1DQUFnQixDQUFDLGNBQWMsQ0FBQztJQUN6RCxJQUFBLGFBQUksRUFBQyxvQkFBb0IsQ0FBQzs7Ozs4REFPMUI7QUE1QlEscUJBQXFCO0lBRmpDLElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsbUJBQVUsRUFBQyxtQkFBbUIsQ0FBQztHQUNuQixxQkFBcUIsQ0E2QmpDO0FBN0JZLHNEQUFxQiJ9