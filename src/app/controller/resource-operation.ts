import {controller, del, get, inject, post, priority, provide} from 'midway';
import {FreelogContext, IdentityTypeEnum, visitorIdentityValidator} from 'egg-freelog-base';
import {ResourceOperationService} from '../service/resource-operation-service';
import {IResourceService} from '../../interface';
import {omit, isNumber} from 'lodash';

@provide()
@priority(11)
@controller('/v2/resources/operations')
export class ResourceOperationController {
    @inject()
    ctx: FreelogContext;
    @inject()
    resourceOperationService: ResourceOperationService;
    @inject()
    resourceService: IResourceService;

    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchCreate() {
        const {ctx} = this;
        const type = ctx.checkBody('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkBody('resourceIds').exist().len(1, 100).value;
        ctx.validateParams();

        const resourceList = await this.resourceService.find({_id: {$in: resourceIds}});
        await this.resourceOperationService.createResourceOperationDatas(type, resourceList).then(() => ctx.success(true));
    }

    @del('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchDelete() {
        const {ctx} = this;
        const type = ctx.checkBody('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkBody('resourceIds').exist().len(1, 100).value;
        ctx.validateParams();

        const resourceList = await this.resourceService.find({_id: {$in: resourceIds}});

        await this.resourceOperationService.deleteResourceOperationDatas(type, resourceList).then(ctx.success);
    }

    @get('/')
    async index() {
        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const sort = ctx.checkQuery('sort').optional().toSortObject().value;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        const authorName = ctx.checkQuery('authorName').ignoreParamWhenEmpty().isUsername().value;
        const resourceName = ctx.checkQuery('resourceName').ignoreParamWhenEmpty().value;
        const status = ctx.checkQuery('status').optional().toInt().in([0, 1, 2, 3]).value;
        const isLoadPolicyInfo = ctx.checkQuery('isLoadPolicyInfo').optional().toInt().in([0, 1]).value;
        const isLoadLatestVersionInfo = ctx.checkQuery('isLoadLatestVersionInfo').optional().toInt().in([0, 1]).value;
        ctx.validateParams();

        const condition = {} as any;
        if (resourceType?.length) {
            condition['resourceInfo.resourceType'] = resourceType;
        }
        if (authorName?.length) {
            condition['resourceInfo.username'] = new RegExp(authorName, 'i');
        }
        if (resourceName?.length) {
            condition['resourceInfo.resourceName'] = new RegExp(resourceName, 'i');
        }
        if (isNumber(status)) {
            condition['resourceInfo.status'] = status;
        }
        const pageResult = await this.resourceOperationService.findIntervalListJoinResource(condition, skip, limit, undefined, sort ?? {updateDate: -1});
        if (!pageResult.dataList.length) {
            return ctx.success(pageResult);
        }
        pageResult.dataList = pageResult.dataList.map(({resourceInfo}) => {
            resourceInfo.resourceId = resourceInfo._id.toString();
            return omit(resourceInfo, ['_id', 'uniqueKey']);
        });
        if (isLoadPolicyInfo) {
            await this.resourceService.fillResourcePolicyInfo(pageResult.dataList);
        }
        if (isLoadLatestVersionInfo) {
            await this.resourceService.fillResourceLatestVersionInfo(pageResult.dataList);
        }
        ctx.success(pageResult);
    }

    @get('/list')
    async list() {
        const {ctx} = this;
        const type = ctx.checkQuery('type').optional().default(1).in([1]).value;
        const resourceIds = ctx.checkQuery('resourceIds').exist().isSplitResourceId().toSplitArray().len(1, 100).value;
        const projection: string[] = ctx.checkQuery('projection').optional().toSplitArray().default([]).value;
        ctx.validateParams();
        await this.resourceOperationService.resourceOperationProvider.find({
            type, resourceId: {$in: resourceIds}
        }, projection?.join(' ')).then(ctx.success);
    }
}
