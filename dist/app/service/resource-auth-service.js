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
exports.ResourceAuthService = void 0;
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const enum_1 = require("../../enum");
let ResourceAuthService = class ResourceAuthService {
    async contractAuth(subjectId, contracts, authType) {
        if (!lodash_1.isArray(contracts) || lodash_1.isEmpty(contracts)) {
            return false;
            // throw new ArgumentError('please check code logic');
        }
        return contracts.some(x => x.subjectId === subjectId && x.subjectType === enum_1.SubjectTypeEnum.Resource && (authType === 'auth' ? x.isAuth : x.isTestAuth));
    }
    async resourceAuth(versionInfo) {
        if (lodash_1.isEmpty(versionInfo.resolveResources)) {
            return true;
        }
        const toBeAuthorizedContractIds = new Set();
        const resourceAuthTree = await this.resourceService.getResourceAuthTree(versionInfo);
        const recursionAuthTree = (recursionAuthTreeNodes) => recursionAuthTreeNodes.forEach(resolveResource => {
            resolveResource.contracts.forEach(item => toBeAuthorizedContractIds.add(item.contractId));
            resolveResource.versions.forEach(versionInfo => recursionAuthTree(versionInfo.resolveResources));
        });
        recursionAuthTree(resourceAuthTree);
        const contractMap = await this.outsideApiService.getResourceContractByContractIds([...toBeAuthorizedContractIds.values()], {
            projection: 'authStatus'
        }).then(list => new Map(list.map(x => [x.contractId, x])));
        const resourceResolveAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 1, 1);
        if (!lodash_1.isEmpty(resourceResolveAuthFailedDependencies)) {
        }
        const resourceUpstreamAuthFailedDependencies = this._getAuthFailedResourceFromTreeAuth(resourceAuthTree, contractMap, 2, Number.MAX_SAFE_INTEGER);
        if (!lodash_1.isEmpty(resourceUpstreamAuthFailedDependencies)) {
        }
    }
    /**
     * 从授权树中获取授权失败的资源
     * @param authTree
     * @param contractMap
     * @param startDeep
     * @param endDeep
     */
    _getAuthFailedResourceFromTreeAuth(authTree, contractMap, startDeep, endDeep) {
        const authFailedDependencies = [];
        const recursionAuth = (toBeAuthorizedResolveResources, deep = 1) => {
            if (deep < startDeep || endDeep > deep) {
                return;
            }
            toBeAuthorizedResolveResources.forEach(item => {
                if (!item.contracts.some(m => contractMap.get(m.contractId).isAuth)) {
                    authFailedDependencies.push(item);
                }
                item.versions.forEach(versionInfo => recursionAuth(versionInfo.resolveResources, deep + 1));
            });
        };
        recursionAuth(authTree);
        return authFailedDependencies;
    }
    /**
     * 平铺授权树
     * @param treeTree
     * @private
     */
    _flattenDependencyTree(treeTree) {
        const flattenAuthTree = [];
        const recursionFillAttribute = (children, parentNid = '', deep = 1) => {
            for (let i = 0, j = children.length; i < j; i++) {
                let model = children[i];
                Object.assign(lodash_1.pick(model, ['resourceId', 'resourceName', 'contracts']), { deep, parentNid });
                flattenAuthTree.push(lodash_1.pick(model, ['resourceId', 'resourceName', 'contracts']));
                // flattenDependencyTree.push(Object.assign(omit(model, ['dependencies']), {deep, parentNid, nid}));
                // recursionFillAttribute(model.dependencies, nid, deep + 1);
            }
        };
        recursionFillAttribute(treeTree);
        return flattenAuthTree;
    }
};
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "resourceService", void 0);
__decorate([
    midway_1.inject(),
    __metadata("design:type", Object)
], ResourceAuthService.prototype, "outsideApiService", void 0);
ResourceAuthService = __decorate([
    midway_1.provide()
], ResourceAuthService);
exports.ResourceAuthService = ResourceAuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtYXV0aC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcC9zZXJ2aWNlL3Jlc291cmNlLWF1dGgtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBdUM7QUFNdkMsbUNBQThDO0FBQzlDLHFDQUEyQztBQUczQyxJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFtQjtJQU81QixLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUF5QixFQUFFLFFBQTZCO1FBQ2xGLElBQUksQ0FBQyxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLGdCQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxLQUFLLENBQUM7WUFDYixzREFBc0Q7U0FDekQ7UUFDRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLHNCQUFlLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDM0osQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsV0FBZ0M7UUFFL0MsSUFBSSxnQkFBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLHlCQUF5QixHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXJGLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUMsc0JB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