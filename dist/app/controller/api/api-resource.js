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
    (0, midway_1.post)('/listByTagNameAndAfterCreateDate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiResourceController.prototype, "listByTagNameAndAfterCreateDate", null);
__decorate([
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcC9jb250cm9sbGVyL2FwaS9hcGktcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBQ3pELGlGQUEwRTtBQU0xRSxJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtJQUc5QixHQUFHLENBQWlCO0lBR3BCLGtCQUFrQixDQUFxQjtJQUd2QyxLQUFLLENBQUMsK0JBQStCO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBR0QsS0FBSyxDQUFDLGlCQUFpQjtRQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNKLENBQUE7QUF4Qkc7SUFEQyxJQUFBLGVBQU0sR0FBRTs7a0RBQ1c7QUFHcEI7SUFEQyxJQUFBLGVBQU0sR0FBRTs4QkFDVyx5Q0FBa0I7aUVBQUM7QUFHdkM7SUFEQyxJQUFBLGFBQUksRUFBQyxrQ0FBa0MsQ0FBQzs7Ozs0RUFTeEM7QUFHRDtJQURDLElBQUEsYUFBSSxFQUFDLG9CQUFvQixDQUFDOzs7OzhEQU8xQjtBQTFCUSxxQkFBcUI7SUFGakMsSUFBQSxnQkFBTyxHQUFFO0lBQ1QsSUFBQSxtQkFBVSxFQUFDLG1CQUFtQixDQUFDO0dBQ25CLHFCQUFxQixDQTJCakM7QUEzQlksc0RBQXFCIn0=