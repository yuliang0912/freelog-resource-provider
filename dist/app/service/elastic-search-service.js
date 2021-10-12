"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticSearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const midway_1 = require("midway");
const lodash_1 = require("lodash");
let ElasticSearchService = class ElasticSearchService {
    client = new elasticsearch_1.Client({
        node: 'http://119.23.63.19:32519'
    });
    /**
     * 搜索关键字建议
     * @param prefix
     */
    async suggest(prefix) {
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
        return (0, lodash_1.uniq)(Object.values(result.body.suggest).map(x => x.map(m => m.options)).flat(2).map(x => x['text']));
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
    async search(skip, limit, sort, keywords, userId, resourceType, omitResourceType, status, tags, projection) {
        const searchParams = {
            index: 'test-resources.resource-infos',
            body: {
                query: {
                    bool: {}
                },
            },
            from: skip,
            size: limit
        };
        const musts = [];
        const mustNots = [];
        if (keywords?.length) {
            musts.push({
                query_string: {
                    query: keywords, fields: ['resourceName^1.5', 'resourceType', 'intro^0.7', 'tags']
                }
            });
        }
        else {
            sort = { updateDate: -1 };
        }
        if (userId) {
            musts.push({ term: { userId: { value: userId } } });
        }
        if (resourceType) {
            musts.push({ term: { resourceType: { value: resourceType } } });
        }
        if ((0, lodash_1.isNumber)(status)) {
            musts.push({ term: { status: { value: status } } });
        }
        if ((0, lodash_1.isArray)(tags) && !(0, lodash_1.isEmpty)(tags)) {
            musts.push({ terms: { tags: tags } });
        }
        if (omitResourceType) {
            mustNots.push({ term: { resourceType: { value: omitResourceType } } });
        }
        if (!(0, lodash_1.isEmpty)(musts)) {
            searchParams.body.query.bool.must = musts;
        }
        if (!(0, lodash_1.isEmpty)(mustNots)) {
            searchParams.body.query.bool.must_not = mustNots;
        }
        if (!(0, lodash_1.isEmpty)(projection ?? [])) {
            searchParams._source = projection;
        }
        if (sort) {
            searchParams.body.sort = [];
            for (const [key, value] of Object.entries(sort)) {
                searchParams.body.sort.push({ [key]: ['DESC', 'desc', '-1', -1].includes(value) ? 'desc' : 'asc' });
            }
        }
        const result = await this.client.search(searchParams);
        return {
            totalItem: result.body.hits.total.value, skip, limit,
            dataList: result.body.hits.hits.map(x => Object.assign({ resourceId: x._id }, (0, lodash_1.omit)(x._source, ['uniqueKey'])))
        };
    }
};
ElasticSearchService = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('elasticSearchService')
], ElasticSearchService);
exports.ElasticSearchService = ElasticSearchService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxhc3RpYy1zZWFyY2gtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9lbGFzdGljLXNlYXJjaC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDBEQUE4QztBQUc5QyxtQ0FBc0M7QUFFdEMsbUNBQThEO0FBTTlELElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBRXJCLE1BQU0sR0FBYSxJQUFJLHNCQUFNLENBQUM7UUFDbEMsSUFBSSxFQUFFLDJCQUEyQjtLQUNwQyxDQUFRLENBQUM7SUFFVjs7O09BR0c7SUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWM7UUFFeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxLQUFLLEVBQUUsK0JBQStCO1lBQ3RDLElBQUksRUFBRTtnQkFDRixPQUFPLEVBQUU7b0JBQ0wsRUFBRSxFQUFFO3dCQUNBLE1BQU07d0JBQ04sVUFBVSxFQUFFOzRCQUNSLEtBQUssRUFBRSxpQkFBaUI7eUJBQzNCO3FCQUNKO29CQUNELE1BQU0sRUFBRTt3QkFDSixNQUFNO3dCQUNOLFVBQVUsRUFBRTs0QkFDUixLQUFLLEVBQUUsNkJBQTZCO3lCQUN2QztxQkFDSjtpQkFDSjtnQkFDRCxPQUFPLEVBQUUsRUFBRTthQUNkO1NBQ0osQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGFBQUksRUFBUyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxD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