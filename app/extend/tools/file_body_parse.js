/**
 * Created by yuliang on 2017/7/4.
 */

'use strict'

const Busboy = require('busboy')

module.exports = function (ctx) {
    return new Promise((resolve, reject) => {
        let fields = {}, files = [], index = 0
        let busboy = new Busboy({headers: ctx.req.headers})

        busboy.on('file', async (fieldName, file, fileName, encoding, mimeType) => {

            console.log(encoding)

            let fileSize = 0
            file.on("data", function (data) { //接收文件流放入缓冲区
                fileSize += data.length
            })
            file.on("end", function () {
                files[fieldName] = {fieldName, file, fileName, encoding, mimeType, size: fileSize}
            })
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