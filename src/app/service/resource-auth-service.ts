import {inject, provide} from 'midway';
import {ContractInfo, IResourceService} from '../../interface';
import {isArray, isEmpty} from 'lodash';
import {ArgumentError} from 'egg-freelog-base';
import {SubjectTypeEnum} from "../../enum";

@provide('resourceVersionService')
export class ResourceVersionService {

    @inject()
    resourceService: IResourceService;

    async contractAuth(subjectId, contracts: ContractInfo[], authType: 'auth' | 'testAuth') {
        if (!isArray(contracts) || isEmpty(contracts)) {
            throw new ArgumentError('please check code logic');
        }
        return contracts.some(x => x.subjectId === subjectId && x.subjectType === SubjectTypeEnum.Resource && (authType === 'auth' ? x.isAuth : x.isTestAuth));
    }
}