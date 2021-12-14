import {config, init, inject, provide, scope, ScopeEnum} from 'midway';
import {KafkaClient} from './client';

import {ResourceContractAuthChangedEventHandler} from '../event-handler/resource-contract-auth-changed-event-handler';

@provide()
@scope(ScopeEnum.Singleton)
export class KafkaStartup {

    @config('kafka')
    kafkaConfig;
    @inject()
    kafkaClient: KafkaClient;
    @inject()
    resourceContractAuthChangedEventHandler: ResourceContractAuthChangedEventHandler;

    /**
     * 启动,连接kafka-producer,订阅topic
     */
    @init()
    async startUp() {
        if (this.kafkaConfig.enable !== true) {
            return;
        }
        await this.subscribeTopics().then(() => {
            console.log('kafka topic 订阅成功!');
        }).catch(error => {
            console.log('kafka topic 订阅失败!', error.toString());
        });
    }

    /**
     * 订阅
     */
    async subscribeTopics() {
        const topics = [this.resourceContractAuthChangedEventHandler];
        return this.kafkaClient.subscribes(topics);
    }
}
