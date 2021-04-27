import {controller, get, inject, post, del, provide} from 'midway';
import {ICollectionService, IResourceService} from '../../interface';
import {IdentityTypeEnum, visitorIdentityValidator, FreelogContext} from 'egg-freelog-base';

@provide()
@controller('/v2/collections/resources')
export class ResourceCollectionController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;
    @inject()
    resourceCollectionService: ICollectionService;

    @get('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async index() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const omitResourceType = ctx.checkQuery('omitResourceType').ignoreParamWhenEmpty().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().value;
        const resourceStatus = ctx.checkQuery('resourceStatus').optional().toInt().in([0, 1, 2]).value;
        ctx.validateParams();

        await this.resourceCollectionService.findIntervalList(resourceType, omitResourceType, keywords, resourceStatus, skip, limit).then(ctx.success);
    }

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async create() {

        const {ctx} = this;
        const resourceId = ctx.checkBody('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        const resourceInfo = await this.resourceService.findByResourceId(resourceId);
        ctx.entityNullObjectCheck(resourceInfo, {
            msg: ctx.gettext('params-validate-failed', 'resourceId'),
            data: {resourceId}
        });

        const collectionInfo = {
            resourceId,
            resourceName: resourceInfo.resourceName,
            resourceType: resourceInfo.resourceType,
            authorId: resourceInfo.userId,
            authorName: resourceInfo.username,
            userId: ctx.userId
        };

        await this.resourceCollectionService.collectionResource(collectionInfo).then(ctx.success);
    }

    @get('/isCollected')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser | IdentityTypeEnum.InternalClient)
    async isCollected() {

        const {ctx} = this;
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitMongoObjectId().toSplitArray().value;
        ctx.validateParams();

        await this.resourceCollectionService.isCollected(resourceIds).then(ctx.success);
    }

    @get('/:resourceId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async show() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        await this.resourceCollectionService.findOne({
            resourceId, userId: ctx.userId
        }).then(ctx.success).catch(ctx.error);
    }

    @del('/:resourceId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async destroy() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        await this.resourceCollectionService.deleteOne({
            resourceId, userId: ctx.userId
        }).then(ctx.success);
    }

    @get('/:resourceId/count')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async count() {

        const {ctx} = this;
        const resourceId = ctx.checkParams('resourceId').exist().isResourceId().value;
        ctx.validateParams();

        await this.resourceCollectionService.count({resourceId}).then(ctx.success);
    }
}


// db.createUser({ user:"aliyun_test_user", pwd:"QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=",roles:[{ role:"dbOwner",db:"test-nodes" },{ role:"dbOwner",db:"test-contracts" },{ role:"dbOwner",db:"test-resources" },{ role:"dbOwner",db:"test-events" },{ role:"dbOwner",db:"test-api-gateway" },{ role:"dbOwner",db:"test-storages" }] })
