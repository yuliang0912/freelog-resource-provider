import mongoose from 'egg-freelog-base/database/mongoose';
import {KafkaClient} from './kafka/client';

export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
    }

    async willReady() {
        await mongoose(this.app).then(() => {
            return this.app.applicationContext.getAsync('kafkaStartup');
        });
    }

    async beforeClose() {
        const kafkaClient: KafkaClient = await this.app.applicationContext.getAsync('kafkaClient');
        await kafkaClient.disconnect();
    }
}
