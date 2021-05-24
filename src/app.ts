import mongoose from 'egg-freelog-base/database/mongoose';

export default class AppBootHook {
    private readonly app;

    public constructor(app) {
        this.app = app;
    }

    async willReady() {
        return mongoose(this.app);
    }
}
