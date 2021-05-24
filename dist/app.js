"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("egg-freelog-base/database/mongoose");
class AppBootHook {
    constructor(app) {
        this.app = app;
    }
    async willReady() {
        return mongoose_1.default(this.app);
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlFQUEwRDtBQUUxRCxNQUFxQixXQUFXO0lBRzVCLFlBQW1CLEdBQUc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ1gsT0FBTyxrQkFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0o7QUFWRCw4QkFVQyJ9