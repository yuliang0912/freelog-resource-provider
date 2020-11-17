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
// @ts-ignore
const egg_freelog_base_1 = require("egg-freelog-base");
/**
 * http://json-schema.org/understanding-json-schema/
 */
let ResourceVersionCustomPropertyValidator = class ResourceVersionCustomPropertyValidator extends egg_freelog_base_1.CommonJsonSchema {
    /**
     * 资源自定义属性格式校验
     * @param {object[]} operations 依赖资源数据
     * @returns {ValidatorResult}
     */
    validate(operations) {
        return super.validate(operations, this.schemas['/customPropertySchema']);
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
                    remark: { type: 'string', required: true, minLength: 0, maxLength: 50 },
                    key: {
                        type: 'string', required: true, minLength: 1, maxLength: 20,
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
exports.ResourceVersionCustomPropertyValidator = ResourceVersionCustomPropertyValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtdmVyc2lvbi1jdXN0b20tcHJvcGVydHktdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2V4dGVuZC9qc29uLXNjaGVtYS9yZXNvdXJjZS12ZXJzaW9uLWN1c3RvbS1wcm9wZXJ0eS12YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRDO0FBRTVDLGFBQWE7QUFDYix1REFBc0U7QUFFdEU7O0dBRUc7QUFHSCxJQUFhLHNDQUFzQyxHQUFuRCxNQUFhLHNDQUF1QyxTQUFRLG1DQUFnQjtJQUV4RTs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFVBQW9CO1FBQ3pCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOzs7T0FHRztJQUVILGtCQUFrQjtRQUNkLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDWixFQUFFLEVBQUUsdUJBQXVCO1lBQzNCLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLElBQUk7WUFDakIsUUFBUSxFQUFFLEVBQUU7WUFDWixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLElBQUk7Z0JBQ2Qsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsVUFBVSxFQUFFO29CQUNSLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUM7b0JBQ3JFLEdBQUcsRUFBRTt3QkFDRCxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTt3QkFDM0QsT0FBTyxFQUFFLHNCQUFzQjtxQkFDbEM7b0JBQ0QsWUFBWSxFQUFFO3dCQUNWLGlDQUFpQzt3QkFDakMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUU7cUJBQzlEO29CQUNELElBQUksRUFBRTt3QkFDRixJQUFJLEVBQUUsUUFBUTt3QkFDZCxRQUFRLEVBQUUsSUFBSTt3QkFDZCxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO3FCQUN4RTtvQkFDRCxjQUFjLEVBQUU7d0JBQ1osSUFBSSxFQUFFLE9BQU87d0JBQ2IsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsV0FBVyxFQUFFLElBQUk7d0JBQ2pCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLEtBQUssRUFBRTs0QkFDSCxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSTt5QkFDOUQ7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBdENHO0lBREMsYUFBSSxFQUFFOzs7O2dGQXNDTjtBQXJEUSxzQ0FBc0M7SUFGbEQsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLHlCQUF5QixDQUFDO0dBQ3RCLHNDQUFzQyxDQXNEbEQ7QUF0RFksd0ZBQXNDIn0=