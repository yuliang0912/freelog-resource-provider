/* tslint:disable */
var _a = require('midway-mock/bootstrap'), app = _a.app, assert = _a.assert;
/* tslint:enable */
describe('test/app/controller/resource.test.ts', function () {
    it('should GET /resources', function () {
        return app.httpRequest()
            .get('/v1/resources')
            .expect(200);
    });
});
