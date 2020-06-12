import {app, assert} from 'midway-mock/bootstrap';
import {IResourceService} from '../../../src/interface';

describe('test/app/service/resourceService.test.ts', () => {
    it('#getResourceInfo', async () => {
        // 取出 userService
        const resourceService = await app.applicationContext.getAsync<IResourceService>('resourceService');
        const resourceInfo = await resourceService.findOneByResourceName('yuliang/my-first-resource')
        assert(resourceInfo.resourceType === 'text');
        assert(resourceInfo.username === 'yuliang');
    });
});