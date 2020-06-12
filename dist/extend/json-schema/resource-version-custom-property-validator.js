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
exports.ResourceVersionCustomPropertyValidator = void 0;
const midway_1 = require("midway");
const freelogCommonJsonSchema = require("egg-freelog-base/app/extend/json-schema/common-json-schema");
/**
 * http://json-schema.org/understanding-json-schema/
 */
let ResourceVersionCustomPropertyValidator = /** @class */ (() => {
    let ResourceVersionCustomPropertyValidator = class ResourceVersionCustomPropertyValidator extends freelogCommonJsonSchema {
        /**
         * 资源自定义属性格式校验
         * @param {object[]} operations 依赖资源数据
         * @returns {ValidatorResult}
         */
        validate(operations) {
            return super.validate(operations, super.getSchema('/customPropertySchema'));
        }
        /**
         * 注册所有的校验
         * @private
         */
        registerValidators() {
            super.addSchema({
                id: '/customPropertySchema',
                type: 'array',
                uniqueItems: true,
                maxItems: 30,
                items: {
                    type: 'object',
                    required: true,
                    additionalProperties: false,
                    properties: {
                        remark: { type: 'string', required: false, minLength: 1, maxLength: 15 },
                        key: {
                            type: 'string', required: true, minLength: 1, maxLength: 15,
                            pattern: '^[a-zA-Z0-9_]{1,20}$'
                        },
                        defaultValue: {
                            // 考虑到UI文本框输入,目前限定为字符串.后期可能修改为any
                            type: 'string', required: true, minLength: 1, maxLength: 30
                        },
                        type: {
                            type: 'string',
                            required: true,
                            enum: ['editableText', 'readonlyText', 'radio', 'checkbox', 'select']
                        },
                        candidateItems: {
                            type: 'array',
                            required: false,
                            uniqueItems: true,
                            maxItems: 30,
                            items: {
                                type: 'string', minLength: 1, maxLength: 15, required: true,
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
    ], ResourceVersionCustomPropertyValidator.prototype, "registerValidators", null);
    ResourceVersionCustomPropertyValidator = __decorate([
        midway_1.scope('Singleton'),
        midway_1.provide('customPropertyValidator')
    ], ResourceVersionCustomPropertyValidator);
    return ResourceVersionCustomPropertyValidator;
})();
exports.ResourceVersionCustomPropertyValidator = ResourceVersionCustomPropertyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1jdXN0b20tcHJvcGVydHktdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9qc29uLXNjaGVtYS9yZXNvdXJjZS12ZXJzaW9uLWN1c3RvbS1wcm9wZXJ0eS12YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRDO0FBRzVDLHNHQUFzRztBQUV0Rzs7R0FFRztBQUdIO0lBQUEsSUFBYSxzQ0FBc0MsR0FBbkQsTUFBYSxzQ0FBdUMsU0FBUSx1QkFBdUI7UUFFL0U7Ozs7V0FJRztRQUNILFFBQVEsQ0FBQyxVQUFvQjtZQUN6QixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFRDs7O1dBR0c7UUFFSCxrQkFBa0I7WUFDZCxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLEVBQUUsRUFBRSx1QkFBdUI7Z0JBQzNCLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixRQUFRLEVBQUUsRUFBRTtnQkFDWixLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLElBQUk7b0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztvQkFDM0IsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUM7d0JBQ3RFLEdBQUcsRUFBRTs0QkFDRCxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTs0QkFDM0QsT0FBTyxFQUFFLHNCQUFzQjt5QkFDbEM7d0JBQ0QsWUFBWSxFQUFFOzRCQUNWLGlDQUFpQzs0QkFDakMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUU7eUJBQzlEO3dCQUNELElBQUksRUFBRTs0QkFDRixJQUFJLEVBQUUsUUFBUTs0QkFDZCxRQUFRLEVBQUUsSUFBSTs0QkFDZCxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO3lCQUN4RTt3QkFDRCxjQUFjLEVBQUU7NEJBQ1osSUFBSSxFQUFFLE9BQU87NEJBQ2IsUUFBUSxFQUFFLEtBQUs7NEJBQ2YsV0FBVyxFQUFFLElBQUk7NEJBQ2pCLFFBQVEsRUFBRSxFQUFFOzRCQUNaLEtBQUssRUFBRTtnQ0FDSCxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSTs2QkFDOUQ7eUJBQ0o7cUJBQ0o7aUJBQ0o7YUFDSixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0osQ0FBQTtJQXRDRztRQURDLGFBQUksRUFBRTs7OztvRkFzQ047SUFyRFEsc0NBQXNDO1FBRmxELGNBQUssQ0FBQyxXQUFXLENBQUM7UUFDbEIsZ0JBQU8sQ0FBQyx5QkFBeUIsQ0FBQztPQUN0QixzQ0FBc0MsQ0FzRGxEO0lBQUQsNkNBQUM7S0FBQTtBQXREWSx3RkFBc0MifQ==