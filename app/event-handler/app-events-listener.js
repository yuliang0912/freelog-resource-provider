'use strict'

const Patrun = require('patrun')
const ResourceEvents = require('../enum/resource-events')
const {ApplicationError} = require('egg-freelog-base/error')
const ResourceEventHandler = require('./resource-event-handler')
const MockResourceEventHandler = require('./mock-resource-event-handler')
const ReleaseSchemeEventHandler = require('./release-scheme-event-handler')

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
        this.registerEventAndHandler(ResourceEvents.createMockResourceEvent)
        this.registerEventAndHandler(ResourceEvents.updateMockResourceFileEvent)
        this.registerEventAndHandler(ResourceEvents.createReleaseSchemeEvent)
        this.registerEventAndHandler(ResourceEvents.signReleaseContractEvent)
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

        const releaseSchemeEventHandler = new ReleaseSchemeEventHandler(app)

        patrun.add({event: ResourceEvents.createReleaseSchemeEvent.toString()}, releaseSchemeEventHandler)
        patrun.add({event: ResourceEvents.signReleaseContractEvent.toString()}, releaseSchemeEventHandler)
        patrun.add({event: ResourceEvents.createResourceEvent.toString()}, new ResourceEventHandler(app))
        patrun.add({event: ResourceEvents.createMockResourceEvent.toString()}, new MockResourceEventHandler(app))
        patrun.add({event: ResourceEvents.updateMockResourceFileEvent.toString()}, new MockResourceEventHandler(app))

    }
}