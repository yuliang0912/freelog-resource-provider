/**
 * Created by yuliang on 2017/7/4.
 */

'use strict'

const Busboy = require('busboy')
const Promise = require('bluebird')
const upload = require('../../extend/upload/upload_factory')

module.exports = function (ctx) {
    return new Promise((resolve, reject) => {
        let fields = {}, files = [], index = 0
        let busboy = new Busboy({headers: ctx.req.headers})

        busboy.on('file', async (fieldName, file, fileName, encoding, mimeType) => {
            let fileSize = 0
            file.on("data", function (data) { //接收文件流放入缓冲区
                fileSize += data.length
            })
            file.on("end", function () {
                files[fieldName] = {fieldName, file, fileName, encoding, mimeType, size: fileSize}
            })
            if (fileName.length > 0) {
                await upload(ctx.app.config.uploadConfig).putStream(file, 'Image', fileName).then(console.log)
            }
        }).on("field", (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
            fields[fieldname] = val
        }).on('error', function (err) {
            reject(err)
        }).on('finish', function () {
            ctx.request.body = fields
            ctx.request.body.files = files
            resolve({fields, files})
        })
        ctx.req.pipe(busboy)
    })
}