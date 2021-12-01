import {Client} from '@elastic/elasticsearch';
import type {Client as NewTypes} from '@elastic/elasticsearch/api/new';
import {QueryDslQueryContainer, SearchTotalHits} from '@elastic/elasticsearch/api/types';
import {config, init, provide, scope} from 'midway';
import {ResourceInfo} from '../../interface';
import {isEmpty, isArray, omit, uniq, includes} from 'lodash';
import {PageResult} from 'egg-freelog-base';
import * as T from '@elastic/elasticsearch/api/types';

@scope('Singleton')
@provide('elasticSearchService')
export class ElasticSearchService {

    @config('elasticSearch')
    elasticSearch;
    private client: NewTypes;

    @init()
    constructorBse() {
        this.client = new Client({node: this.elasticSearch.url}) as any;
    }

    /**
     * 搜索关键字建议
     * @param prefix
     */
    async suggest(prefix: string): Promise<string[]> {
        const result = await this.client.search({
            index: 'test-resources.resource-infos',
            body: {
                suggest: {
                    kw: {
                        prefix,
                        completion: {
                            field: 'resourceName.kw'
                        }
                    },
                    pinyin: {
                        prefix,
                        completion: {
                            field: 'resourceNameAbbreviation.py'
                        }
                    }
                },
                _source: ''
            }
        });

        return uniq<string>(Object.values(result.body.suggest).map(x => x.map(m => m.options)).flat(2).map(x => x['text']));
    }

    /**
     * 搜索资源库信息
     * @param skip
     * @param limit
     * @param sort
     * @param keywords
     * @param userId
     * @param resourceType
     * @param omitResourceType
     * @param status
     * @param tags
     */
    async search(skip: number, limit: number, sort: object, keywords: string, userId?: number, resourceType?: string, omitResourceType?: string, status?: number, tags?: string[], projection?: string[]): Promise<PageResult<ResourceInfo>> {

        const searchParams: T.SearchRequest = {
            index: 'test-resources.resource-infos',
            body: {
                query: {
                    bool: {}
                },
            },
            from: skip,
            size: limit
        };
        const musts: QueryDslQueryContainer[] = [];
        const mustNots: QueryDslQueryContainer[] = [];
        if (keywords?.length) {
            musts.push({
                query_string: {
                    query: keywords.replace(/\//g, '//'),
                    fields: ['resourceName^1.5', `resourceNameAbbreviation^1.2`, 'resourceNameAbbreviation.py^0.8', 'resourceType', 'intro^0.7', 'tags']
                }
            });
        } else {
            sort = {updateDate: -1};
        }
        if (userId) {
            musts.push({term: {userId: {value: userId}}});
        }
        if (resourceType) {
            musts.push({term: {resourceType: {value: resourceType}}});
        }
        if (includes([0, 1], status)) {
            musts.push({term: {status: {value: status}}});
        }
        if (isArray(tags) && !isEmpty(tags)) {
            musts.push({terms: {tags: tags}});
        }
        if (omitResourceType) {
            mustNots.push({term: {resourceType: {value: omitResourceType}}});
        }
        if (!isEmpty(musts)) {
            searchParams.body.query.bool.must = musts;
        }
        if (!isEmpty(mustNots)) {
            searchParams.body.query.bool.must_not = mustNots;
        }
        if (!isEmpty(projection ?? [])) {
            searchParams._source = projection;
        }
        if (sort) {
            searchParams.body.sort = [];
            for (const [key, value] of Object.entries(sort)) {
                searchParams.body.sort.push({[key]: ['DESC', 'desc', '-1', -1].includes(value) ? 'desc' : 'asc'});
            }
        }

        const result = await this.client.search<ResourceInfo>(searchParams);
        return {
            totalItem: (result.body.hits.total as SearchTotalHits).value, skip, limit,
            dataList: result.body.hits.hits.map(x => Object.assign({resourceId: x._id}, omit(x._source, ['uniqueKey'])))
        } as PageResult<ResourceInfo>;
    }
}
