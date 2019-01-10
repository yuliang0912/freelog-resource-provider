'use strict'

const lodash = require('lodash')

module.exports = app => {

    const mongoose = app.mongoose;

    const toObjectOptions = {
        transform(doc, ret, options) {
            return lodash.omit(ret, ['_id'])
        }
    }

    const CollectionSchema = new mongoose.Schema({
        resourceId: {type: String, required: true},
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

    CollectionSchema.index({resourceId: 1, userId: 1}, {unique: true});

    return mongoose.model('collection', CollectionSchema)
}