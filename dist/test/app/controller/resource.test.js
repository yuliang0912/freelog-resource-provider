/* tslint:disable */
const { app, assert } = require('midway-mock/bootstrap');
/* tslint:enable */
describe('test/app/controller/resource.test.ts', () => {
    it('should GET /resources', () => {
        return app.httpRequest()
            .get('/v1/resources')
            .expect(200);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvYXBwL2NvbnRyb2xsZXIvcmVzb3VyY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvQkFBb0I7QUFDcEIsTUFBTSxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUMsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUN2RCxtQkFBbUI7QUFFbkIsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtJQUVsRCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBQzdCLE9BQU8sR0FBRyxDQUFDLFdBQVcsRUFBRTthQUNuQixHQUFHLENBQUMsZUFBZSxDQUFDO2FBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=