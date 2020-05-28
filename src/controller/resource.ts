import {controller, inject, get, post, put, provide} from 'midway';
import {LoginUser, InternalClient, ArgumentError} from 'egg-freelog-base';
import {visitorIdentity} from '../extend/vistorIdentityDecorator';
import {IResourceService} from "../interface";
import {isString, includes, isEmpty} from 'lodash';

@provide()
@controller('/v1/resources')
export class ResourceController {

    @inject()
    resourceService: IResourceService;

    @get('/')
    async index(ctx) {
        const page = ctx.checkQuery("page").optional().default(1).gt(0).toInt().value;
        const pageSize = ctx.checkQuery("pageSize").optional().default(10).gt(0).lt(101).toInt().value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().default('').toLow().value;
        const keywords = ctx.checkQuery("keywords").optional().decodeURIComponent().trim().value;
        const isSelf = ctx.checkQuery("isSelf").optional().default(0).toInt().in([0, 1]).value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2]).value;
        ctx.validateParams();

        const condition: any = {}
        if (isSelf) {
            ctx.validateVisitorIdentity(LoginUser);
            condition.userId = ctx.request.userId;
        }
        if (resourceType) {
            condition.resourceType = resourceType;
        }
        if (includes([0, 1], status)) {
            condition.status = status
        }
        if (isString(keywords) && keywords.length > 0) {
            let searchRegExp = new RegExp(keywords, "i")
            condition.$or = [{releaseName: searchRegExp}, {resourceType: searchRegExp}]
        }

        var dataList = []
        const totalItem = await this.resourceService.count(condition);
        if (totalItem <= (page - 1) * pageSize) {
            return ctx.success({page, pageSize, totalItem, dataList})
        }

        dataList = await this.resourceService.findPageList(condition, page, pageSize, projection.join(' '), {createDate: -1})

        ctx.success({page, pageSize, totalItem, dataList})
    }

    /**
     * 创建资源,区别于旧版本,现在资源可以先创建,后添加版本.
     * 只有具有正式版本,且具有策略,才代表资源上架
     * @param ctx
     * @returns {Promise<void>}
     */
    @post('/')
    @visitorIdentity(LoginUser)
    async create(ctx) {

        const name = ctx.checkBody('name').exist().isReleaseName().value;
        const resourceType = ctx.checkBody('resourceType').exist().isResourceType().value;
        const policies = ctx.checkBody('policies').optional().default([]).isArray().value;
        const intro = ctx.checkBody('intro').optional().type('string').default('').len(0, 1000).value;
        const coverImages = ctx.checkBody('coverImages').optional().isArray().len(1, 10).default([]).value;
        ctx.validateParams();

        if (coverImages.some(x => !ctx.app.validator.isURL(x.toString(), {protocols: ['https']}))) {
            throw new ArgumentError(ctx.gettext('params-format-validate-failed', 'coverImages'))
        }
        const {userId, username} = ctx.request.identityInfo.userInfo;
        const model = {
            userId, username, resourceType, name, intro, coverImages, policies,
        };

        await this.resourceService.findOneByResourceName(`${username}/${name}`, 'resourceName').then(resourceName => {
            if (resourceName) {
                throw new ArgumentError('name is already existing');
            }
        })

        await this.resourceService.createResource(model).then(ctx.success);
    }

    @get('/list')
    async list(ctx) {
        const resourceIds = ctx.checkQuery('resourceIds').optional().isMongoObjectId().toSplitArray().value;
        const resourceNames = ctx.checkQuery('resourceNames').optional().toSplitArray().value;
        const projection = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();

        if (!isEmpty(resourceIds)) {
            await this.resourceService.find({_id: {$in: resourceIds}}, projection.join(' ')).then(ctx.success);
        } else if (!isEmpty(resourceNames)) {
            await this.resourceService.findByResourceNames(resourceNames, projection.join(' ')).then(ctx.success);
        } else {
            throw new ArgumentError('');
        }
    }

    @get('/detail')
    @visitorIdentity(LoginUser | InternalClient)
    async detail(ctx) {
        const resourceName = ctx.checkQuery('resourceName').exist().isFullReleaseName().value;
        ctx.validateParams();

        await this.resourceService.findOneByResourceName(resourceName, 'resourceName resourceType').then(ctx.success)
    }

    @put('/:resourceName')
    async update(ctx) {

    }
}