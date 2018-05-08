'use strict'

module.exports = class FileGeneralCheck {

    async check({fileStream, resourceName, resourceType, meta, userId}) {

        let fileInfo = {fileSize: 0}
        const sha1sum = crypto.createHash('sha1')

        fileStream.once('data', chunk => {
            fileInfo = Object.assign(fileInfo, fileType(chunk))
        })

        fileStream.on('data', function (chunk) {
            sha1sum.update(chunk)
            fileInfo.fileSize += chunk.length
        })

        fileStream.on('end', async function () {
            fileInfo.sha1 = sha1sum.digest('hex')
            return fileInfo
        })

        fileStream.on('error', error => {
            throw error
        })
    }
}
