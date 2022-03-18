"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticSearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const midway_1 = require("midway");
const lodash_1 = require("lodash");
let ElasticSearchService = class ElasticSearchService {
    elasticSearch;
    client;
    constructorBse() {
        this.client = new elasticsearch_1.Client({ node: this.elasticSearch.url });
    }
    /**
     * 搜索关键字建议
     * @param prefix
     */
    async suggest(prefix) {
        const result = await this.client.search({
            index: `${this.elasticSearch.database}.resource-infos`,
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
    async search(skip, limit, sort, keywords, userId, resourceType, omitResourceType, status, tags, projection, beginCreateDate, endCreateDate) {
        sort = sort ?? { updateDate: -1 };
        const searchParams = {
            index: `${this.elasticSearch.database}.resource-infos`,
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
                    query: keywords.replace(/\//g, '//'),
                    fields: ['resourceName^1.5', `resourceNameAbbreviation^1.2`, 'resourceNameAbbreviation.py^0.8', 'resourceType', 'intro^0.7', 'tags']
                }
            });
        }
        if (userId) {
            musts.push({ term: { userId: { value: userId } } });
        }
        if (resourceType) {
            musts.push({ term: { resourceType: { value: resourceType } } });
        }
        if ((0, lodash_1.includes)([0, 1], status)) {
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
        let createDateFilter = {};
        if (beginCreateDate && endCreateDate) {
            createDateFilter.gte = beginCreateDate.toISOString();
            createDateFilter.lte = endCreateDate.toISOString();
        }
        else if (beginCreateDate) {
            createDateFilter.gte = beginCreateDate.toISOString();
        }
        else if (endCreateDate) {
            createDateFilter.lte = endCreateDate.toISOString();
        }
        if (Object.keys(createDateFilter).length) {
            searchParams.body.query.bool.filter = {
                range: { createDate: createDateFilter }
            };
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
__decorate([
    (0, midway_1.config)('elasticSearch'),
    __metadata("design:type", Object)
], ElasticSearchService.prototype, "elasticSearch", void 0);
__decorate([
    (0, midway_1.init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElasticSearchService.prototype, "constructorBse", null);
ElasticSearchService = __decorate([
    (0, midway_1.scope)('Singleton'),
    (0, midway_1.provide)('elasticSearchService')
], ElasticSearchService);
exports.ElasticSearchService = ElasticSearchService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxhc3RpYy1zZWFyY2gtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHAvc2VydmljZS9lbGFzdGljLXNlYXJjaC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBEQUE4QztBQUc5QyxtQ0FBb0Q7QUFFcEQsbUNBQThEO0FBTTlELElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBRzdCLGFBQWEsQ0FBQztJQUNOLE1BQU0sQ0FBVztJQUd6QixjQUFjO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHNCQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUMsQ0FBUSxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWM7UUFDeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsaUJBQWlCO1lBQ3RELElBQUksRUFBRTtnQkFDRixPQUFPLEVBQUU7b0JBQ0wsRUFBRSxFQUFFO3dCQUNBLE1BQU07d0JBQ04sVUFBVSxFQUFFOzRCQUNSLEtBQUssRUFBRSxpQkFBaUI7eUJBQzNCO3FCQUNKO29CQUNELE1BQU0sRUFBRTt3QkFDSixNQUFNO3dCQUNOLFVBQVUsRUFBRTs0QkFDUixLQUFLLEVBQUUsNkJBQTZCO3lCQUN2QztxQkFDSjtpQkFDSjtnQkFDRCxPQUFPLEVBQUUsRUFBRTthQUNkO1NBQ0osQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGFBQUksRUFBUyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcs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