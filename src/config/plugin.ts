import {EggPlugin} from 'midway';

export default {
    static: false, // default is true

    freelogDataBase: {
        enable: true,
        package: 'egg-freelog-database',
    },

    freelogBase: {
        enable: true,
        package: 'egg-freelog-base',
    },
} as EggPlugin;
