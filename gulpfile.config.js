const SRC_DIR  = './src/';//源文件目录
const DIST_DIR = './dist/';//文件处理后存放的目录



var Config = {
  jade: {
    src : SRC_DIR + '*.jade',
    dist: DIST_DIR,
  },
  less: {
    src : SRC_DIR  + 'less/*.less',
    dist: DIST_DIR + 'css/',
  },
  script: {
    src : SRC_DIR  + 'js/*.js',
    dist: DIST_DIR + 'js/',
  },
  images: {
    src : SRC_DIR  + '*.*',
    dist: DIST_DIR + 'images/'
  },
  publicJS: {
    src : SRC_DIR  + 'public/*.js',
    dist: DIST_DIR + 'public/js/'
  },
  publicCSS: {
    src : SRC_DIR + '*.css',
    dist: DIST_DIR + 'public/css/'
  },
  del: {
    con:['dist/*','!dist/images',"!dist/public"]
  }
}
module.exports =  Config;
