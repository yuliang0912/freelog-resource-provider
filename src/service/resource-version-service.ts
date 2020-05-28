import {provide, inject} from 'midway';

@provide('resourceVersionService')
export class ResourceVersionService {
    @inject()
    resourceVersionProvider;
}
