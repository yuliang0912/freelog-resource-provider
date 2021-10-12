import {scope, provide, plugin} from 'midway';
import {MongooseModelBase} from 'egg-freelog-base/database/mongoose-model-base';
import {assign, omit} from 'lodash';

@scope('Singleton')
@provide('model.ResourceTagInfo')
export class ResourceTagInfoModel extends MongooseModelBase {

    constructor(@plugin('mongoose') mongoose) {
        super(mongoose);
    }

    buildMongooseModel() {

        // 后续产品的需求是tag不能由用户自由输入了,只能选择.前端用户可以选择分类标签. 后台可以选择全部
        const ResourceTagSchema = new this.mongoose.Schema({
            tagName: {type: String, required: true},
            tagType: {type: Number, required: true}, // 标签类型: 1.分类标签 2.运营标签
            authority: {type: Number, required: true}, // 权限: 1.公开 2.隐藏(对外不可见,但是标签还存在) 3.管理员可见
            resourceRange: {type: [String], default: [], required: false}, // 资源类型使用范围
            resourceRangeType: {type: Number, enum: [1, 2], required: true}, // 1:包含 2:排除 3:全部
            createUserId: {type: Number, required: true},
        }, {
            versionKey: false,
            timestamps: {createdAt: 'createDate', updatedAt: 'updateDate'},
            toJSON: ResourceTagInfoModel.toJSONOptions
        });

        ResourceTagSchema.index({tagName: 1}, {unique: true});

        return this.mongoose.model('resource-tag-infos', ResourceTagSchema);
    }

    static get toJSONOptions() {
        return {
            getters: true,
            virtuals: true,
            transform(doc, ret) {
                return assign({tagId: doc.id}, omit(ret, ['_id', 'id', 'createUserId']));
            }
        };
    }
}
