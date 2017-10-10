/**
 * Created by yuliang on 2017/6/30.
 */

'use strict'

const uuid = require('node-uuid')
const fileMetaHelper = require('./file/file_meta_helper')
const polifyParseFactory = require('./helper/policy_parse_factory')

module.exports = {

    /**
     * fileMeta获取
     */
    fileMetaHelper: fileMetaHelper,

    /**
     * node-uuid
     */
    uuid: uuid,

    /**
     * 授权语言转换
     */
    policyParse: polifyParseFactory.parse
}

