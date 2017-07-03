/**
 * Created by yuliang on 2017/6/30.
 */

module.exports = app => {
    return class UserService extends app.Service {

        async getUserInfo(condition) {
            let {type, knex} = this.app

            if (!type.object(condition)) {
                return Promise.resolve(null)
            }

            return knex.user('user_info').where(condition).first()
        }
    }
}