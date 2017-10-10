/**
 * Created by yuliang on 2017/7/25.
 */

'use strict'

let resourceAttributes = null

module.exports = (resourceEnum) => {
    if (!resourceAttributes) {
        resourceAttributes = {
            [resourceEnum.IMAGE]: {
                attributes: []
            },
            [resourceEnum.AUDIO]: {
                attributes: []
            },
            [resourceEnum.VIDEO]: {
                attributes: []
            },
            [resourceEnum.MARKDOWN]: {
                attributes: ['md']
            },
            [resourceEnum.REVEAL_SLIDE]: {
                attributes: []
            },
            [resourceEnum.PAGE_BUILD]: {
                attributes: ['widgets', 'layout']
            },
            [resourceEnum.WIDGET]: {
                attributes: ['html', 'css', 'javascript']
            }
        }

        resourceAttributes.allAttributes =
            Array.prototype.concat(resourceAttributes[resourceEnum.PAGE_BUILD].attributes,
                resourceAttributes[resourceEnum.WIDGET].attributes,
                resourceAttributes[resourceEnum.MARKDOWN].attributes)
    }
    return resourceAttributes
}