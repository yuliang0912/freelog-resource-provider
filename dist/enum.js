"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractStatusEnum = exports.IdentityType = exports.SubjectTypeEnum = void 0;
/**
 * 标的物类型
 */
var SubjectTypeEnum;
(function (SubjectTypeEnum) {
    SubjectTypeEnum[SubjectTypeEnum["Resource"] = 1] = "Resource";
    SubjectTypeEnum[SubjectTypeEnum["Presentable"] = 2] = "Presentable";
    SubjectTypeEnum[SubjectTypeEnum["UserGroup"] = 3] = "UserGroup";
})(SubjectTypeEnum = exports.SubjectTypeEnum || (exports.SubjectTypeEnum = {}));
/**
 * 合同类型
 */
var IdentityType;
(function (IdentityType) {
    IdentityType[IdentityType["Resource"] = 1] = "Resource";
    IdentityType[IdentityType["Node"] = 2] = "Node";
    IdentityType[IdentityType["ClientUser"] = 3] = "ClientUser";
})(IdentityType = exports.IdentityType || (exports.IdentityType = {}));
var ContractStatusEnum;
(function (ContractStatusEnum) {
    /**
     * 正常生效中
     */
    ContractStatusEnum[ContractStatusEnum["Executed"] = 0] = "Executed";
    /**
     * 合同已终止(未授权,并且不再接受新事件)
     * @type {number}
     */
    ContractStatusEnum[ContractStatusEnum["Terminated"] = 1] = "Terminated";
    /**
     * 异常的,例如签名不对,冻结等.
     * @type {number}
     */
    ContractStatusEnum[ContractStatusEnum["Exception"] = 2] = "Exception";
})(ContractStatusEnum = exports.ContractStatusEnum || (exports.ContractStatusEnum = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOztHQUVHO0FBQ0gsSUFBWSxlQUlYO0FBSkQsV0FBWSxlQUFlO0lBQ3ZCLDZEQUFZLENBQUE7SUFDWixtRUFBZSxDQUFBO0lBQ2YsK0RBQWEsQ0FBQTtBQUNqQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7QUFFRDs7R0FFRztBQUNILElBQVksWUFJWDtBQUpELFdBQVksWUFBWTtJQUNwQix1REFBWSxDQUFBO0lBQ1osK0NBQUksQ0FBQTtJQUNKLDJEQUFVLENBQUE7QUFDZCxDQUFDLEVBSlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFJdkI7QUFFRCxJQUFZLGtCQWlCWDtBQWpCRCxXQUFZLGtCQUFrQjtJQUMxQjs7T0FFRztJQUNILG1FQUFZLENBQUE7SUFFWjs7O09BR0c7SUFDSCx1RUFBYyxDQUFBO0lBRWQ7OztPQUdHO0lBQ0gscUVBQWEsQ0FBQTtBQUNqQixDQUFDLEVBakJXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBaUI3QiJ9