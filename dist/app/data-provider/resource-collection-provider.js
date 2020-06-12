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
let ResourceCollectionProvider = /** @class */ (() => {
    let ResourceCollectionProvider = class ResourceCollectionProvider extends MongoBaseOperation {
        constructor(model) {
            super(model);
        }
    };
    ResourceCollectionProvider = __decorate([
        midway_1.provide(),
        midway_1.scope('Singleton'),
        __param(0, midway_1.inject('model.ResourceCollection')),
        __metadata("design:paramtypes", [Object])
    ], ResourceCollectionProvider);
    return ResourceCollectionProvider;
})();
exports.default = ResourceCollectionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvZGF0YS1wcm92aWRlci9yZXNvdXJjZS1jb2xsZWN0aW9uLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLDZGQUE2RjtBQUk3RjtJQUFBLElBQXFCLDBCQUEwQixHQUEvQyxNQUFxQiwwQkFBMkIsU0FBUSxrQkFBa0I7UUFDdEUsWUFBZ0QsS0FBSztZQUNqRCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakIsQ0FBQztLQUNKLENBQUE7SUFKb0IsMEJBQTBCO1FBRjlDLGdCQUFPLEVBQUU7UUFDVCxjQUFLLENBQUMsV0FBVyxDQUFDO1FBRUYsV0FBQSxlQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQTs7T0FEOUIsMEJBQTBCLENBSTlDO0lBQUQsaUNBQUM7S0FBQTtrQkFKb0IsMEJBQTBCIn0=