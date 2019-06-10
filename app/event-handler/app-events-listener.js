'use strict'

const Patrun = require('patrun')
const ResourceEvents = require('../enum/resource-events')
const {ApplicationError} = require('egg-freelog-base/error')
const CreateSchemeEventHandler = require('./create-scheme-event-handler')
const CreateResourceEventHandler = require('./create-resource-event-handler')
const CreateMockResourceEventHandler = require('./create-mock-event-handler')
const UpdateMockResourceFileEventHandler = require('./update-mock-file-event-handler')
const DeleteMockResourceEventHandler = require('./delete-mock-resource-event-handler')
const SignReleaseContractEventHandler = require('./sign-release-contract-event-handler')
const MockConvertToResourceEventHandler = require('./mock-convert-resource-event-handler')

module.exports = class AppEventsListener {

    constructor(app) {
        this.app = app
        this.patrun = Patrun()
        this.registerEventHandler()
        this.registerEventListener()
    }

    /**
     * 注册事件侦听者
     */
    registerEventListener() {
        this.registerEventAndHandler(ResourceEvents.createResourceEvent)
        this.registerEventAndHandler(ResourceEvents.deleteMockResourceEvent)
        this.registerEventAndHandler(ResourceEvents.createMockResourceEvent)
        this.registerEventAndHandler(ResourceEvents.updateMockResourceFileEvent)
        this.registerEventAndHandler(ResourceEvents.createReleaseSchemeEvent)
        this.registerEventAndHandler(ResourceEvents.signReleaseContractEvent)
        this.registerEventAndHandler(ResourceEvents.mockConvertToResourceEvent)
    }

    /**
     * 注册事件以及事件处理者
     * @param eventName
     */
    registerEventAndHandler(eventName) {

        const eventHandler = this.patrun.find({event: eventName.toString()})
        if (!eventHandler) {
            throw new ApplicationError(`尚未注册事件${eventName}的处理者`)
        }

        this.app.on(eventName, (...args) => eventHandler.handle(eventName, ...args))
    }

    /**
     * 注册事件处理者
     */
    registerEventHandler() {

        const {app, patrun} = this

        patrun.add({event: ResourceEvents.createResourceEvent.toString()}, new CreateResourceEventHandler(app))
        patrun.add({event: ResourceEvents.createReleaseSchemeEvent.toString()}, new CreateSchemeEventHandler(app))
        patrun.add({event: ResourceEvents.deleteMockResourceEvent.toString()}, new DeleteMockResourceEventHandler(app))
        patrun.add({event: ResourceEvents.createMockResourceEvent.toString()}, new CreateMockResourceEventHandler(app))
        patrun.add({event: ResourceEvents.signReleaseContractEvent.toString()}, new SignReleaseContractEventHandler(app))
        patrun.add({event: ResourceEvents.mockConvertToResourceEvent.toString()}, new MockConvertToResourceEventHandler(app))
        patrun.add({event: ResourceEvents.updateMockResourceFileEvent.toString()}, new UpdateMockResourceFileEventHandler(app))
    }
}