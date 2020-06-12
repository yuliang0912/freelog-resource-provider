"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractChangedHistoryModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("../mongoose-model-base");
let ContractChangedHistoryModel = /** @class */ (() => {
    var ContractChangedHistoryModel_1;
    let ContractChangedHistoryModel = ContractChangedHistoryModel_1 = class ContractChangedHistoryModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const contractChangedHistoryScheme = new this.mongoose.Schema({
                _id: { type: this.mongoose.Schema.ObjectId, required: true },
                histories: { type: Array, required: true },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: ContractChangedHistoryModel_1.toObjectOptions,
                toObject: ContractChangedHistoryModel_1.toObjectOptions
            });
            contractChangedHistoryScheme.virtual('contractId').get(function () {
                return this.id;
            });
            // return this.mongoose.model('resource-infos', resourceInfoScheme);
        }
        static get toObjectOptions() {
            return {
                transform(doc, ret) {
                    return lodash_1.assign({ contractId: doc.id }, lodash_1.omit(ret, ['_id', 'id']));
                }
            };
        }
    };
    ContractChangedHistoryModel = ContractChangedHistoryModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ContractChangedHistoryModel')
    ], ContractChangedHistoryModel);
    return ContractChangedHistoryModel;
})();
exports.ContractChangedHistoryModel = ContractChangedHistoryModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtY2hhbmdlZC1oaXN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGVsL2NvbnRyYWN0L2NvbnRyYWN0LWNoYW5nZWQtaGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQ0FBb0M7QUFDcEMsbUNBQXNDO0FBQ3RDLGdFQUE2RTtBQUk3RTs7SUFBQSxJQUFhLDJCQUEyQixtQ0FBeEMsTUFBYSwyQkFBNEIsU0FBUSx1Q0FBaUI7UUFFOUQsa0JBQWtCO1lBRWQsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUMxRCxHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzFELFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUMzQyxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSw2QkFBMkIsQ0FBQyxlQUFlO2dCQUNuRCxRQUFRLEVBQUUsNkJBQTJCLENBQUMsZUFBZTthQUN4RCxDQUFDLENBQUM7WUFFSCw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNuRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxvRUFBb0U7UUFDeEUsQ0FBQztRQUVELE1BQU0sS0FBSyxlQUFlO1lBQ3RCLE9BQU87Z0JBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHO29CQUNkLE9BQU8sZUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRSxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsQ0FBQzthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQTtJQTNCWSwyQkFBMkI7UUFGdkMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLG1DQUFtQyxDQUFDO09BQ2hDLDJCQUEyQixDQTJCdkM7SUFBRCxrQ0FBQztLQUFBO0FBM0JZLGtFQUEyQiJ9