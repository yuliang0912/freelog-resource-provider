'use strict'

const lodash = require('lodash')
const Service = require('egg').Service
const policyParse = require('../extend/helper/policy_parse_factory')

class AuthSchemeService extends Service {

    /**
     * 更新授权方案
     * @returns {Promise<void>}
     */
    async updateAuthScheme({authScheme, authSchemeName, policyText, status}) {

        let model = {
            authSchemeName: authSchemeName || authScheme.authSchemeName
        }
        if (status !== undefined) {
            model.status = status
        }
        if (policyText) {
            model.serialNumber = this.app.mongoose.getNewObjectId()
            model.policy = policyParse.parse(policyText, authScheme.languageType)
        }

        return this.ctx.dal.authSchemeProvider.update({_id: authScheme.authSchemeId}, model)
    }

    /**
     * 创建授权方案
     * @param resourceId
     * @param policyText
     * @param languageType
     * @param dutyStatements 责任声明
     * @returns {Promise<void>}
     */
    async createAuthScheme({authSchemeName, resourceInfo, policyText, languageType, dutyStatements}) {

        const {app, ctx} = this;

        let authScheme = {
            authSchemeName, languageType, dutyStatements,
            resourceId: resourceInfo.resourceId,
            serialNumber: app.mongoose.getNewObjectId(),
            userId: ctx.request.userId
        }

        if (policyText) {
            authScheme.policyText = policyText
            authScheme.policy = policyParse.parse(policyText, languageType)
        }
        resourceInfo.systemMeta.dependencies = resourceInfo.systemMeta.dependencies || []
        //校验数据与构建model
        await this._perfectAuthScheme({authScheme, resourceInfo, dutyStatements})

        return ctx.dal.authSchemeProvider.create(authScheme)
    }

    /**
     * 检查声明,完善model
     * @param authScheme
     * @param resourceInfo
     * @param dutyStatements
     * @private
     */
    async _perfectAuthScheme({authScheme, resourceInfo, dutyStatements}) {

        const {ctx} = this
        const authSchemes = await this._getAndCheckDutyStatements({resourceInfo, dutyStatements})
        const statistics = authSchemes.reduce((accumulator, authScheme) => {
            authScheme = authScheme.toObject()
            const dutyStatement = dutyStatements.find(x => x.authSchemeId === authScheme.authSchemeId)
            if (lodash.difference(dutyStatement.statements, authScheme.bubbles).length) {
                ctx.error({msg: '参数dutyStatements校验失败', data: {dutyStatement, bubbles: authScheme.bubbles}})
            }
            accumulator.authSchemeResourceIds.push(authScheme.resourceId)
            accumulator.bubbleResourceIds = accumulator.bubbleResourceIds.concat(lodash.difference(authScheme.bubbles, dutyStatement.statements))
            accumulator.statementResourceIds = accumulator.statementResourceIds.concat(dutyStatement.statements)
            return accumulator
        }, {
            statementResourceIds: [],
            authSchemeResourceIds: [],
            bubbleResourceIds: resourceInfo.systemMeta.dependencies.map(x => x.resourceId) || []
        })

        authScheme.dependCount = resourceInfo.systemMeta.dependencies.length
        authScheme.bubbleResourceIds = this._distinctAndExclude(statistics.bubbleResourceIds, statistics.authSchemeResourceIds)
        authScheme.statementResourceIds = this._distinctAndExclude(statistics.statementResourceIds, statistics.authSchemeResourceIds)
        authScheme.statementAuthSchemes = authSchemes.map(item => new Object({
            resourceId: item.resourceId,
            authSchemeId: item.toObject().authSchemeId
        }))

        return authScheme
    }

    /**
     * 去重,然后排除指定的部分
     * @param array
     * @param exclude
     * @returns {*[]}
     * @private
     */
    _distinctAndExclude(array, exclude = []) {
        return [...new Set(array)].filter(x => !exclude.includes(x))
    }

    /**
     * 检查声明
     * @param resourceInfo
     * @param dutyStatements
     * @private
     */
    async _getAndCheckDutyStatements({resourceInfo, dutyStatements}) {

        const {ctx} = this

        if (!dutyStatements.length) {
            return []
        }
        if (dutyStatements.length > resourceInfo.systemMeta.dependencies.length) {
            ctx.error({
                msg: '参数dutyStatements校验失败',
                data: {dutyStatements, dependencies: resourceInfo.systemMeta.dependencies}
            })
        }

        const condition = {
            _id: {$in: dutyStatements.map(t => t.authSchemeId)},
            resourceId: {$in: resourceInfo.systemMeta.dependencies.map(item => item.resourceId)},
        }

        const authSchemes = await ctx.dal.authSchemeProvider.find(condition)
        if (authSchemes.length !== dutyStatements.length) {
            ctx.error({msg: '参数dutyStatements校验失败', data: {dutyStatements, authSchemes}})
        }

        return authSchemes
    }
}

module.exports = AuthSchemeService