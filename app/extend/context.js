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
     * 构建API返回数据格式
     * @param ret {int} 一级错误码
     * @param errCode {int} 二级错误码
     * @param msg  {string} 消息内容
     * @param data {object} 返回数据
     * @returns {{ret: number, errcode: number, msg: string}}
     */
    buildReturnObject  (ret, errCode, msg, data)  {
        let is = this.app.type
        let result = {
            ret: is.int32(ret) ? ret : app.retCodeEnum.success,
            errcode: is.int32(errCode) ? errCode : app.errCodeEnum.success,
            msg: is.string(msg) || is.number(msg) ? msg.toString() : "success"
        }
        if (!is.undefined(data)) {
            result.data = data
        }
        return result
    }
}