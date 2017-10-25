/**
 * Created by yuliang on 2017/10/24.
 */

'use strict'

module.exports = {

    /**
     * 获取数量
     * @param condition
     */
    count(condition){
        return eggApp.knex.resource('components').where(condition).count("* as count").first()
    }
}