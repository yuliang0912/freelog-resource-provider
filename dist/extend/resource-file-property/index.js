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
exports.ResourceFilePropertyGenerator = ResourceFilePropertyGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXh0ZW5kL3Jlc291cmNlLWZpbGUtcHJvcGVydHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLDBDQUEwQztBQUMxQyx1REFBa0Q7QUFJbEQsSUFBYSw2QkFBNkIsR0FBMUMsTUFBYSw2QkFBNkI7SUFBMUM7UUFFYSxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQXNDL0csQ0FBQztJQXBDRzs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxXQUFrRCxFQUFFLFlBQW9CO1FBQ2xHLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxLQUFLLE9BQU8sRUFBRTtZQUN4QyxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkU7UUFDRCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZGLE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsT0FBTztRQUUxQixNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDcEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMvQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQzthQUM3QztTQUNKO1FBRUQsT0FBTyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0NBQ0osQ0FBQTtBQXhDWSw2QkFBNkI7SUFGekMsY0FBSyxDQUFDLFdBQVcsQ0FBQztJQUNsQixnQkFBTyxDQUFDLCtCQUErQixDQUFDO0dBQzVCLDZCQUE2QixDQXdDekM7QUF4Q1ksc0VBQTZCIn0=