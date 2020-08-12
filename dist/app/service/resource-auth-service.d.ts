import { ContractInfo, IResourceService } from '../../interface';
export declare class ResourceVersionService {
    resourceService: IResourceService;
    contractAuth(subjectId: any, contracts: ContractInfo[], authType: 'auth' | 'testAuth'): Promise<boolean>;
}
