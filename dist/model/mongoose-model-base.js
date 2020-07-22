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
exports.MongooseModelBase = void 0;
const midway_1 = require("midway");
let MongooseModelBase = class MongooseModelBase {
    constructor(mongoose) {
        this.mongoose = mongoose;
        if (mongoose._readyState === 1) {
            return this.buildMongooseModel();
        }
        else {
            mongoose.reconnect();
            throw new Error('database connection error!');
        }
    }
    buildMongooseModel(...args) {
        throw new Error('not implemented');
    }
};
MongooseModelBase = __decorate([
    __param(0, midway_1.plugin('mongoose')),
    __metadata("design:paramtypes", [Object])
], MongooseModelBase);
exports.MongooseModelBase = MongooseModelBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29vc2UtbW9kZWwtYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9tb25nb29zZS1tb2RlbC1iYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE4QjtBQUU5QixJQUFhLGlCQUFpQixHQUE5QixNQUFhLGlCQUFpQjtJQUkxQixZQUFnQyxRQUFRO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUNwQzthQUFNO1lBQ0gsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtJQUNMLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxHQUFHLElBQUk7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FDSixDQUFBO0FBakJZLGlCQUFpQjtJQUliLFdBQUEsZUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztHQUp0QixpQkFBaUIsQ0FpQjdCO0FBakJZLDhDQUFpQiJ9