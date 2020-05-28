import {controller, get, provide} from 'midway';
import {LoginUser, InternalClient} from 'egg-freelog-base';
import {visitorIdentity} from '../extend/vistorIdentityDecorator';

@provide()
@controller('/v1/resources')
export class ResourceVersionController {

    @get('/')
    @visitorIdentity(LoginUser | InternalClient)
    async index(ctx) {
        ctx.validateParams();
        ctx.success('success');
    }
}