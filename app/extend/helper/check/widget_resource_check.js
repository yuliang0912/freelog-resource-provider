/**
 * Created by yuliang on 2017/10/23.
 */

'use strict'

const commonRegex = require('egg-freelog-base/app/extend/helper/common_regex')

module.exports = {

    /**
     * 检查文件
     * @param resourceName
     * @param meta
     * @param chunks
     */
    async checkFile(resourceName, meta, fileBuffer, mimeType){

        if (!Reflect.has(meta, 'widgetName')) {
            return {
                errors: [new Error("meta中必须包含widgetName属性")]
            }
        }

        let widgetName = meta.widgetName

        if (!commonRegex.widgetName.test(widgetName)) {
            return {
                errors: [new Error("widgetName命名不符合规范")]
            }
        }

        let isExists = await eggApp.dataProvider.componentsProvider.count({widgetName}).then(data => parseInt(data.count))

        if (isExists) {
            return {
                errors: [new Error("当前widgetName已经被使用")]
            }
        }

        Reflect.deleteProperty(meta, 'widgetName')

        return {
            systemMeta: {widgetName}
        }
    }
}