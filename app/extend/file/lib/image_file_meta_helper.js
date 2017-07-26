/**
 * Created by yuliang on 2017/7/4.
 */

const sizeOf = require('image-size')

module.exports = fileBuffer => {
    try {
        let imageFile = sizeOf(fileBuffer)
        return {
            width: imageFile.width,
            height: imageFile.height,
        }
    } catch (err) {
        console.log(err)
        return {}
    }
}
