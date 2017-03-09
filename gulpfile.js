var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');


gulp.task('livereload', function() {

  //開啟livereload server，讓前端的livereload套件可以與之連接
  livereload.listen();

  //livereload server會去監控下列檔案，當檔案被更動則馬上刷新畫面
  gulp.watch(['*.js', 'controllers/*.js', 'views/*.ejs','/public/*.css'], function(file) {
    console.log("change " + file.path);
    livereload.changed(file.path);
  });
});


gulp.task('nodemon', function() {

  var stream = nodemon({
    script: 'bin/www',
    ext: 'js'
  });

  stream
    .on('restart', function() {
      console.log('restarted!');
    })
    .on('crash', function() {
      console.error('Application has crashed!\n');
      stream.emit('restart', 5); // restart the server in 5 seconds 
    });
});

//下gulp指令，將會執行default旗下的所有task
gulp.task('default', ['nodemon', 'livereload']);
