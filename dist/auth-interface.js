"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectAuthResult = void 0;
/**
 * 授权码规则:
 * 以2开头的代表通过授权,例如200,201,202
 * 以3开头的代表标的物的合同方面存在问题或未通过授权
 * 以4开头的代表标的物本身存在问题,例如为找到标的物、标的物状态不对等错误
 * 以5开头的代表甲方或乙方存在问题,例如节点被冻结、未登陆(乙方用户认证失败)非法请求等错误
 * 以9开头代表API内部异常,例如内部API调用失败、代码异常、参数不全等错误
 */
const egg_freelog_base_1 = require("egg-freelog-base");
class SubjectAuthResult {
    data = null;
    errorMsg = '';
    authCode = egg_freelog_base_1.SubjectAuthCodeEnum.Default;
    referee = egg_freelog_base_1.SubjectTypeEnum.Resource;
    constructor(authCode) {
        if (authCode) {
            this.authCode = authCode;
        }
    }
    setErrorMsg(errorMsg) {
        this.errorMsg = errorMsg;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    setAuthCode(authCode) {
        this.authCode = authCode;
        return this;
    }
    get isAuth() {
        return this.authCode >= 200 && this.authCode < 300;
    }
    toJSON() {
        return {
            referee: this.referee,
            authCode: this.authCode,
            isAuth: this.isAuth,
            data: this.data,
            errorMsg: this.errorMsg
        };
    }
}
exports.SubjectAuthResult = SubjectAuthResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXV0aC1pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILHVEQUEwRjtBQUUxRixNQUFhLGlCQUFpQjtJQUUxQixJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ1osUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNkLFFBQVEsR0FBRyxzQ0FBbUIsQ0FBQyxPQUFPLENBQUM7SUFDdkMsT0FBTyxHQUFHLGtDQUFlLENBQUMsUUFBUSxDQUFDO0lBRW5DLFlBQVksUUFBOEI7UUFDdEMsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRCxXQUFXLENBQUMsUUFBZ0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFTO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUE2QjtRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztJQUN2RCxDQUFDO0lBRUQsTUFBTTtRQUNGLE9BQU87WUFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDMUIsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQXpDRCw4Q0F5Q0MifQ==