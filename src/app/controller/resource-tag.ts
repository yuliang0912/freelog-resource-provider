import {controller, get, post, inject, priority, provide} from 'midway';
import {ArgumentError, CommonRegex, FreelogContext, IdentityTypeEnum, visitorIdentityValidator} from 'egg-freelog-base';
import {IResourceService, ResourceTagInfo} from '../../interface';
import {isEmpty, first} from 'lodash';
import {deleteUndefinedFields} from 'egg-freelog-base/lib/freelog-common-func';

@provide()
@priority(10)
@controller('/v2/resources/tags')
export class ResourceTagController {

    @inject()
    ctx: FreelogContext;
    @inject()
    resourceService: IResourceService;

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
     * 创建资源tag
     */
    @post('/:tagId')
    @visitorIdentityValidator(IdentityTypeEnum.LoginUser)
    async updateTagInfo() {
        const {ctx} = this;
        const tagId = ctx.checkParams('tagId').exist().isMongoObjectId().value;
        const tagType = ctx.checkBody('tagType').optional().toInt().in([1, 2]).value;
        const resourceRange = ctx.checkBody('resourceRange').optional().isArray().len(0, 200).value;
        const resourceRangeType = ctx.checkBody('resourceRangeType').optional().toInt().in([1, 2, 3]).value;
        const authority = ctx.checkBody('authority').optional().toInt().in([1, 2, 3]).value;
        ctx.validateParams().validateOfficialAuditAccount();

        const tagInfo = await this.resourceService.findResourceTags({_id: tagId}).then(first);
        if (!tagInfo) {
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
        await this.resourceService.updateResourceTag(tagId, model);
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


