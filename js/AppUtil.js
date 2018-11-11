var Logger = (function(){
  var levels = ['Fatal','Error','Warn','Info','Debug'];
  var stop   = 'Debug';
  var print  = function(msg){
    var ary = [];
    if(msg instanceof Array){
      ary = msg;
    }else{
      var ary = [];
      ary.push(msg);
    }
    for(var i=0;i<ary.length;i++){
      var p = ary[i];
      if('string' === typeof p){
        console.log('> ' + p);
      }else{
        console.log(p);
      }
    }
  }
  var logging = function(level,msg,custom){
    for(var i=0;i<levels.length;i++){
      var loggerLevel = levels[i];
      if(loggerLevel === level){
          var e = new Error();
          var estack      = e.stack.split(/\n/);
          var called      = estack[2].split(':');
          var calledPath  = called[called.length - 3];
          var calledFiles = calledPath.split('/')
          var calledFile  = calledFiles[calledFiles.length-1];
          var calledLine  = called[called.length - 2];
          var methods     = estack[2];
          var method      = methods.split('@')[0];
          var d = new Date();
          var hh = d.getHours();
          var mm = d.getMinutes();
          var ss = d.getSeconds();
          var dd = d.getMilliseconds();
          var str = '[' + level + ' ' + hh + ":" + mm + ":" + ss + ":" + dd + ']  File:' + calledFile + '(' + calledLine + ')  Method:' + method + '()';
          if(('enphasis' in custom) && ('elength' in custom)){
            var estr = '';
            for(var j=0;j<custom.elength;j++){
              estr = estr + custom.enphasis;
            }
            console.log(estr);
          }else{
            if('Fatal' === level || 'Error' === level){
              console.error(str);
            }else if('Warn' === level){
              console.warn(str);
            }else{
              console.log(str);
            }
          }
          print(msg);
          if(('enphasis' in custom) && ('elength' in custom)){
            console.log(estr);
          }
          console.log();
        }
      if(stop === loggerLevel){
        break;
      }
    }
  }
  // External methods
  var fatal = function(msg){
    logging('Fatal', msg, {})
  }
  var error = function(msg){
    logging('Error', msg, {});
  }
  var warn = function(msg){
    logging('Warn', msg, {});
  }
  var info = function(msg){
    logging('Info', msg, {});
  }
  var enphasis = function(msg,option){
    var option = option || {};
    var level  = option.level || 'Info';
    var param  = {
      enphasis : option.enphasis || '-',
      elength  : option.elength || 30
    }
    logging('Info', msg, param);
  }
  var debug = function(msg){
    logging('Debug',msg, {});
  }
  var custom = function(option){
    //
  }
  return {
    fatal    : fatal,
    error    : error,
    warn     : warn,
    info     : info,
    enphasis : enphasis,
    debug    : debug,
    custom   : custom
  }
})();
App.Util = (function(){
  // Min値～Max値の間でランダムの値を返却する
  var getRandom = function(min,max){
		var random = Math.floor( Math.random() * (max + 1 - min) ) + min;
		return random;
	}
  var objectSort = function(data,key,order){
    //デフォは降順(DESC)
    var num_a = -1;
    var num_b = 1;
    //指定があれば昇順(ASC)
    if(order === 'asc'){
      num_a = 1;
      num_b = -1;
    }
    data = data.sort(function(a, b){
      var x = a[key];
      var y = b[key];
      if (x > y) return num_a;
      if (x < y) return num_b;
      return 0;
    });
    return data;
  }
  var scaling = function(smin,smax,min,max,value){
    var saScale = smax - smin;
    var saVaule = max  - min;
    var scaleRate = saScale/saVaule;
    return Math.round(value*scaleRate);
  }
  var colorAddToCd = function(add){
    switch (add) {
      case 0:
        return 'm';
      case 1:
        return 'p';
      case 2:
        return 's';
      case 3:
        return 'j';
    }
  }
  var colorCdToAdd = function(cd){
    switch (cd) {
      case 'm':
        return 0;
      case 'p':
        return 1;
      case 's':
        return 2;
      case 'j':
        return 3;
    }
  }

	return {
		getRandom    : getRandom,
    objectSort   : objectSort,
    scaling      : scaling,
    colorAddToCd : colorAddToCd,
    colorCdToAdd : colorCdToAdd
	}
})();
