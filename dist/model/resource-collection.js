"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceCollectionModel = void 0;
const lodash_1 = require("lodash");
const midway_1 = require("midway");
const mongoose_model_base_1 = require("./mongoose-model-base");
let ResourceCollectionModel = /** @class */ (() => {
    var ResourceCollectionModel_1;
    let ResourceCollectionModel = ResourceCollectionModel_1 = class ResourceCollectionModel extends mongoose_model_base_1.MongooseModelBase {
        buildMongooseModel() {
            const CollectionSchema = new this.mongoose.Schema({
                resourceId: { type: String, required: true },
                resourceName: { type: String, required: true },
                resourceType: { type: String, required: true },
                authorId: { type: Number, required: true },
                authorName: { type: String, default: '' },
                userId: { type: Number, required: true },
                status: { type: Number, default: 0, required: true } // 0:正常
            }, {
                versionKey: false,
                timestamps: { createdAt: 'createDate', updatedAt: 'updateDate' },
                toJSON: ResourceCollectionModel_1.toObjectOptions,
                toObject: ResourceCollectionModel_1.toObjectOptions
            });
            CollectionSchema.index({ resourceId: 1, userId: 1 }, { unique: true });
            return this.mongoose.model('resource-collections', CollectionSchema);
        }
        static get toObjectOptions() {
            return {
                transform(doc, ret) {
                    return lodash_1.omit(ret, ['_id']);
                }
            };
        }
    };
    ResourceCollectionModel = ResourceCollectionModel_1 = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('model.ResourceCollection') // 此model可能考虑不要
    ], ResourceCollectionModel);
    return ResourceCollectionModel;
})();
exports.ResourceCollectionModel = ResourceCollectionModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9yZXNvdXJjZS1jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1DQUE0QjtBQUM1QixtQ0FBc0M7QUFDdEMsK0RBQTRFO0FBSTVFOztJQUFBLElBQWEsdUJBQXVCLCtCQUFwQyxNQUFhLHVCQUF3QixTQUFRLHVDQUFpQjtRQUUxRCxrQkFBa0I7WUFFZCxNQUFNLGdCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzlDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDMUMsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDO2dCQUM1QyxZQUFZLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQzVDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQztnQkFDeEMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFDO2dCQUN2QyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsT0FBTzthQUM3RCxFQUFFO2dCQUNDLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUM7Z0JBQzlELE1BQU0sRUFBRSx5QkFBdUIsQ0FBQyxlQUFlO2dCQUMvQyxRQUFRLEVBQUUseUJBQXVCLENBQUMsZUFBZTthQUNwRCxDQUFDLENBQUM7WUFFSCxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRW5FLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsTUFBTSxLQUFLLGVBQWU7WUFDdEIsT0FBTztnQkFDSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7b0JBQ2QsT0FBTyxhQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQzthQUNKLENBQUM7UUFDTixDQUFDO0tBQ0osQ0FBQTtJQS9CWSx1QkFBdUI7UUFGbkMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsZUFBZTtPQUN2Qyx1QkFBdUIsQ0ErQm5DO0lBQUQsOEJBQUM7S0FBQTtBQS9CWSwwREFBdUIifQ==