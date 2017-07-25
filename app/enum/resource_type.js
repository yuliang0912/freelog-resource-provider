/**
 * Created by yuliang on 2017/7/4.
 */

'use strict'

const resourceTypeEnum = {
    /**
     * 图片资源
     */
    IMAGE: "Image",
    /**
     * 音频资源
     */
    AUDIO: "Audio",
    /**
     * 视频资源
     */
    VIDEO: "Video",
    /**
     * markdown资源
     */
    MARKDOWN: "MarkDown",
    /**
     * 组合资源
     */
    PAGE_BUILD: "PageBuild",
    /**
     * 滑块
     */
    REVEAL_SLIDE: "RevealSlide",
    /**
     * 插件
     */
    WIDGET: "Widget",
}



let cache
module.exports = Object.assign(resourceTypeEnum, {
    get ArrayList() {
        if (!cache) {
            cache = Object.values(resourceTypeEnum)
        }
        return cache
    }
})
