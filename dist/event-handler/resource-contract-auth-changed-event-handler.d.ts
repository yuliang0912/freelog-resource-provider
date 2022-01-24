import { EachMessagePayload } from 'kafkajs';
import { IKafkaSubscribeMessageHandle, ResourceVersionInfo } from '../interface';
import { IMongodbOperation } from 'egg-freelog-base';
export declare class ResourceContractAuthChangedEventHandler implements IKafkaSubscribeMessageHandle {
    consumerGroupId: string;
    subscribeTopicName: string;
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;
    initial(): void;
    /**
     * 消息处理
     * @param payload
     */
    messageHandle(payload: EachMessagePayload): Promise<void>;
}
