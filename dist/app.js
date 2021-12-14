"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("egg-freelog-base/database/mongoose");
class AppBootHook {
    app;
    constructor(app) {
        this.app = app;
    }
    async willReady() {
        await (0, mongoose_1.default)(this.app).then(() => {
            return this.app.applicationContext.getAsync('kafkaStartup');
        });
    }
    async beforeClose() {
        const kafkaClient = await this.app.applicationContext.getAsync('kafkaClient');
        await kafkaClient.disconnect();
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlFQUEwRDtBQUcxRCxNQUFxQixXQUFXO0lBQ1gsR0FBRyxDQUFDO0lBRXJCLFlBQW1CLEdBQUc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ1gsTUFBTSxJQUFBLGtCQUFRLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDL0IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVztRQUNiLE1BQU0sV0FBVyxHQUFnQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLE1BQU0sV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUM7Q0FDSjtBQWpCRCw4QkFpQkMifQ==