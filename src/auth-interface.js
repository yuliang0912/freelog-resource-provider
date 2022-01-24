"use strict";
exports.__esModule = true;
exports.SubjectAuthResult = void 0;
/**
 * 授权码规则:
 * 以2开头的代表通过授权,例如200,201,202
 * 以3开头的代表标的物的合同方面存在问题或未通过授权
 * 以4开头的代表标的物本身存在问题,例如为找到标的物、标的物状态不对等错误
 * 以5开头的代表甲方或乙方存在问题,例如节点被冻结、未登陆(乙方用户认证失败)非法请求等错误
 * 以9开头代表API内部异常,例如内部API调用失败、代码异常、参数不全等错误
 */
var egg_freelog_base_1 = require("egg-freelog-base");
var SubjectAuthResult = /** @class */ (function () {
    function SubjectAuthResult(authCode) {
        this.data = null;
        this.errorMsg = '';
        this.authCode = egg_freelog_base_1.SubjectAuthCodeEnum.Default;
        this.referee = egg_freelog_base_1.SubjectTypeEnum.Resource;
        if (authCode) {
            this.authCode = authCode;
        }
    }
    SubjectAuthResult.prototype.setErrorMsg = function (errorMsg) {
        this.errorMsg = errorMsg;
        return this;
    };
    SubjectAuthResult.prototype.setData = function (data) {
        this.data = data;
        return this;
    };
    SubjectAuthResult.prototype.setAuthCode = function (authCode) {
        this.authCode = authCode;
        return this;
    };
    Object.defineProperty(SubjectAuthResult.prototype, "isAuth", {
        get: function () {
            return this.authCode >= 200 && this.authCode < 300;
        },
        enumerable: false,
        configurable: true
    });
    SubjectAuthResult.prototype.toJSON = function () {
        return {
            referee: this.referee,
            authCode: this.authCode,
            isAuth: this.isAuth,
            data: this.data,
            errorMsg: this.errorMsg
        };
    };
    return SubjectAuthResult;
}());
exports.SubjectAuthResult = SubjectAuthResult;
