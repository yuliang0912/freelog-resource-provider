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
exports.ResourceVersionService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
const enum_1 = require("../../enum");
let ResourceVersionService = class ResourceVersionService {
    async contractAuth(subjectId, contracts, authType) {
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            throw new egg_freelog_base_1.ArgumentError('please check code logic');
        }
        return contracts.some(x => x.subjectId === subjectId && x.subjectType === enum_1.SubjectTypeEnum.Resource && (authType === 'auth' ? x.isAuth : x.isTestAuth));
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceVersionService.prototype, "resourceService", void 0);
ResourceVersionService = __decorate([
    midway_1.provide('resourceVersionService')
], ResourceVersionService);
exports.ResourceVersionService = ResourceVersionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFFdkMsbUNBQXdDO0FBQ3hDLHVEQUErQztBQUMvQyxxQ0FBMkM7QUFHM0MsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFLL0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBeUIsRUFBRSxRQUE2QjtRQUNsRixJQUFJLENBQUMsZ0JBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLE1BQU0sSUFBSSxnQ0FBYSxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDdEQ7UUFDRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLHNCQUFlLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDM0osQ0FBQztDQUNKLENBQUE7QUFSRztJQURDLGVBQU0sRUFBRTs7K0RBQ3lCO0FBSHpCLHNCQUFzQjtJQURsQyxnQkFBTyxDQUFDLHdCQUF3QixDQUFDO0dBQ3JCLHNCQUFzQixDQVdsQztBQVhZLHdEQUFzQiJ9