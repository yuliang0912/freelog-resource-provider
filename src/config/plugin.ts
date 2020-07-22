import {EggPlugin} from 'midway';

export default {
    static: false, // default is true

    freelogBase: {
        enable: true,
        package: 'egg-freelog-base',
    },
} as EggPlugin;
