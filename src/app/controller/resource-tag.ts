import {controller, get, post, inject, priority, provide, put} from 'midway';
import {ArgumentError, CommonRegex, FreelogContext, IdentityTypeEnum, visitorIdentityValidator} from 'egg-freelog-base';
import {IResourceService, ResourceTagInfo} from '../../interface';
import {isEmpty} from 'lodash';
import {deleteUndefinedFields} from 'egg-freelog-base/lib/freelog-common-func';

@provide()
@priority(10)
@controller('/v2/resources/tags')
export class ResourceTagController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;

    @get('/admin')
    async index() {

        const {ctx} = this;
        const skip = ctx.checkQuery('skip').optional().toInt().default(0).ge(0).value;
        const limit = ctx.checkQuery('limit').optional().toInt().default(10).gt(0).lt(101).value;
        const tagType = ctx.checkQuery('tagType').optional().toInt().in([1, 2]).value;
        const authority = ctx.checkQuery('authority').optional().toInt().in([1, 2, 3]).value;
        const resourceType = ctx.checkQuery('resourceType').optional().isResourceType().value;
        const keywords = ctx.checkQuery('keywords').optional().decodeURIComponent().trim().value;
        ctx.validateParams(); //.validateOfficialAuditAccount();

        const condition = deleteUndefinedFields<Partial<ResourceTagInfo>>({tagType, authority});
        if (resourceType) {
            condition.resourceRange = resourceType;
        }
        if (keywords?.length) {
            condition.tagName = new RegExp(`^${keywords}`, 'i') as any;
        }
        await this.resourceService.findIntervalResourceTagList(condition, skip, limit, null, {updateDate: -1}).then(ctx.success);
    }

    /**
     * 创建资源tag
     */
    @post('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async create() {

        const {ctx} = this;
        const tagName = ctx.checkBody('tagName').exist().len(1, 50).trim().value;
        const tagType = ctx.checkBody('tagType').exist().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').exist().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').exist().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').exist().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();

        const invalidResourceTypes = resourceRange.filter(x => !CommonRegex.resourceType.test(x));
        if (!isEmpty(invalidResourceTypes)) {
            throw new ArgumentError('资源类型范围中存在无效的参数', {invalidResourceTypes});
        }

        const tagInfo: ResourceTagInfo = {
            tagName, tagType, resourceRange, resourceRangeType, authority, createUserId: this.ctx.userId
        };

        await this.resourceService.createResourceTag(tagInfo).then(ctx.success);
    }

    /**
     * 批量更新tag
     */
    @put('/')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async batchUpdateTagInfo() {
        const {ctx} = this;
        const tagIds = ctx.checkBody('tagIds').exist().isArray().len(1, 100).value;
        const tagType = ctx.checkBody('tagType').optional().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').optional().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').optional().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').optional().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();

        const tagList = await this.resourceService.findResourceTags({_id: {$in: tagIds}});
        if (!tagList.length) {
            throw new ArgumentError(ctx.gettext('params-validate-failed'));
        }
        const model = deleteUndefinedFields<Partial<ResourceTagInfo>>({
            tagType, resourceRangeType, authority
        });
        if (!isEmpty(resourceRange ?? [])) {
            model.resourceRange = resourceRange;
        }
        if (isEmpty(Object.keys(model))) {
            throw new ArgumentError(ctx.gettext('params-required-validate-failed'));
        }
        await this.resourceService.batchUpdateResourceTag(tagList, model).then(ctx.success);
    }

    /**
     * 当前资源类型可用的tags
     */
    @get('/availableTags')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async list() {

        const {ctx} = this;
        const resourceType = ctx.checkQuery('resourceType').ignoreParamWhenEmpty().isResourceType().toLow().value;
        ctx.validateParams();

        const condition = {
            authority: 1,
            $or: [{resourceRangeType: 3},
                {resourceRangeType: 1, resourceRange: resourceType},
                {
                    resourceRangeType: 2,
                    resourceRange: {$ne: resourceType}
                }]
        };
        await this.resourceService.findResourceTags(condition, 'tagName tagType').then(ctx.success);
    }

}


