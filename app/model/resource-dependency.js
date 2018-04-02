'use strict'

module.exports = app => {

    const mongoose = app.mongoose;

    const resourceDependencySchema = new mongoose.Schema({
        resourceId: {type: String, required: true}, //资源ID
        resourceName: {type: String, required: true},//资源名称
        resourceType: {type: String, required: true},//资源类型
        dependencies: {type: [String], required: true}, //依赖的子资源ID
        userId: {type: Number, required: true},
    })

    resourceDependencySchema.index({resourceId: 1, userId: 1});

    return mongoose.model('resource-dependency', resourceDependencySchema)
}