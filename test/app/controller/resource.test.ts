/* tslint:disable */
const {app, assert} = require('midway-mock/bootstrap');
/* tslint:enable */

describe('test/app/controller/resource.test.ts', () => {

    it('should GET /resources', () => {
        return app.httpRequest()
            .get('/v1/resources')
            .expect(200);
    });
});
