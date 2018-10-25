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
    colorCdToAdd : colorCdToAdd,
	}
})();
