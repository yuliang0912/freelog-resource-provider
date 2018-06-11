'use strict'

const Busboy = require('busboy')

module.exports = {

    /**
     * 获取multipart类型的字段,以及fileStream
     */
    getFieldsAndFileStream() {

        return new Promise((resolve, reject) => {
            let fields = {}, files = {}
            let busboy = new Busboy({headers: this.req.headers})

            busboy.on('file', async (fieldName, file, fileName, encoding, mimeType) => {
                files[fieldName] = {fieldName, file, fileName, encoding, mimeType}
                file.on('data', function () {
                })
            }).on("field", (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
                fields[fieldname] = val
            }).on('error', function (err) {
                reject(err)
            }).on('finish', function () {
                resolve({fields, files})
            })
            this.req.pipe(busboy)
        })
    },

    /**
     * restful-base-url
     * @returns {*}
     */
    get webApi() {
        return this.app.webApi
    }
}