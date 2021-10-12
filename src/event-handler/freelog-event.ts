import * as events from 'events';
import {provide, scope} from 'midway';

@scope('Singleton')
@provide('freelogEvent')
export class FreelogEvent extends events.EventEmitter {

}

