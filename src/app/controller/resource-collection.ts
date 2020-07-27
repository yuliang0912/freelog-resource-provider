import {controller, get, inject, post, del, provide} from 'midway';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../../extend/vistorIdentityDecorator';
import {ICollectionService, IResourceService} from '../../interface';

@provide()
@controller('/v2/collections/resources')
export class ResourceCollectionController {

    @inject()
    resourceService: IResourceService;
    @inject()
    resourceCollectionService: ICollectionService;

    @get('/')
    @visitorIdentity(LoginUser)
    async index(ctx) {
        const page = ctx.checkQuery('page').default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery('pageSize').default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const resourceStatus = ctx.checkQuery('resourceStatus').optional().toInt().in([0, 1, 2]).value;
        ctx.validateParams();

        await this.resourceCollectionService.findPageList(resourceType, keywords, resourceStatus, page, pageSize).then(ctx.success);
    }

    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {
        const resourceId = ctx.checkBody('resourceId').isMongoObjectId().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'), data: {resourceId}
        });

        const collectionInfo = {
            resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            authorId: resourceInfo.userId,
            authorName: resourceInfo.username,
            userId: ctx.request.userId
        };

        await this.resourceCollectionService.collectionResource(collectionInfo).then(ctx.success);
    }

    @get('/isCollected')
    @visitorIdentity(LoginUser | InternalClient)
    async isCollected(ctx) {
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitMongoObjectId().toSplitArray().value;
        ctx.validateParams();

        await this.resourceCollectionService.isCollected(resourceIds).then(ctx.success);
    }

    @get('/:resourceId')
    @visitorIdentity(LoginUser)
    async show(ctx) {
        const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
        ctx.validateParams();

        await this.resourceCollectionService.findOne({
            resourceId, userId: ctx.request.userId
        }).then(ctx.success).catch(ctx.error);
    }

    @del('/:resourceId')
    @visitorIdentity(LoginUser)
    async destroy(ctx) {
        const resourceId = ctx.checkParams('resourceId').isMongoObjectId().value;
        ctx.validateParams();

        await this.resourceCollectionService.deleteOne({
            resourceId, userId: ctx.request.userId
        }).then(ctx.success);
    }
}
