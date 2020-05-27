var fs = require('fs')
var path = require('path')
var EventDefinitions = require('./index').EventDefinitions

var eventListString = JSON.stringify(EventDefinitions.JSONDefSync())
eventListString = `module.exports=${eventListString}`

createFolder('lib/event_definition.js')
fs.writeFile('lib/event_definition.js', eventListString, (err) => {
  if (err) throw err
  console.log('build >>>> Success!')
})

function createFolder(to) {
  var sep = path.sep
  var folders = path.dirname(to).split(sep)

  var p = ''
  while (folders.length) {
    p += folders.shift() + sep
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p)
    }
  }
}