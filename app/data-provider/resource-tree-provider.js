/**
 * Created by yuliang on 2017/11/6.
 */

'use strict'

const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class ResourceTreeProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.Relation)
        this.Relation = app.model.Relation
    }

    /**
     * 创建资源关系
     */
    createResourceTree(userId, resourceId, parentId) {

        if (!parentId) {
            return super.create({resourceId, userId})
        }

        return this.Relation.findOneAndUpdate({resourceId: parentId}, {
            $addToSet: {children: resourceId}
        }, {select: 'parentIds'}).then((parentResource) => {
            return super.create({
                resourceId, userId,
                parentIds: parentResource.parentIds.concat(parentId)
            })
        })
    }

    /**
     * 获取root节点
     * @param userId
     * @returns {*|Query|T}
     */
    rootResourceList(userId) {
        return super.find({userId, parentIds: {$size: 0}})
    }
}
