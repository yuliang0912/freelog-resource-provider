"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePolicyCompiler = void 0;
const midway_1 = require("midway");
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
let ResourcePolicyCompiler = class ResourcePolicyCompiler {
    /**
     * 编译策略文本
     * @param policyText
     * @param policyName
     * @returns {PolicyInfo}
     */
    compilePolicyText(policyText, policyName) {
        return null;
        // return {
        //     policyId: this.generatePolicyId(policyText), policyText, policyName,
        //     fsmDescriptionInfo: {
        //         initial: {
        //             authorization: [
        //                 'active', 'presentable'
        //             ],
        //             transition: {
        //                 terminate: null
        //             }
        //         }
        //     }
        // };
    }
    /**
     * 生成策略Id
     * @param policyText
     */
    generatePolicyId(policyText) {
        return crypto_helper_1.md5(policyText.replace(/\s{2,}/g, '').toLowerCase());
    }
};
ResourcePolicyCompiler = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], ResourcePolicyCompiler);
exports.ResourcePolicyCompiler = ResourcePolicyCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UtcG9saWN5LWNvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9yZXNvdXJjZS1wb2xpY3ktY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBRXRDLG9GQUFxRTtBQUlyRSxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtJQUUvQjs7Ozs7T0FLRztJQUNILGlCQUFpQixDQUFDLFVBQVUsRUFBRSxVQUFVO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO1FBQ1osV0FBVztRQUNYLDJFQUEyRTtRQUMzRSw0QkFBNEI7UUFDNUIscUJBQXFCO1FBQ3JCLCtCQUErQjtRQUMvQiwwQ0FBMEM7UUFDMUMsaUJBQWlCO1FBQ2pCLDRCQUE0QjtRQUM1QixrQ0FBa0M7UUFDbEMsZ0JBQWdCO1FBQ2hCLFlBQVk7UUFDWixRQUFRO1FBQ1IsS0FBSztJQUNULENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQkFBZ0IsQ0FBQyxVQUFrQjtRQUMvQixPQUFPLG1CQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNoRSxDQUFDO0NBQ0osQ0FBQTtBQWhDWSxzQkFBc0I7SUFGbEMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTixzQkFBc0IsQ0FnQ2xDO0FBaENZLHdEQUFzQiJ9