/**
 * 授权码规则:
 * 以2开头的代表通过授权,例如200,201,202
 * 以3开头的代表标的物的合同方面存在问题或未通过授权
 * 以4开头的代表标的物本身存在问题,例如为找到标的物、标的物状态不对等错误
 * 以5开头的代表甲方或乙方存在问题,例如节点被冻结、未登陆(乙方用户认证失败)非法请求等错误
 * 以9开头代表API内部异常,例如内部API调用失败、代码异常、参数不全等错误
 */
import { SubjectTypeEnum } from './enum';
export declare enum SubjectAuthCodeEnum {
    /**
     * 默认授权状态,代表初始状态null.未获得授权
     */
    Default = 0,
    /**
     * 基于合同授权
     */
    BasedOnContractAuthorized = 200,
    /**
     * 基于空认证(非登录用户等)的策略授权
     */
    BasedOnNullIdentityPolicyAuthorized = 201,
    /**
     * 基于最后的授权结果缓存授权,例如token
     */
    BasedOnLatestAuthCacheAuthorized = 202,
    /**
     * 默认授权,例如单一资源或者全部上抛依赖的资源
     */
    BasedOnDefaultAuth = 203,
    /**
     * 合同未获得授权
     */
    SubjectContractUnauthorized = 301,
    /**
     * 策略授权失败
     */
    NullIdentityPolicyUnauthorized = 302,
    /**
     * 标的物合同未找到,可能为数据丢失,或者指定的合同ID错误
     */
    SubjectContractNotFound = 303,
    /**
     * 标的物合同已终止(合同本身的状态为终止态)
     */
    SubjectContractTerminated = 304,
    /**
     * 标的物合同无效,例如指定的合同与标的物之间无关联
     */
    SubjectContractInvalid = 305,
    /**
     * 标的物合同异常(合同本身的状态为异常态)
     */
    SubjectContractException = 306,
    /**
     * 标的物合同未完成签约,例如某些异常可能导致数据不完整
     */
    SubjectContractNotCompleteSign = 307,
    /**
     * 标的物不存在
     */
    SubjectNotFound = 401,
    /**
     * 标的物已下线,展品下线后即使有合约也无法查看.或者通过策略授权的资源.
     */
    SubjectNotOnline = 402,
    /**
     * 标的物异常,例如被冻结
     */
    SubjectException = 403,
    /**
     * 未通过策略的签约前置条件验证
     */
    PolicyPreconditionVerificationNotPass = 501,
    /**
     * 未登陆的用户
     */
    UserUnauthenticated = 502,
    /**
     * 用户未获得授权,例如测试节点
     */
    LoginUserUnauthorized = 503,
    /**
     * 甲方主体异常,例如节点被冻结
     */
    licensorException = 504,
    /**
     * 乙方主体异常
     */
    licenseeException = 505,
    /**
     * 授权接口异常
     */
    AuthApiException = 900,
    /**
     * 授权请求参数错误
     */
    AuthArgumentsError = 901,
    /**
     * 授权数据校验失败错误
     */
    AuthDataValidateFailedError = 902
}
export interface ISubjectAuthResult {
    subjectType: SubjectTypeEnum;
    authCode: SubjectAuthCodeEnum;
    data?: any;
    errorMsg?: string;
    isAuth: boolean;
}
export declare class SubjectAuthResult implements ISubjectAuthResult {
    data: any;
    errorMsg: string;
    authCode: SubjectAuthCodeEnum;
    subjectType: SubjectTypeEnum;
    constructor(authCode?: SubjectAuthCodeEnum);
    setErrorMsg(errorMsg: string): this;
    setData(data: any): this;
    setAuthCode(authCode: SubjectAuthCodeEnum): this;
    get isAuth(): boolean;
    toJSON(): {
        subjectType: SubjectTypeEnum;
        authCode: SubjectAuthCodeEnum;
        isAuth: boolean;
        data: any;
        errorMsg: string;
    };
}
