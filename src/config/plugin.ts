import {EggPlugin} from 'midway';

export default {
    static: true, // default is true

    freelogDataBase: {
        enable: true,
        package: 'egg-freelog-database',
    },

    freelogBase: {
        enable: true,
        package: 'egg-freelog-base',
    },
} as EggPlugin;
