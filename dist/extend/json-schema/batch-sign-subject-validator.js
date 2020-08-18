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
exports.BatchSignSubjectValidator = void 0;
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
let BatchSignSubjectValidator = class BatchSignSubjectValidator extends freelogCommonJsonSchema {
    /**
     * 解决依赖资源格式校验
     * @param {object[]} operations 解决依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, super.getSchema('/signSubjectSchema'));
    }
    /**
     * 注册所有的校验
     * @private
     */
    registerValidators() {
        super.addSchema({
            id: '/signSubjectSchema',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'object',
                required: true,
                additionalProperties: false,
                minItems: 1,
                maxItems: 100,
                properties: {
                    subjectId: { type: 'string', required: true, format: 'mongoObjectId' },
                    minItems: 1,
                    maxItems: 100,
                    versions: {
                        type: 'array',
                        required: true,
                        additionalProperties: false,
                        properties: {
                            policyId: { type: 'string', required: true, format: 'md5' },
                            version: { type: 'string', required: true, minLength: 1, maxLength: 100 },
                            operation: { type: 'integer', enum: [0, 1] },
                        }
                    }
                }
            }
        });
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BatchSignSubjectValidator.prototype, "registerValidators", null);
BatchSignSubjectValidator = __decorate([
    midway_1.scope('Singleton'),
    midway_1.provide('batchSignSubjectValidator')
], BatchSignSubjectValidator);
exports.BatchSignSubjectValidator = BatchSignSubjectValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmF0Y2gtc2lnbi1zdWJqZWN0LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9leHRlbmQvanNvbi1zY2hlbWEvYmF0Y2gtc2lnbi1zdWJqZWN0LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBNEM7QUFHNUMsc0dBQXNHO0FBSXRHLElBQWEseUJBQXlCLEdBQXRDLE1BQWEseUJBQTBCLFNBQVEsdUJBQXVCO0lBRWxFOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsVUFBb0I7UUFDekIsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsa0JBQWtCO1FBQ2QsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNaLEVBQUUsRUFBRSxvQkFBb0I7WUFDeEIsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsSUFBSTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsVUFBVSxFQUFFO29CQUNSLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFDO29CQUNwRSxRQUFRLEVBQUUsQ0FBQztvQkFDWCxRQUFRLEVBQUUsR0FBRztvQkFDYixRQUFRLEVBQUU7d0JBQ04sSUFBSSxFQUFFLE9BQU87d0JBQ2IsUUFBUSxFQUFFLElBQUk7d0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSzt3QkFDM0IsVUFBVSxFQUFFOzRCQUNSLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDOzRCQUN6RCxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFDOzRCQUN2RSxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQzt5QkFDN0M7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBN0JHO0lBREMsYUFBSSxFQUFFOzs7O21FQTZCTjtBQTVDUSx5QkFBeUI7SUFGckMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLDJCQUEyQixDQUFDO0dBQ3hCLHlCQUF5QixDQTZDckM7QUE3Q1ksOERBQXlCIn0=