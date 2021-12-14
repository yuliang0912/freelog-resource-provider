"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaClient = void 0;
const kafkajs_1 = require("kafkajs");
const midway_1 = require("midway");
const lodash_1 = require("lodash");
const egg_freelog_base_1 = require("egg-freelog-base");
/**
 * WIKI:https://kafka.js.org/docs/getting-started
 */
let KafkaClient = class KafkaClient {
    kafka;
    kafkaConfig;
    consumers = [];
    consumerTopicAsyncHandleFunc = new Map();
    async initial() {
        if (this.kafkaConfig.enable === false) {
            return;
        }
        this.kafka = new kafkajs_1.Kafka(this.kafkaConfig);
    }
    /**
     * 订阅主题消息
     * @param topics
     */
    async subscribes(topics) {
        const buildTopicGroupKey = (topic, groupId) => {
            return `topic_${topic}#group_id_${groupId}`;
        };
        const topicGroup = (0, lodash_1.groupBy)(topics, x => x.consumerGroupId);
        for (const [groupId, topicGroups] of Object.entries(topicGroup)) {
            const consumer = this.kafka.consumer({ groupId });
            await consumer.connect().catch(() => {
                throw new egg_freelog_base_1.ApplicationError('kafka消费者连接失败');
            });
            for (const topicInfo of topicGroups) {
                await consumer.subscribe({ topic: topicInfo.subscribeTopicName });
                this.consumerTopicAsyncHandleFunc.set(buildTopicGroupKey(topicInfo.subscribeTopicName, topicInfo.consumerGroupId), topicInfo.messageHandle);
            }
            await consumer.run({
                partitionsConsumedConcurrently: 3,
                eachMessage: async (...args) => {
                    const { topic } = (0, lodash_1.first)(args);
                    const asyncHandleFunc = this.consumerTopicAsyncHandleFunc.get(buildTopicGroupKey(topic, groupId));
                    await Reflect.apply(asyncHandleFunc, null, args);
                }
            });
            this.consumers.push(consumer);
        }
    }
    /**
     * 释放连接
     */
    async disconnect() {
        this.consumers.forEach(consumer => consumer.disconnect());
    }
};
__decorate([
    (0, midway_1.config)('kafka'),
    __metadata("design:type", Object)
], KafkaClient.prototype, "kafkaConfig", void 0);
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KafkaClient.prototype, "initial", null);
KafkaClient = __decorate([
    (0, midway_1.provide)(),
    (0, midway_1.scope)(midway_1.ScopeEnum.Singleton)
], KafkaClient);
exports.KafkaClient = KafkaClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2thZmthL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNEQ7QUFDNUQsbUNBQStEO0FBRS9ELG1DQUFzQztBQUN0Qyx1REFBa0Q7QUFFbEQ7O0dBRUc7QUFHSCxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFXO0lBRXBCLEtBQUssQ0FBUTtJQUViLFdBQVcsQ0FBQztJQUNaLFNBQVMsR0FBZSxFQUFFLENBQUM7SUFFM0IsNEJBQTRCLEdBQUcsSUFBSSxHQUFHLEVBQTBELENBQUM7SUFHakcsS0FBSyxDQUFDLE9BQU87UUFDVCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtZQUNuQyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFzQztRQUNuRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWUsRUFBRSxFQUFFO1lBQzFELE9BQU8sU0FBUyxLQUFLLGFBQWEsT0FBTyxFQUFFLENBQUM7UUFDaEQsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxVQUFVLEdBQUcsSUFBQSxnQkFBTyxFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMzRCxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLG1DQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxNQUFNLFNBQVMsSUFBSSxXQUFXLEVBQUU7Z0JBQ2pDLE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQy9JO1lBQ0QsTUFBTSxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUNmLDhCQUE4QixFQUFFLENBQUM7Z0JBQ2pDLFdBQVcsRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRTtvQkFDM0IsTUFBTSxFQUFDLEtBQUssRUFBQyxHQUFHLElBQUEsY0FBSyxFQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNsRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckQsQ0FBQzthQUNKLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVU7UUFDWixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FDSixDQUFBO0FBakRHO0lBREMsSUFBQSxlQUFNLEVBQUMsT0FBTyxDQUFDOztnREFDSjtBQU1aO0lBREMsSUFBQSxhQUFJLEdBQUU7Ozs7MENBTU47QUFmUSxXQUFXO0lBRnZCLElBQUEsZ0JBQU8sR0FBRTtJQUNULElBQUEsY0FBSyxFQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDO0dBQ2QsV0FBVyxDQXFEdkI7QUFyRFksa0NBQVcifQ==