import {provide, inject} from 'midway';

@provide('resourceCollectionService')
export class ResourceCollectionService {
    @inject()
    resourceCollectionProvider;
}
