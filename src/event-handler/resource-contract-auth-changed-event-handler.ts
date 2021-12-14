import {EachMessagePayload} from 'kafkajs';
import {init, inject, provide, scope, ScopeEnum} from 'midway';
import {
    IContractAuthStatusChangedEventMessage, IKafkaSubscribeMessageHandle, ResourceVersionInfo
} from '../interface';
import {ContractStatusEnum, IMongodbOperation} from 'egg-freelog-base';

@provide()
@scope(ScopeEnum.Singleton)
export class ResourceContractAuthChangedEventHandler implements IKafkaSubscribeMessageHandle {

    consumerGroupId = 'freelog-resource-service#contract-terminated-event-handler-group';
    subscribeTopicName = `resource-contract-auth-status-changed-topic`;

    @inject()
    resourceVersionProvider: IMongodbOperation<ResourceVersionInfo>;

    @init()
    initial() {
        this.messageHandle = this.messageHandle.bind(this);
    }

    /**
     * 消息处理
     * @param payload
     */
    async messageHandle(payload: EachMessagePayload): Promise<void> {
        const message: IContractAuthStatusChangedEventMessage = JSON.parse(payload.message.value.toString());
        if (message.contractStatus !== ContractStatusEnum.Terminated) {
            return;
        }
        const resourceVersions = await this.resourceVersionProvider.find({
            resourceId: message.licenseeId, 'resolveResources.resourceId': message.licensorId
        }, 'versionId resolveResources');

        const tasks = [];
        for (const resourceVersion of resourceVersions) {
            const resolveResource = resourceVersion.resolveResources.find(x => x.resourceId === message.subjectId);
            resolveResource.contracts = resolveResource.contracts.filter(x => x.contractId !== message.contractId);
            tasks.push(this.resourceVersionProvider.updateOne({versionId: resourceVersion.versionId}, {
                resolveResources: resourceVersion.resolveResources
            }));
        }
        await Promise.all(tasks);
    }
}
