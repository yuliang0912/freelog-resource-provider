/**
 * Created by yuliang on 2017/7/4.
 */

const aliOss = require('./lib/alioss_upload')

let install

module.exports = uploadConfig => (function () {
    if (!install) {
        switch (uploadConfig.curr) {
            case "aliOss":
            default:
                install = new aliOss(uploadConfig.aliOss)
                break;
        }
    }

    return {
        /**
         * buffer形式上传
         * @param fileBuffer
         * @param resourceType
         * @param fileName
         * @returns {*|Promise.<T>}
         */
        putBuffer(fileBuffer, resourceType, fileName)
        {
            return install.putBuffer(buildPathUrl(resourceType, fileName), fileBuffer)
        },

        /**
         * stream形式上传
         * @param fileStream
         * @param resourceType
         * @param fileName
         * @returns {*|Object|Promise.<T>}
         */
        putStream(fileStream, resourceType, fileName){
            return install.putStream(buildPathUrl(resourceType, fileName), fileStream)
        }
    }
})()

const buildPathUrl = (resourceType, fileName) => {
    return `resources/${resourceType}/${fileName}`
}