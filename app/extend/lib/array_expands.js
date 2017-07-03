/**
 * Created by yuliang on 2017/6/28.
 * 数组相关拓展函数
 */

'use strict'

module.exports = {
    /**
     * 对数组做分组处理
     * @param array 目标数组
     * @param key   用于分组的key
     * @returns {Array}
     */
    groupBy (array, key) {
        if (!Array.isArray(array)) {
            throw new Error('array必须是数组')
        }
        let batchGroup = {}
        array.forEach(item => {
            if (!batchGroup.hasOwnProperty([item[key]])) {
                batchGroup[item[key]] = [];
            }
            batchGroup[item[key]].push(item);
        })
        return Object.keys(batchGroup).map(item => {
            return {key: item, value: batchGroup[item]}
        })
    },
}