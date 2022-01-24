"use strict";
exports.__esModule = true;
exports.ContractAuthStatusEnum = void 0;
var ContractAuthStatusEnum;
(function (ContractAuthStatusEnum) {
    /**
     * 只获得正式授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Authorized"] = 1] = "Authorized";
    /**
     * 只获得测试授权
     * @type {number}
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["TestNodeAuthorized"] = 2] = "TestNodeAuthorized";
    /**
     * 未获得任何授权
     */
    ContractAuthStatusEnum[ContractAuthStatusEnum["Unauthorized"] = 128] = "Unauthorized";
})(ContractAuthStatusEnum = exports.ContractAuthStatusEnum || (exports.ContractAuthStatusEnum = {}));
