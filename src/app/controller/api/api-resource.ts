import {controller, inject, post, provide} from "midway";
import {ApiResourceService} from "../../service/api/api-resource-service";
import {FreelogContext, IdentityTypeEnum, visitorIdentityValidator} from "egg-freelog-base";


@provide()
@controller('/v2/resources/api')
export class ApiResourceController {

    @inject()
    ctx: FreelogContext;

    @inject()
    apiResourceService: ApiResourceService;

    @visitorIdentityValidator(IdentityTypeEnum.InternalClient)
    @post('/listByTagNameAndAfterCreateDate')
    async listByTagNameAndAfterCreateDate() {
        this.ctx.checkBody("tagName").exist();
        this.ctx.checkBody("startDate").exist();
        this.ctx.checkBody("limitDate").exist();
        this.ctx.checkBody("projection").exist();
        this.ctx.validateParams();

        this.ctx.success(await this.apiResourceService.listByTagNameAndAfterCreateDate(this.ctx.request.body));
    }

    @visitorIdentityValidator(IdentityTypeEnum.InternalClient)
    @post(`/listByResourceIds`)
    async listByResourceIds() {
        this.ctx.checkBody("resourceIds").exist();
        this.ctx.checkBody("projection").exist();
        this.ctx.validateParams();

        this.ctx.success(await this.apiResourceService.listByResourceIds(this.ctx.request.body));
    }
}
