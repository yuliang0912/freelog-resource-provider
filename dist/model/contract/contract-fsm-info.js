"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractFsmInfoModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("../mongoose-model-base");
let ContractFsmInfoModel = /** @class */ (() => {
    var ContractFsmInfoModel_1;
    let ContractFsmInfoModel = ContractFsmInfoModel_1 = class ContractFsmInfoModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            // _id存放contractId
            const contractFsmInfoScheme = new this.mongoose.Schema({
                policyId: { type: String, required: true },
                policyText: { type: String, required: true },
                stateMachineInfo: { type: {}, required: true },
                currentFsmState: { type: String, required: true },
                authenticationMode: { type: String, enum: ['static', 'dynamic'], required: true },
                signature: { type: String, required: true },
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: ContractFsmInfoModel_1.toObjectOptions,
                toObject: ContractFsmInfoModel_1.toObjectOptions
            });
            contractFsmInfoScheme.virtual('contractId').get(function () {
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
    ContractFsmInfoModel = ContractFsmInfoModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ContractFsmInfoModel')
    ], ContractFsmInfoModel);
    return ContractFsmInfoModel;
})();
exports.ContractFsmInfoModel = ContractFsmInfoModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QtZnNtLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZWwvY29udHJhY3QvY29udHJhY3QtZnNtLWluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1DQUFzQztBQUN0QyxnRUFBNkU7QUFJN0U7O0lBQUEsSUFBYSxvQkFBb0IsNEJBQWpDLE1BQWEsb0JBQXFCLFNBQVEsdUNBQWlCO1FBRXZELGtCQUFrQjtZQUVkLGtCQUFrQjtZQUNsQixNQUFNLHFCQUFxQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ25ELFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMxQyxnQkFBZ0IsRUFBRSxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDNUMsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUMvQyxrQkFBa0IsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQy9FLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQzthQUU1QyxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSxzQkFBb0IsQ0FBQyxlQUFlO2dCQUM1QyxRQUFRLEVBQUUsc0JBQW9CLENBQUMsZUFBZTthQUNqRCxDQUFDLENBQUM7WUFFSCxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUM1QyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFFSCxvRUFBb0U7UUFDeEUsQ0FBQztRQUVELE1BQU0sS0FBSyxlQUFlO1lBQ3RCLE9BQU87Z0JBQ0gsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHO29CQUNkLE9BQU8sZUFBTSxDQUFDLEVBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUMsRUFBRSxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsQ0FBQzthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQTtJQWxDWSxvQkFBb0I7UUFGaEMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLDRCQUE0QixDQUFDO09BQ3pCLG9CQUFvQixDQWtDaEM7SUFBRCwyQkFBQztLQUFBO0FBbENZLG9EQUFvQiJ9