var fs      = require('fs'),
    path    = require('path'),
    gulp    = require('gulp'),
    concat  = require('gulp-concat'),//多个文件合并为一个
    cleanCSS= require('gulp-clean-css'),//压缩css为一行
    uglify  = require('gulp-uglify'),//js压缩
    imageMin= require('gulp-imagemin'),//压缩图片
    pngquant= require('imagemin-pngquant'),//深度压缩
    htmlMin = require('gulp-htmlmin'),//压缩html
    changed = require('gulp-changed'),//检查改变状态
    less    = require('gulp-less'),//压缩合并less
    del     = require('del'),//删除
    cssmin  = require('gulp-minify-css'),//css压缩
    notify  = require('gulp-notify'),//提示
    plumber = require('gulp-plumber'),//提示错误
    jade    = require('gulp-jade'),//jade模板
    browserSync = require('browser-sync').create(),//浏览器实时刷新
    autoprefix  = require('gulp-autoprefixer');//添加前缀
//删除dist下所有文件
gulp.task('delete', function(cb){
  return del(['dist/*','!dist/images',"!dist/public"],cb)
})
//实时编译less
gulp.task('less', function(){
  gulp.src(['src/less/*.less'])//多个文件以数组形式传入
      .pipe(plumber({errorHandler: notify.onError('Less -- Error: <%= error.message %>')}))
      // .pipe(changed('dist/css', {hasChanged: changed.compareShalDigest}))
      .pipe(less())
      .pipe(autoprefix())//加css前缀
      // .pipe(concat('main.css'))//合并生成main.css
      .pipe(cleanCSS())//压缩新生成的css
      .pipe(gulp.dest('dist/css/'))
      .pipe(browserSync.reload({stream:true}))//实时刷新浏览器
      // .pipe(notify({message:'css task ok'}));
});
//压缩js
gulp.task('script', function(){
  gulp.src(['src/js/*.js'])
      .pipe(plumber({errorHandler: notify.onError('Less -- Error: <%= error.message %>')}))
      // .pipe(changed('dist/js', {hasChanged: changed.compareShalDigest}))
      // .pipe(concat('index.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'))
      .pipe(browserSync.reload({stream:true}));
      // .pipe(notify({message:'js task ok'}));//提示
});
//压缩html
gulp.task('jade', function(){
  var options = {
    removeComments: true,//清除HTML注释
    collapseWhitespace: true,//压缩HTML,
    removeScriptTypeAttributes: true,//删除<script>的type='text/javascript'
    removeStypeLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
  }
  gulp.src('src/*.jade')
      .pipe(plumber({errorHandler: notify.onError('Less -- Error: <%= error.message %>')}))
      .pipe(jade())
      .pipe(changed('dist'), {hasChanged: changed.compareShalDigest})
      .pipe(htmlMin(options))
      .pipe(gulp.dest('dist/'))
      .pipe(browserSync.reload({stream:true}));
});
//压缩图片
gulp.task('images', function(){
  gulp.src('./src/images/*.*')
      // .pipe(changed('dist'), {hasChanged: changed.compareShalDigest})
      .pipe(imageMin({
          progressive: true,//无损压缩JPG图片
          svgoPlugins: [{removeViewBox: false}],//不移除svg的viewbox属性
          use: [pngquant()]//使用pngquant插件进行深度压缩
      }))
      .pipe(gulp.dest('dist/images'))
      .pipe(browserSync.reload({stream:true}));
})
gulp.task('publicJS', function(){
  gulp.src('./src/public/js/*.js')
      .pipe(uglify())
      .pipe(gulp.dest('dist/public/js'))
      .pipe(browserSync.reload({stream:true}));
})
gulp.task('publicCSS', function(){
  gulp.src('./src/public/css/*.css')
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist/public/css'))
      .pipe(browserSync.reload({stream:true}));
})
//启动热更新
gulp.task('server', ['delete'], function(){
  gulp.start('script','less', 'jade','publicJS','images','publicCSS');
  browserSync.init({
    port: 2017,
    server:{
      baseDir: ['dist']
    }
  });
  gulp.watch('src/js/*.js', ['script']); //监控文件变化,自动更新
  gulp.watch('src/less/*.less', ['less']);
  gulp.watch('src/*.jade', ['jade']);
  gulp.watch('src/images/*.*', ['images']);
  gulp.watch('src/public/js/*.js', ['publicJS']);
  gulp.watch('src/public/css/*.css', ['publicCSS']);
})
gulp.task('default', ['server']);
