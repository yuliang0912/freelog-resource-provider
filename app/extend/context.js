/**
 * Created by yuliang on 2017/6/30.
 */

module.exports = {
    /**
     * 定义成功返回的API数据结构
     * @param data
     * @returns {exports}
     */
    success(data){

        let {retCodeEnum, errCodeEnum} = this.app

        this.body = this.buildReturnObject(retCodeEnum.success, errCodeEnum.success, 'success', data)

        return this
    },

    /**
     * 定义错误处理->此处抛出异常会由middleware=>error_handler处理
     * @param msg
     * @param errCode
     * @param retCode
     */
    error (msg, errCode, retCode)  {
        let {retCodeEnum, errCodeEnum} = this.app
        throw Object.assign(new Error(msg || '接口口内部异常'),
            {
                retCode: retCode ? retCode : retCodeEnum.serverError,
                errCode: errCode ? errCode : errCodeEnum.apiError
            });
    },

    /**
     * 校验参数,有错误就抛出异常
     * @returns {exports}
     */
    validate(){
        if (!this.errors || this.errors.length < 1) {
            return this
        }

        let msg = '参数校验失败,details:' + JSON.stringify(this.errors);
        throw Object.assign(new Error(msg), {errCode: this.app.errCodeEnum.paramTypeError});
    },

    /**
     * 构建API返回数据格式
     * @param ret {int} 一级错误码
     * @param errCode {int} 二级错误码
     * @param msg  {string} 消息内容
     * @param data {object} 返回数据
     * @returns {{ret: number, errcode: number, msg: string}}
     */
    buildReturnObject(ret, errCode, msg, data){
        let {type, retCodeEnum, errCodeEnum} = this.app
        let result = {
            ret: type.int32(ret) ? ret : retCodeEnum.success,
            errcode: type.int32(errCode) ? errCode : errCodeEnum.success,
            msg: type.string(msg) || type.number(msg) ? msg.toString() : "success",
            data: type.nullOrUndefined(data) ? null : data
        }
        return result
    }
}