'use strict'

const lodash = require('lodash')
const MongoBaseOperation = require('egg-freelog-database/lib/database/mongo-base-operation')

module.exports = class ResourceTreeProvider extends MongoBaseOperation {

    constructor(app) {
        super(app.model.TemporaryUploadFileInfo)
    }

    /**
     * 存在则更新,否则创建
     * @param uploadFileInfo
     * @returns {*}
     */
    findOrCreate(uploadFileInfo) {

        const condition = lodash.pick(uploadFileInfo, ['userId', 'resourceType', 'sha1'])

        return super.findOneAndUpdate(condition, uploadFileInfo, {new: true}).then(model => {
            return model || super.create(uploadFileInfo)
        })
    }

    //事务测试
    async test(uploadFileInfo) {
        let session = await super.model.startSession()
        session.startTransaction()
        let model = null
        try {
            model = await super.create([uploadFileInfo], {session})
            await super.create([uploadFileInfo], {session})
            await session.commitTransaction();
            session.endSession();
        } catch (e) {
            await session.abortTransaction();
            session.endSession();
            throw e
        }
        return model[0]
    }
}
