/**
 * Created by yuliang on 2017/7/4.
 */

const resourceTypeEnum = require('../../enum/resource_type')

module.exports = (mimeType, resourceType) => {
    let result = {
        msg: `当前文件与指定的类型不符合,当前文件格式:${mimeType},当前指定资源类型:${resourceType}`,
        ret: 0
    }

    switch (resourceType) {
        /**
         * 音频文件meta验证
         */
        case resourceTypeEnum.AUDIO:
            if (/^audio\/(mp3|cd|wave|aiff|au|mpeg|mpeg-4|midi|wma|realAudio|vqf|oggVorbis|amr)$/i.test(mimeType)) {
                result.ret = 1
            }
            break

        /**
         * 图片文件meta验证
         */
        case resourceTypeEnum.IMAGE:
            if (/^image\/(bmp|jpg|png|gif|jpeg)$/i.test(mimeType)) {
                result.ret = 1
            }
            break

        /**
         * 视频文件meta验证
         */
        case resourceTypeEnum.VIDEO:
            if (/^video\/(mp4|avi|wmv|rmvb|rm|asf|asx|3gp|mov|m4v|dat|mkv|flv|vob)$/i.test(mimeType)) {
                result.ret = 1
            }
            break

        default:
            break
    }

    if (result.ret == 1) {
        result.msg = "success"
    }

    return result
}