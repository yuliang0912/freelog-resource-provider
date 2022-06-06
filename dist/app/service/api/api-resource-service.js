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
exports.ApiResourceService = void 0;
const midway_1 = require("midway");
let ApiResourceService = class ApiResourceService {
    resourceProvider;
    async listByTagNameAndAfterCreateDate(params) {
        let startDate = new Date(params.startDate);
        let limitDate = new Date(params.limitDate);
        return this.resourceProvider.find({
            tags: { $elemMatch: { $eq: params.tagName } },
            $and: [
                {
                    createDate: { $gt: startDate }
                },
                {
                    createDate: { $lt: limitDate }
                }
            ],
        }, params.projection);
    }
    async listByResourceIds(params) {
        return this.resourceProvider.find({ _id: { $in: params.resourceIds } }, params.projection);
    }
};
__decorate([
    (0, midway_1.inject)(),
    __metadata("design:type", Object)
], ApiResourceService.prototype, "resourceProvider", void 0);
ApiResourceService = __decorate([
    (0, midway_1.provide)()
], ApiResourceService);
exports.ApiResourceService = ApiResourceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXJlc291cmNlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBwL3NlcnZpY2UvYXBpL2FwaS1yZXNvdXJjZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1DQUF1QztBQUt2QyxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtJQUczQixnQkFBZ0IsQ0FBa0M7SUFFbEQsS0FBSyxDQUFDLCtCQUErQixDQUFDLE1BQU07UUFDeEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDOUIsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUMsRUFBQztZQUN6QyxJQUFJLEVBQUU7Z0JBQ0Y7b0JBQ0ksVUFBVSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQztpQkFDL0I7Z0JBQ0Q7b0JBQ0ksVUFBVSxFQUFFLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBQztpQkFDL0I7YUFDSjtTQUNKLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTTtRQUMxQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBQyxFQUFDLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7Q0FDSixDQUFBO0FBdEJHO0lBREMsSUFBQSxlQUFNLEdBQUU7OzREQUN5QztBQUh6QyxrQkFBa0I7SUFEOUIsSUFBQSxnQkFBTyxHQUFFO0dBQ0csa0JBQWtCLENBeUI5QjtBQXpCWSxnREFBa0IifQ==