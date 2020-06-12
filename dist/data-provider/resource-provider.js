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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const midway_1 = require("midway");
const MongoBaseOperation = require("egg-freelog-database/lib/database/mongo-base-operation");
let ResourceProvider = /** @class */ (() => {
    let ResourceProvider = class ResourceProvider extends MongoBaseOperation {
        constructor(bucketModel) {
            super(bucketModel);
        }
    };
    ResourceProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.ResourceInfoModel')),
        __metadata("design:paramtypes", [Object])
    ], ResourceProvider);
    return ResourceProvider;
})();
exports.default = ResourceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGF0YS1wcm92aWRlci9yZXNvdXJjZS1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QztBQUM5Qyw2RkFBNkY7QUFJN0Y7SUFBQSxJQUFxQixnQkFBZ0IsR0FBckMsTUFBcUIsZ0JBQWlCLFNBQVEsa0JBQWtCO1FBQzVELFlBQStDLFdBQVc7WUFDdEQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7S0FDSixDQUFBO0lBSm9CLGdCQUFnQjtRQUZwQyxnQkFBTyxFQUFFO1FBQ1QsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUVGLFdBQUEsZUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUE7O09BRDdCLGdCQUFnQixDQUlwQztJQUFELHVCQUFDO0tBQUE7a0JBSm9CLGdCQUFnQiJ9