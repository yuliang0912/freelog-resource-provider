
const fs = require('fs');
const pparse = require('papaparse').parse;

var csv = __dirname + '/event_def.csv'

var importDef = function (){
  return new Promise (function(resolve, reject){
    fs.readFile(csv, 'utf8', (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
}

//deprecated parse function, has bug (cant parse comma within quotes properly)
//to be rewrite once getting rid of papaparse dependency become necessary
var parseDef = (data) => {
  let lines = data.split(/\r?\n/);
  if (lines.length <= 1) {
    throw 'improper source';
  }
  let attrs = lines[0].split('\,');

  let events = [];
  lines.slice(1, lines.length-1).forEach((curr_line) => {
    let entries = curr_line.split(',');
    let entry = {};
    for (let i = 0; i < attrs.length; i++) {
      entry[attrs[i]] = entries[i];
    }
    events.push(entry);
  });
  return events;
}

function EventDefinitions(){}

EventDefinitions.JSONDef = function(){
  return importDef()
  .then(parseDef)
  .then((data) => {
    return data.filter((item) => {
      return item['Code'].length > 0;
    });
  })
  .catch(err => console.log(err));
}

EventDefinitions.JSONDefSync = function(){
  let data = fs.readFileSync(csv, 'utf8');
  let events = pparse(data, {header: true}).data;
  return events.filter((item) => {
    return item['Code'].length > 0;
  });
}

exports.EventDefinitions = EventDefinitions;
