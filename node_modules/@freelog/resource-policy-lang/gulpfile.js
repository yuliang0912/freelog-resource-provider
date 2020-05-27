var gulp = require('gulp');
var exec = require('child_process').exec;


var mac_antlr_path = '/usr/local/lib/antlr-4.7.1-complete.jar';
var win_antlr_path = 'C:/Javalib/antlr-4.7.1-complete.jar'
var dest = './gen';

gulp.task('compile', function(callback) {
  let env = process.env;
  if (process.platform === 'darwin') {
    exec(`java -jar ${mac_antlr_path} -Dlanguage=JavaScript -o ${dest} -visitor resourcePolicy.g4`, env, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      callback(err);
    });
  }
  if (process.platform === 'win32') {
    exec(`java -jar ${win_antlr_path} -Dlanguage=JavaScript -o ${dest} -visitor resourcePolicy.g4`, env, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      callback(err);
    });
  }
});
