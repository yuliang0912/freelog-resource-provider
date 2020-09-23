"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectAuthResult = exports.SubjectAuthCodeEnum = void 0;
/**
 * 授权码规则:
 * 以2开头的代表通过授权,例如200,201,202
 * 以3开头的代表标的物的合同方面存在问题或未通过授权
 * 以4开头的代表标的物本身存在问题,例如为找到标的物、标的物状态不对等错误
 * 以5开头的代表甲方或乙方存在问题,例如节点被冻结、未登陆(乙方用户认证失败)非法请求等错误
 * 以9开头代表API内部异常,例如内部API调用失败、代码异常、参数不全等错误
 */
const enum_1 = require("./enum");
var SubjectAuthCodeEnum;
(function (SubjectAuthCodeEnum) {
    /**
     * 默认授权状态,代表初始状态null.未获得授权
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["Default"] = 0] = "Default";
    /**
     * 基于合同授权
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["BasedOnContractAuthorized"] = 200] = "BasedOnContractAuthorized";
    /**
     * 基于空认证(非登录用户等)的策略授权
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["BasedOnNullIdentityPolicyAuthorized"] = 201] = "BasedOnNullIdentityPolicyAuthorized";
    /**
     * 基于最后的授权结果缓存授权,例如token
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["BasedOnLatestAuthCacheAuthorized"] = 202] = "BasedOnLatestAuthCacheAuthorized";
    /**
     * 默认授权,例如单一资源或者全部上抛依赖的资源
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["BasedOnDefaultAuth"] = 203] = "BasedOnDefaultAuth";
    /**
     * 合同未获得授权
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractUnauthorized"] = 301] = "SubjectContractUnauthorized";
    /**
     * 策略授权失败
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["NullIdentityPolicyUnauthorized"] = 302] = "NullIdentityPolicyUnauthorized";
    /**
     * 标的物合同未找到,可能为数据丢失,或者指定的合同ID错误
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractNotFound"] = 303] = "SubjectContractNotFound";
    /**
     * 标的物合同已终止(合同本身的状态为终止态)
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractTerminated"] = 304] = "SubjectContractTerminated";
    /**
     * 标的物合同无效,例如指定的合同与标的物之间无关联
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractInvalid"] = 305] = "SubjectContractInvalid";
    /**
     * 标的物合同异常(合同本身的状态为异常态)
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractException"] = 306] = "SubjectContractException";
    /**
     * 标的物合同未完成签约,例如某些异常可能导致数据不完整
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectContractNotCompleteSign"] = 307] = "SubjectContractNotCompleteSign";
    /**
     * 标的物不存在
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectNotFound"] = 401] = "SubjectNotFound";
    /**
     * 标的物已下线,展品下线后即使有合约也无法查看.或者通过策略授权的资源.
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectNotOnline"] = 402] = "SubjectNotOnline";
    /**
     * 标的物异常,例如被冻结
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["SubjectException"] = 403] = "SubjectException";
    /**
     * 未通过策略的签约前置条件验证
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["PolicyPreconditionVerificationNotPass"] = 501] = "PolicyPreconditionVerificationNotPass";
    /**
     * 未登陆的用户
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["UserUnauthenticated"] = 502] = "UserUnauthenticated";
    /**
     * 用户未获得授权,例如测试节点
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["LoginUserUnauthorized"] = 503] = "LoginUserUnauthorized";
    /**
     * 甲方主体异常,例如节点被冻结
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["licensorException"] = 504] = "licensorException";
    /**
     * 乙方主体异常
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["licenseeException"] = 505] = "licenseeException";
    /**
     * 授权接口异常
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["AuthApiException"] = 900] = "AuthApiException";
    /**
     * 授权请求参数错误
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["AuthArgumentsError"] = 901] = "AuthArgumentsError";
    /**
     * 授权数据校验失败错误
     */
    SubjectAuthCodeEnum[SubjectAuthCodeEnum["AuthDataValidateFailedError"] = 902] = "AuthDataValidateFailedError";
})(SubjectAuthCodeEnum = exports.SubjectAuthCodeEnum || (exports.SubjectAuthCodeEnum = {}));
class SubjectAuthResult {
    constructor(authCode) {
        this.data = null;
        this.errorMsg = '';
        this.authCode = SubjectAuthCodeEnum.Default;
        this.subjectType = enum_1.SubjectTypeEnum.Resource;
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
            subjectType: this.subjectType,
            authCode: this.authCode,
            isAuth: this.isAuth,
            data: this.data,
            errorMsg: this.errorMsg
        };
    }
}
exports.SubjectAuthResult = SubjectAuthResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXV0aC1pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILGlDQUF1QztBQUV2QyxJQUFZLG1CQW9IWDtBQXBIRCxXQUFZLG1CQUFtQjtJQUUzQjs7T0FFRztJQUNILG1FQUFXLENBQUE7SUFFWDs7T0FFRztJQUNILHlHQUErQixDQUFBO0lBRS9COztPQUVHO0lBQ0gsNkhBQXlDLENBQUE7SUFFekM7O09BRUc7SUFDSCx1SEFBc0MsQ0FBQTtJQUV0Qzs7T0FFRztJQUNILDJGQUF3QixDQUFBO0lBRXhCOztPQUVHO0lBQ0gsNkdBQWlDLENBQUE7SUFFakM7O09BRUc7SUFDSCxtSEFBb0MsQ0FBQTtJQUVwQzs7T0FFRztJQUNILHFHQUE2QixDQUFBO0lBRTdCOztPQUVHO0lBQ0gseUdBQStCLENBQUE7SUFFL0I7O09BRUc7SUFDSCxtR0FBNEIsQ0FBQTtJQUU1Qjs7T0FFRztJQUNILHVHQUE4QixDQUFBO0lBRTlCOztPQUVHO0lBQ0gsbUhBQW9DLENBQUE7SUFFcEM7O09BRUc7SUFDSCxxRkFBcUIsQ0FBQTtJQUVyQjs7T0FFRztJQUNILHVGQUFzQixDQUFBO0lBRXRCOztPQUVHO0lBQ0gsdUZBQXNCLENBQUE7SUFFdEI7O09BRUc7SUFDSCxpSUFBMkMsQ0FBQTtJQUUzQzs7T0FFRztJQUNILDZGQUF5QixDQUFBO0lBRXpCOztPQUVHO0lBQ0gsaUdBQTJCLENBQUE7SUFFM0I7O09BRUc7SUFDSCx5RkFBdUIsQ0FBQTtJQUV2Qjs7T0FFRztJQUNILHlGQUF1QixDQUFBO0lBRXZCOztPQUVHO0lBQ0gsdUZBQXNCLENBQUE7SUFFdEI7O09BRUc7SUFDSCwyRkFBd0IsQ0FBQTtJQUV4Qjs7T0FFRztJQUNILDZHQUFpQyxDQUFBO0FBQ3JDLENBQUMsRUFwSFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFvSDlCO0FBZUQsTUFBYSxpQkFBaUI7SUFPMUIsWUFBWSxRQUE4QjtRQUwxQyxTQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNkLGFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7UUFDdkMsZ0JBQVcsR0FBRyxzQkFBZSxDQUFDLFFBQVEsQ0FBQztRQUduQyxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFnQjtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQTZCO1FBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxNQUFNO1FBQ0YsT0FBTztZQUNILFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUMxQixDQUFBO0lBQ0wsQ0FBQztDQUNKO0FBekNELDhDQXlDQyJ9