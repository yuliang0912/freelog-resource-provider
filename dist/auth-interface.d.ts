/**
 * 授权码规则:
 * 以2开头的代表通过授权,例如200,201,202
 * 以3开头的代表标的物的合同方面存在问题或未通过授权
 * 以4开头的代表标的物本身存在问题,例如为找到标的物、标的物状态不对等错误
 * 以5开头的代表甲方或乙方存在问题,例如节点被冻结、未登陆(乙方用户认证失败)非法请求等错误
 * 以9开头代表API内部异常,例如内部API调用失败、代码异常、参数不全等错误
 */
import { ISubjectAuthResult, SubjectAuthCodeEnum, SubjectTypeEnum } from 'egg-freelog-base';
export declare class SubjectAuthResult implements ISubjectAuthResult {
    data: any;
    errorMsg: string;
    authCode: SubjectAuthCodeEnum;
    referee: SubjectTypeEnum;
    constructor(authCode?: SubjectAuthCodeEnum);
    setErrorMsg(errorMsg: string): this;
    setData(data: any): this;
    setAuthCode(authCode: SubjectAuthCodeEnum): this;
    get isAuth(): boolean;
    toJSON(): {
        referee: SubjectTypeEnum;
        authCode: SubjectAuthCodeEnum;
        isAuth: boolean;
        data: any;
        errorMsg: string;
    };
}
