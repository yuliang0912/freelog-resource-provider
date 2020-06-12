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
let ResourceFilePropertyGenerator = /** @class */ (() => {
    let ResourceFilePropertyGenerator = class ResourceFilePropertyGenerator {
        constructor() {
            this.imagePropertyMap = new Map([['width', '宽度'], ['height', '高度'], ['type', '类型'], ['mime', 'mime']]);
        }
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
        midway_1.scope('Singleton'),
        midway_1.provide('resourceFilePropertyGenerator')
    ], ResourceFilePropertyGenerator);
    return ResourceFilePropertyGenerator;
})();
exports.ResourceFilePropertyGenerator = ResourceFilePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3Jlc291cmNlLWZpbGUtcHJvcGVydHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLDBDQUEwQztBQUMxQyx1REFBa0Q7QUFJbEQ7SUFBQSxJQUFhLDZCQUE2QixHQUExQyxNQUFhLDZCQUE2QjtRQUExQztZQUVhLHFCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBc0MvRyxDQUFDO1FBcENHOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFdBQWtELEVBQUUsWUFBb0I7WUFDbEcsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxFQUFFO2dCQUN4QyxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdkU7WUFDRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTztZQUUxQixNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUM1QixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzlDLE1BQU0sSUFBSSxtQ0FBZ0IsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQ3BFLENBQUMsQ0FBQyxDQUFDO1lBRUgsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQy9DLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDNUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO2lCQUM3QzthQUNKO1lBRUQsT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDO0tBQ0osQ0FBQTtJQXhDWSw2QkFBNkI7UUFGekMsY0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQixnQkFBTyxDQUFDLCtCQUErQixDQUFDO09BQzVCLDZCQUE2QixDQXdDekM7SUFBRCxvQ0FBQztLQUFBO0FBeENZLHNFQUE2QiJ9