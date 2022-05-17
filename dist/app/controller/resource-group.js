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
exports.ResourceGroupController = void 0;
const midway_1 = require("midway");
let ResourceGroupController = class ResourceGroupController {
    ctx;
    /**
     * 创建用户分组
     */
    async create() {
        const { ctx } = this;
        // const name = ctx.checkBody('name').exist().isResourceName().trim().value;
        // const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        // const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        // const intro = ctx.checkBody('intro').optional().default('').len(0, 1000).value;
        // const coverImages = ctx.checkBody('coverImages').optional().isArray().len(0, 10).default([]).value;
        // const tags = ctx.checkBody('tags').optional().isArray().len(0, 20).default([]).value; // 单个标签长度也限制为20,未实现
        ctx.validateParams();
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ResourceGroupController.prototype, "ctx", void 0);
__decorate([
    (0, midway_1.post)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceGroupController.prototype, "create", null);
ResourceGroupController = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.controller)('/v2/resourceGroups')
], ResourceGroupController);
exports.ResourceGroupController = ResourceGroupController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UtZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXlEO0FBS3pELElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0lBR2hDLEdBQUcsQ0FBaUI7SUFFcEI7O09BRUc7SUFFSCxLQUFLLENBQUMsTUFBTTtRQUNSLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkIsNEVBQTRFO1FBQzVFLHFGQUFxRjtRQUNyRixxRkFBcUY7UUFDckYsa0ZBQWtGO1FBQ2xGLHNHQUFzRztRQUN0Ryw0R0FBNEc7UUFDNUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDSixDQUFBO0FBaEJHO0lBREMsSUFBQSxlQUFNLEdBQUU7O29EQUNXO0FBTXBCO0lBREMsSUFBQSxhQUFJLEVBQUMsR0FBRyxDQUFDOzs7O3FEQVVUO0FBbEJRLHVCQUF1QjtJQUZuQyxJQUFBLGdCQUFPLEdBQUU7SUFDVCxJQUFBLG1CQUFVLEVBQUMsb0JBQW9CLENBQUM7R0FDcEIsdUJBQXVCLENBbUJuQztBQW5CWSwwREFBdUIifQ==