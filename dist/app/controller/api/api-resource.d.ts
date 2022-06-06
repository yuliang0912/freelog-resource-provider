import { ApiResourceService } from "../../service/api/api-resource-service";
import { FreelogContext } from "egg-freelog-base";
export declare class ApiResourceController {
    ctx: FreelogContext;
    apiResourceService: ApiResourceService;
    listByTagNameAndAfterCreateDate(): Promise<void>;
    listByResourceIds(): Promise<void>;
}
