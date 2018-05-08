'use strict'

module.exports = class ImageFileCheck {

    async check({fileStream, resourceName, resourceType, meta, userId}) {

        let fileType = {}
        let chunks = []

        fileStream.once('data', chunk => {
            fileType = fileType(chunk)
        })

        fileStream.on('data', function (chunk) {
            chunks.push(chunk)
        })

        fileStream.on('end', async function () {
            let fileBuffer = Buffer.concat(chunks)

            try {
                let imageFile = sizeOf(fileBuffer)
                return {
                    systemMeta: {
                        width: imageFile.width,
                        height: imageFile.height
                    }
                }
            } catch (err) {
                err.message += 'Image check error:'
                return {
                    errors: [err]
                }
            }
        })

        fileStream.on('error', error => {
            throw error
        })
    }
}
