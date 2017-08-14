/**
 * Created by yuliang on 2017/7/25.
 */

const mongoModels = require('../models/index')

module.exports = app => {
    return class ResourceTreeService extends app.Service {

        /**
         * 创建资源关系
         */
        createResourceTree(userId, resourceId, parentId) {
            if (!parentId) {
                return mongoModels.relation.create({resourceId, userId})
            }

            return mongoModels.relation.findOneAndUpdate({resourceId: parentId}, {
                $addToSet: {children: resourceId},
                updateDate: Date.now(),
            }, {select: 'parentIds'}).then((parentResource) => {
                return mongoModels.relation.create({
                    resourceId, userId,
                    parentIds: parentResource.parentIds.concat(parentId)
                })
            }).catch(console.error)
        }

        /**
         * 获取root节点
         * @param userId
         * @returns {*|Query|T}
         */
        rootResourceList(userId) {
            return mongoModels.relation.find({userId, parentIds: {$size: 0}})
        }
    }
}