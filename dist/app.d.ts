export default class AppBootHook {
    private readonly app;
    constructor(app: any);
    willReady(): Promise<void>;
    beforeClose(): Promise<void>;
}
