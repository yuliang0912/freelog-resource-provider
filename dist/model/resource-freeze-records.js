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
exports.ResourceFreezeRecordModel = void 0;
const midway_1 = require("midway");
const mongoose_model_base_1 = require("egg-freelog-base/database/mongoose-model-base");
let ResourceFreezeRecordModel = class ResourceFreezeRecordModel extends mongoose_model_base_1.MongooseModelBase {
    constructor(mongoose) {
        super(mongoose);
    }
    buildMongooseModel() {
        const OperationRecordSchema = new this.mongoose.Schema({
            operatorUserId: { type: Number, required: true },
            operatorUserName: { type: String, required: true },
            type: { type: Number, enum: [1, 2], required: true },
            reason: { type: String, default: '', required: false },
            remark: { type: String, default: '', required: false } // 备注
        }, {
            _id: false,
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: false }
        });
        const ResourceFreezeRecordSchema = new this.mongoose.Schema({
            resourceId: { type: String, required: true },
            resourceName: { type: String, required: true },
            records: { type: [OperationRecordSchema], required: true }
        }, {
            versionKey: false,
            timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' }
        });
        ResourceFreezeRecordSchema.index({ resourceId: 1 }, { unique: true });
        return this.mongoose.model('resource-freeze-records', ResourceFreezeRecordSchema);
    }
};
ResourceFreezeRecordModel = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('model.ResourceFreezeRecord'),
    __param(0, (0, midway_1.plugin)('mongoose')),
    __metadata("design:paramtypes", [Object])
], ResourceFreezeRecordModel);
exports.ResourceFreezeRecordModel = ResourceFreezeRecordModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtZnJlZXplLXJlY29yZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvcmVzb3VyY2UtZnJlZXplLXJlY29yZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLHVGQUFnRjtBQUloRixJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUEwQixTQUFRLHVDQUFpQjtJQUU1RCxZQUFnQyxRQUFRO1FBQ3BDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRUQsa0JBQWtCO1FBRWQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ25ELGNBQWMsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUM5QyxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUNoRCxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1lBQ2xELE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDO1lBQ3BELE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUMsS0FBSztTQUM3RCxFQUFFO1lBQ0MsR0FBRyxFQUFFLEtBQUs7WUFDVixVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUM7U0FDMUQsQ0FBQyxDQUFDO1FBRUgsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3hELFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztZQUMxQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7WUFDNUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO1NBQzNELEVBQUU7WUFDQyxVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7U0FDakUsQ0FBQyxDQUFDO1FBRUgsMEJBQTBCLENBQUMsS0FBSyxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFbEUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7Q0FFSixDQUFBO0FBbENZLHlCQUF5QjtJQUZyQyxJQUFBLGNBQUssRUFBQyxXQUFXLENBQUM7SUFDbEIsSUFBQSxnQkFBTyxFQUFDLDRCQUE0QixDQUFDO0lBR3JCLFdBQUEsSUFBQSxlQUFNLEVBQUMsVUFBVSxDQUFDLENBQUE7O0dBRnRCLHlCQUF5QixDQWtDckM7QUFsQ1ksOERBQXlCIn0=