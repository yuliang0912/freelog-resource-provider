/**
 * Created by yuliang on 2017/7/25.
 */

const resourceEnum = require('./resource_type')

const resourceAttributes = module.exports = {
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
        attributes: []
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

module.exports.allAttributes =
    Array.prototype.concat(resourceAttributes[resourceEnum.PAGE_BUILD].attributes,
        resourceAttributes[resourceEnum.WIDGET].attributes)