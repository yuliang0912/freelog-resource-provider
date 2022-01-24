"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ElasticSearchService = void 0;
var elasticsearch_1 = require("@elastic/elasticsearch");
var midway_1 = require("midway");
var lodash_1 = require("lodash");
var ElasticSearchService = /** @class */ (function () {
    function ElasticSearchService() {
    }
    ElasticSearchService.prototype.constructorBse = function () {
        this.client = new elasticsearch_1.Client({ node: this.elasticSearch.url });
    };
    /**
     * 搜索关键字建议
     * @param prefix
     */
    ElasticSearchService.prototype.suggest = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.search({
                            index: 'test-resources.resource-infos',
                            body: {
                                suggest: {
                                    kw: {
                                        prefix: prefix,
                                        completion: {
                                            field: 'resourceName.kw'
                                        }
                                    },
                                    pinyin: {
                                        prefix: prefix,
                                        completion: {
                                            field: 'resourceNameAbbreviation.py'
                                        }
                                    }
                                },
                                _source: ''
                            }
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, (0, lodash_1.uniq)(Object.values(result.body.suggest).map(function (x) { return x.map(function (m) { return m.options; }); }).flat(2).map(function (x) { return x['text']; }))];
                }
            });
        });
    };
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
    ElasticSearchService.prototype.search = function (skip, limit, sort, keywords, userId, resourceType, omitResourceType, status, tags, projection) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, musts, mustNots, _i, _a, _b, key, value, result;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        searchParams = {
                            index: 'test-resources.resource-infos',
                            body: {
                                query: {
                                    bool: {}
                                },
                            },
                            from: skip,
                            size: limit
                        };
                        musts = [];
                        mustNots = [];
                        if (keywords === null || keywords === void 0 ? void 0 : keywords.length) {
                            musts.push({
                                query_string: {
                                    query: keywords.replace(/\//g, '//'),
                                    fields: ['resourceName^1.5', "resourceNameAbbreviation^1.2", 'resourceNameAbbreviation.py^0.8', 'resourceType', 'intro^0.7', 'tags']
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
                        if (!(0, lodash_1.isEmpty)(projection !== null && projection !== void 0 ? projection : [])) {
                            searchParams._source = projection;
                        }
                        if (sort) {
                            searchParams.body.sort = [];
                            for (_i = 0, _a = Object.entries(sort); _i < _a.length; _i++) {
                                _b = _a[_i], key = _b[0], value = _b[1];
                                searchParams.body.sort.push((_c = {}, _c[key] = ['DESC', 'desc', '-1', -1].includes(value) ? 'desc' : 'asc', _c));
                            }
                        }
                        return [4 /*yield*/, this.client.search(searchParams)];
                    case 1:
                        result = _d.sent();
                        return [2 /*return*/, {
                                totalItem: result.body.hits.total.value,
                                skip: skip,
                                limit: limit,
                                dataList: result.body.hits.hits.map(function (x) { return Object.assign({ resourceId: x._id }, (0, lodash_1.omit)(x._source, ['uniqueKey'])); })
                            }];
                }
            });
        });
    };
    __decorate([
        (0, midway_1.config)('elasticSearch')
    ], ElasticSearchService.prototype, "elasticSearch");
    __decorate([
        (0, midway_1.init)()
    ], ElasticSearchService.prototype, "constructorBse");
    ElasticSearchService = __decorate([
        (0, midway_1.scope)('Singleton'),
        (0, midway_1.provide)('elasticSearchService')
    ], ElasticSearchService);
    return ElasticSearchService;
}());
exports.ElasticSearchService = ElasticSearchService;
