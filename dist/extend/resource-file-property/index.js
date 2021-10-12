"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceFilePropertyGenerator = void 0;
const midway_1 = require("midway");
const probe = require("probe-image-size");
const egg_freelog_base_1 = require("egg-freelog-base");
let ResourceFilePropertyGenerator = class ResourceFilePropertyGenerator {
    imagePropertyMap = new Map([['width', '宽度'], ['height', '高度'], ['type', '类型'], ['mime', 'mime']]);
    /**
     * 获取资源文件属性
     * @param {{fileUrl: string; fileSize: number}} storageInfo
     * @param {string} resourceType
     * @returns {Promise<object[]>}
     */
    async getResourceFileProperty(storageInfo, resourceType) {
        let systemProperties = [];
        if (resourceType.toLowerCase() === 'image') {
            systemProperties = await this.getImageProperty(storageInfo.fileUrl);
        }
        systemProperties.unshift({ name: '文件大小', key: 'fileSize', value: storageInfo.fileSize });
        return systemProperties;
    }
    /**
     * 获取图片基础属性
     * @param fileUrl
     * @returns {Promise<object[]>}
     */
    async getImageProperty(fileUrl) {
        const systemProperties = [];
        const result = await probe(fileUrl).catch(error => {
            throw new egg_freelog_base_1.ApplicationError('file is unrecognized image format');
        });
        for (const [key, value] of Object.entries(result)) {
            if (this.imagePropertyMap.has(key)) {
                const name = this.imagePropertyMap.get(key);
                systemProperties.push({ name, key, value });
            }
        }
        return systemProperties;
    }
};
ResourceFilePropertyGenerator = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('resourceFilePropertyGenerator')
], ResourceFilePropertyGenerator);
exports.ResourceFilePropertyGenerator = ResourceFilePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3Jlc291cmNlLWZpbGUtcHJvcGVydHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLDBDQUEwQztBQUMxQyx1REFBa0Q7QUFJbEQsSUFBYSw2QkFBNkIsR0FBMUMsTUFBYSw2QkFBNkI7SUFFN0IsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFM0c7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsdUJBQXVCLENBQUMsV0FBa0QsRUFBRSxZQUFvQjtRQUNsRyxJQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxPQUFPLEVBQUU7WUFDeEMsZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUN2RixPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU87UUFFMUIsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDL0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7YUFDN0M7U0FDSjtRQUVELE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztDQUNKLENBQUE7QUF4Q1ksNkJBQTZCO0lBRnpDLElBQUEsY0FBSyxFQUFDLFdBQVcsQ0FBQztJQUNsQixJQUFBLGdCQUFPLEVBQUMsK0JBQStCLENBQUM7R0FDNUIsNkJBQTZCLENBd0N6QztBQXhDWSxzRUFBNkIifQ==