"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("../mongoose-model-base");
let ContractInfoModel = /** @class */ (() => {
    var ContractInfoModel_1;
    let ContractInfoModel = ContractInfoModel_1 = class ContractInfoModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const contractInfoScheme = new this.mongoose.Schema({
                contractCode: { type: String, required: true },
                contractName: { type: String, required: true },
                partyOneId: { type: String, required: true },
                partyOneName: { type: String, required: true },
                partyOneOwnerId: { type: String, required: true },
                partyOneOwnerName: { type: String, required: true },
                partyTwoId: { type: String, required: true },
                partyTwoName: { type: String, required: true },
                partyTwoOwnerId: { type: String, required: true },
                partyTwoOwnerName: { type: String, required: true },
                subjectMatterId: { type: String, required: true },
                subjectMatterName: { type: String, required: true },
                subjectMatterType: { type: Number, required: true },
                execSortId: { type: Number, default: 0, required: true },
                signature: { type: String, required: true },
                status: { type: Number, default: 0, required: true },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: ContractInfoModel_1.toObjectOptions,
                toObject: ContractInfoModel_1.toObjectOptions
            });
            contractInfoScheme.index({ partyOneId: 1, partyOneOwnerId: 1 });
            contractInfoScheme.index({ partyTwoId: 1, partyTwoOwnerId: 1 });
            contractInfoScheme.index({ subjectMatterId: 1, subjectMatterType: 1 });
            contractInfoScheme.virtual('contractId').get(function () {
                return this.id;
            });
            contractInfoScheme.virtual('isDefault').get(function () {
                return this.execSortId === 1;
            });
            // return this.mongoose.model('resource-infos', resourceInfoScheme);
        }
        static get toObjectOptions() {
            return {
                getters: true,
                virtuals: true,
                transform(doc, ret) {
                    return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id', 'execSortId']));
                }
            };
        }
    };
    ContractInfoModel = ContractInfoModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ContractInfoModel')
    ], ContractInfoModel);
    return ContractInfoModel;
})();
exports.ContractInfoModel = ContractInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RlbC9jb250cmFjdC9jb250cmFjdC1pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUFvQztBQUNwQyxtQ0FBc0M7QUFDdEMsZ0VBQTZFO0FBSTdFOztJQUFBLElBQWEsaUJBQWlCLHlCQUE5QixNQUFhLGlCQUFrQixTQUFRLHVDQUFpQjtRQUVwRCxrQkFBa0I7WUFFZCxNQUFNLGtCQUFrQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hELFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDNUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM1QyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFDLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDNUMsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMvQyxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDakQsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMxQyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLGVBQWUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDL0MsaUJBQWlCLEVBQUUsRUFBQyxJQUFJLEVB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