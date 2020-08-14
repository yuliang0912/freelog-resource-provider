import {inject, provide} from 'midway';
import {ContractInfo, IResourceService, IResourceAuthService} from '../../interface';
import {isArray, isEmpty} from 'lodash';
import {ArgumentError} from 'egg-freelog-base';
import {SubjectTypeEnum} from "../../enum";

@provide()
export class ResourceAuthService implements IResourceAuthService {

    @inject()
    resourceService: IResourceService;

    async contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean> {
        if (!isArray(contracts) || isEmpty(contracts)) {
            throw new ArgumentError('please check code logic');
        }
        return contracts.some(x => x.subjectId === subjectId && x.subjectType === SubjectTypeEnum.Resource && (authType === 'auth' ? x.isAuth : x.isTestAuth));
    }
}