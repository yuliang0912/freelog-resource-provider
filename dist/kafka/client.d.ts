import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { IKafkaSubscribeMessageHandle } from '../interface';
/**
 * WIKI:https://kafka.js.org/docs/getting-started
 */
export declare class KafkaClient {
    kafka: Kafka;
    kafkaConfig: any;
    consumers: Consumer[];
    consumerTopicAsyncHandleFunc: Map<string, (payload: EachMessagePayload) => Promise<void>>;
    initial(): Promise<void>;
    /**
     * 订阅主题消息
     * @param topics
     */
    subscribes(topics: IKafkaSubscribeMessageHandle[]): Promise<void>;
    /**
     * 释放连接
     */
    disconnect(): Promise<void>;
}
