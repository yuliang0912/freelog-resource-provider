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
    async search(skip, limit, sort, keywords, userId, resourceType, omitResourceType, status, tags, projection) {
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
        else {
            sort = { updateDate: -1 };
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