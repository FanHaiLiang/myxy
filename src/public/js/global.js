var store = require('store.js')
(function(w){
  function serverConfig(){
    var host     = window.location.host,
        protocol = window.location.protocol,
        server   = {};
    if( host === 'teacher.peapad.com.cn' ){
      peapad.ENV = 'production';
      server.serverstr = protocol + "//api.peapad.com.cn/api/t"
    } else if( host === "teacher.peapad.cn" ){
      peapad.ENV = 'test';
      server.serverstr = protocol + "//api.peapad.cn/api/t"
    } else {
      peapad.ENV = 'dev';
      server.serverstr = 'http://api.peapad.cn/api/t';
    }
    return server;
  }

  var peapad = w.peapad = {};//全局命名空间
  //下载文件用
  function downloadFile(fileName,href){
    if(href){
      window.open(href);
    }
  }
  peapad.config = {
    server             :serverConfig(),
  }
  function wrapper(type){
    return function(path,data,callback,unAuth){
      var token = peapad.getToken();
      data      = data || {};
      if( data.forceUseToken ){
        token = data.forceUseToken
        delete data.forceUseToken;
      }
      var requestUrl = peapad.config.server.serverstr + path;
      if(data.forceUseUrl){
        requestUrl = data.forceUseUrl;
        delete data.forceUseUrl;
      }
      $.ajax({
              headers:{
                "authorization":token,
              },
              data   : data,
              url    :requestUrl,
              async  :true,
              success:function(data,textStatus,jqXHR){
                (typeof callback == "function") && callback(null,data,textStatus,jqXHR);
              },
              type   :type,
              error  :function(jqXHR,textStatus,errorMsg){
                if( typeof callback == 'function'){
                  if(jqXHR.status === 401){
                    peapad.cleanUserInfo();
                    window.location.href = 'signin.html';
                  }
                  callback('Error:' + textStatus + errorMsg);
                  return
                  if( jqXHR.status === 401 && typeof unAuth == "function" ) return unAuth("Unauthorized");
                }
              }
      })
    }
  }
  peapad.get  = wrapper('GET');
  peapad.post = wrapper('post');
  //权限控制
  peapad.userType = {
    isTeacher     :function(){
      var userInfo = peapad.getUserInfo();
      return userInfo && userInfo.type == "TEACHER" && userInfo.teacher;
    },
    isOrganization:function(){
      var userInfo = peapad.getUserInfo();
      return userInfo && userInfo.organization;
    },

  };

  var expireTime = 30 * 24 * 60 * 60 * 1000;
  peapad.isUserAuthExpire = function(){
    var expire = store.get("expireTime");
    return !(expire && expire * 1 > Date.now());
  };
  peapad.getUserInfo      = function(){
    var expire = store.get("expireTime");
    if( expire && expire * 1 > Date.now() ){
      return store.get("userInfo");
    } else{
      return null;
    }
  };
  peapad.getToken = function(){
    var expire = stroe.get('expireTime');
    if( expire && expire > Date.now() ){
      return store.get('token');
    } else{
      return null;
    }
  }
  peapad.setToken = function(token){
    store.set("token",token);
    store.set("expireTime",Date.now() + expireTime);
    return token;
  };
  peapad.setUserInfo = function(userInfo){
    store.set("userInfo",userInfo);
    store.set("expireTime",Date.now() + expireTime);
    return userInfo;
  };
  peapad.cleanUserInfo = function(){
    store.remove("expireTime");
    store.remove("userInfo");
    store.remove("token");
    store.remove("auto_login");
  };
  //重定向
  w.redirect = function(path){
    w.location.href = path;
  }
  //uuid
  peapad.uuid = function(len,radix){
    len       = len || 32;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid  = [],
        i;
    radix     = radix || chars.length;

    if( len ){
      for( i = 0; i < len; i++ ) uuid[ i ] = chars[ 0 | Math.random() * radix ];
    } else{
      var r;
      uuid[ 8 ] = uuid[ 13 ] = uuid[ 18 ] = uuid[ 23 ] = '-';
      uuid[ 14 ] = '4';

      for( i = 0; i < 36; i++ ){
        if( !uuid[ i ] ){
          r         = 0 | Math.random() * 16;
          uuid[ i ] = chars[ (i == 19) ? (r & 0x3) | 0x8 : r ];
        }
      }
    }

    return uuid.join('');
  }
})(window)
