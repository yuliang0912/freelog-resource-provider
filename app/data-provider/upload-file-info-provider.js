'use strict'

const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class ResourceTreeProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.UploadFileInfo)
    }

    create(uploadFileInfo) {

        const condition = {
            userId: uploadFileInfo.userId,
            sha1: uploadFileInfo.sha1
        }

        return super.findOneAndUpdate(condition, {resourceType: uploadFileInfo.resourceType}).then(oldInfo => {
            return oldInfo ? super.findOne(condition) : super.create(uploadFileInfo)
        })
    }

}
