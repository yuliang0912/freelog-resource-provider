/**
 * Created by yuliang on 2017/7/4.
 */

const fileMetaCheck = require('./file_meta_check')
const resourceTypeEnum = require('../../enum/resource_type')
const imageMetaHelper = require('./lib/image_file_meta_helper')


module.exports = (file, resourceType) => {
    if (!Buffer.isBuffer(file.buffer)) {
        throw new Error('first args must be buffer')
    }

    let metaInfo = {
        fileName: file.fileName,
        size: file.buffer.length,
        extName: getFileExt(file.fileName)
    }

    const result = fileMetaCheck(file.mimeType, resourceType)

    if (result.ret === 0) {
        return metaInfo
    }

    let partInfo = {}
    switch (resourceType) {
        case resourceTypeEnum.IMAGE:
            partInfo = imageMetaHelper(file)
            break;
        default:
            break;
    }

    return Object.assign(metaInfo, partInfo)
}


const getFileExt = (str) => {
    let reg = /\.[^\.]+$/.exec(str);
    return reg ? reg[0] : ''
}

