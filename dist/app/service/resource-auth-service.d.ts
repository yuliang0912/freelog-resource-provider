import { ContractInfo, IResourceService, IResourceAuthService } from '../../interface';
export declare class ResourceAuthService implements IResourceAuthService {
    resourceService: IResourceService;
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean>;
}
