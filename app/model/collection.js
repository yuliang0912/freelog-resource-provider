'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform: function (doc, ret, options) {
            return {

                resourceId: ret.resourceId,
                resourceName: ret.resourceName,
                resourceType: ret.resourceType,
                userId: ret.userId,
                status: ret.status
            }
        }
    }


    const CollectionSchema = new mongoose.Schema({
        resourceId: {type: String, required: true, unique: true},
        resourceName: {type: String, required: true},
        resourceType: {type: String, required: true},
        userId: {type: Number, required: true},
        status: {type: Number, default: 0, required: true}
    }, {
        versionKey: false,
        timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
        toJSON: toObjectOptions,
        toObject: toObjectOptions
    })

    CollectionSchema.index({userId: 1});

    return mongoose.model('collection', CollectionSchema)
}