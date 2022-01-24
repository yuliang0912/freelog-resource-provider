import { KafkaClient } from './client';
import { ResourceContractAuthChangedEventHandler } from '../event-handler/resource-contract-auth-changed-event-handler';
export declare class KafkaStartup {
    kafkaConfig: any;
    kafkaClient: KafkaClient;
    resourceContractAuthChangedEventHandler: ResourceContractAuthChangedEventHandler;
    /**
     * 启动,连接kafka-producer,订阅topic
     */
    startUp(): Promise<void>;
    /**
     * 订阅
     */
    subscribeTopics(): Promise<void>;
}
