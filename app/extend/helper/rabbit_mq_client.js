/**
 * Created by yuliang on 2017/9/6.
 */

'use strict'

let instance = null
const amqp = require('amqp')
const uuid = require('uuid')
const Emitter = require('events')
const Promise = require("bluebird")
const {ApplicationError} = require('egg-freelog-base/error')

module.exports = class rabbitMqClient extends Emitter {

    constructor(rabbitConfig) {
        if (instance) {
            return instance
        }
        if (!rabbitConfig) {
            throw new ApplicationError("未找到RabbitMQ配置项")
        }
        super()
        this.config = rabbitConfig
        this.isReady = false
        this.exchange = null
        this.connection = null
        this.queues = new Map()
        this.awitSubscribes = new Map()
        this.awitSubscribes = new Map()
        this.instance = instance = this
    }

    /**
     * 开始尝试连接到rabbitmq服务端
     * @param timeout <ms>
     * @returns {*}
     */
    connect(timeout = 3000) {
        //如果已经连接OK或者之前已经创建过链接.则直接返回.保持单例
        if (this.isReady || this.connection) {
            return Promise.resolve(this.instance)
        }
        return new Promise((...args) => this._startConnect(...args)).timeout(timeout).catch(Promise.TimeoutError, (err) => {
            return Promise.reject(new ApplicationError('rabbitMQ connect timeout'))
        })
    }

    /**
     * 发送消息
     * @param routingKey
     * @param body
     * @param options
     */
    publish({routingKey, eventName, body, options}) {
        return new Promise((resolve, reject) => {
            if (!this.isReady) {
                return reject(new ApplicationError("rabbitMq is not ready"))
            }
            this.exchange.publish(routingKey, body || {}, Object.assign({
                mandatory: true, //无法匹配路由时,是否触发basic-return事件
                deliveryMode: 2,  //1.非持久化  2.持久化消息
                headers: {eventName: eventName || 'defalutEventName'},
                messageId: uuid.v4().replace(/-/g, "")
            }, options), (ret, err) => {
                if (err) {
                    this.emit('publishFailed', routingKey, body, options, this.config.exchange.name)
                    return reject(err)
                }
                resolve(!ret)
            })
        }).timeout(10000).catch(Promise.TimeoutError, (err) => {
            this.emit('publishTimeout', routingKey, body, options, this.config.exchange.name)
            return Promise.reject(new ApplicationError('消息发送已超时'))
        })
    }

    /**
     * 订阅消息
     * @param queueName
     * @param callback
     */
    subscribe(queueName, callback) {
        if (!Array.isArray(this.config.queues) || this.config.queues.length === 0) {
            throw new ApplicationError("当前exchange上没有队列,请查看配置文件")
        }
        if (!this.config.queues.some(t => t.name === queueName)) {
            throw new ApplicationError("当前exchange上不存在指定的队列名")
        }

        // if (toString.call(callback) !== '[object Function]') {
        //     throw new Error('callback 必须是function')
        // }

        /**
         * 如果已经绑定好队列,则直接订阅
         * 如果没有绑定好队列,则先临时缓存,等待队列绑定完毕,自动订阅
         */
        if (this.queues.has(queueName)) {
            this.queues.get(queueName).queue.subscribe({ack: true}, callback).addCallback(ok => {
                this.queues.get(queueName).consumerTag = ok.consumerTag
            })
            this.awitSubscribes.delete(queueName)
            console.log(queueName + '订阅成功')
        } else if (!this.awitSubscribes.has(queueName)) {
            this.awitSubscribes.set(queueName, callback)
        }
    }

    /**
     * 取消订阅
     * @param queueName
     */
    unsubscribe(queueName) {
        if (this.queues.has(queueName)) {
            this.queues.get(queueName).queue.unsubscribe(this.queues.get(queueName).consumerTag)
        } else {
            this.awitSubscribes.delete(queueName)
        }
        console.log(queueName + '取消订阅成功')
    }

    /**
     * 获取当前单例,方便其他地方直接通过instance调用函数
     * @returns {*}
     */
    static get Instance() {
        if (!instance) {
            throw new ApplicationError("请确保使用前已经在application中创建过rabbitmqClient")
        }
        return instance
    }

    /**
     * 开始连接到rabbitmq
     * @returns {Promise<void>}
     * @private
     */
    _startConnect(resolve, reject) {

        const {config, queues} = this
        const exchangeConfig = {type: 'topic', autoDelete: false, confirm: true, durable: true}
        const connection = this.connection = amqp.createConnection(config.connOptions, config.implOptions)

        connection.on('ready', () => {
            this.exchange = connection.exchange(config.exchange.name, exchangeConfig)
            this.exchange.on('open', () => {
                config.queues.forEach(item => connection.queue(item.name, item.options, (queue) => {
                    Array.isArray(item.routingKeys) && item.routingKeys.forEach(router => {
                        queue.bind(router.exchange || config.exchange.name, router.routingKey)
                    })
                    if (!queues.has(item.name)) {
                        queues.set(item.name, {queue, consumerTag: ""})
                    }
                    if (this.awitSubscribes.has(item.name)) {
                        this.subscribe(item.name, this.awitSubscribes.get(item.name))
                    }
                }))
                this.isReady = true
                resolve(this.instance)
            })
            this.exchange.on('basic-return', (args) => {
                console.log('消息发送失败,没有匹配的路由,option:{mandatory:true}设置才会出现此消息,否则默认忽略', args)
            })
            console.log(`rabbit connection open to ${config.connOptions.host}:${config.connOptions.port}`);
        }).on('close', () => {
            this.isReady = false
        }).on('error', (err) => {
            reject(err)
            this.isReady = false
            console.log("rabbitMQ error," + err.toString());
        }).on('tag.change', function (event) {
            queues.forEach(value => {
                if (value.consumerTag === event.oldConsumerTag) {
                    value.consumerTag = event.consumerTag
                }
            })
        });
    }
}
