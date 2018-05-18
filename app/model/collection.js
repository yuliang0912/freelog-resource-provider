'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform: function (doc, ret, options) {
            return {
                resourceId: ret.resourceId,
                resourceName: ret.resourceName,
                resourceType: ret.resourceType,
                authorId: ret.authorId,
                authorName: ret.authorName,
                userId: ret.userId,
                createDate: ret.createDate,
                updateDate: ret.updateDate,
                status: ret.status
            }
        }
    }


    const CollectionSchema = new mongoose.Schema({
        resourceId: {type: String, required: true, unique: true},
        resourceName: {type: String, required: true},
        resourceType: {type: String, required: true},
        authorId: {type: Number, required: true},
        authorName: {type: String, default: ''},
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