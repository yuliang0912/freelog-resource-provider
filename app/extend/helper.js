/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('uuid')
const fileCheck = require('./resource-file-check/index')
const subsidiaryFileCheck = require('./subsidiary-file-check/index')

module.exports = {

    /**
     * node-uuid
     */
    uuid: uuid,


    /**
     * 文件检查
     */
    resourceFileCheck(...args) {
        const {ctx} = this
        return fileCheck.main(ctx, ...args)
    },

    /**
     * 附属文件检查
     */
    subsidiaryFileCheck(...args) {
        const {ctx} = this
        return subsidiaryFileCheck.main(ctx, ...args)
    }
}

