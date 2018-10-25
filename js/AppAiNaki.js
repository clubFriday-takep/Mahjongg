App.Ai.Naki = function(obj){
  this.patterns     = null;
  this.waits        = null;
  this.syantenCount = 0;
}
App.Ai.Naki.prototype.eval = function(){
  this.patterns     = new App.Ai.Naki.Patterns();
  this.waits        = new App.Ai.Naki.Patterns();
  var evalSyantens = this.root.filterSyantens(3);
  this.syantenCount = evalSyantens.length;
  this.createPatterns(evalSyantens);
  for(var i=0;i<evalSyantens.length;i++){
    this.execGetMethods(evalSyantens[i]);
  }
  //console.log(this);
}
// 鳴きのパターンを作る処理
App.Ai.Naki.prototype.createPatterns = function(syantens){
  for(var i=0;i<syantens.length;i++){
    var syanten = syantens[i];
    for(var j=0;j<4;j++){
      var colorCd = App.Util.colorAddToCd(j);
      var colortiles = syanten[colorCd];
      for(var k=0;k<colortiles.length;k++){
        var tiles = colortiles[k];
        var vary  = this.getValuesFromTiles(tiles);
        for(var l=0;l<vary.length;l++){
          var val = vary[l];
          this.patterns.set({
            colorAdd : j,
            waitNum  : val.num,
            tiles    : tiles,
            type     : val.type
          });
        }
      }
    }
  }
}
App.Ai.Naki.prototype.getValuesFromTiles = function(ary){
  var rs = [];
  if(ary.length === 2){
    if(ary[0] === ary[1]){ // 対子
      rs.push({num:ary[0],type:0})
    }else if(ary[0] + 2 === ary[1]){ // カンチャン
      rs.push({num:ary[0]+1,type:1})
    }else if(ary[0]===1){ // ペンちゃん1
      rs.push({num:3,type:1});
    }else if(ary[1]===9){ // ペンちゃん9
      rs.push({num:7,type:1});
    }else{ // 両面
      rs.push({num:ary[0]-1,type:1});
      rs.push({num:ary[1]+1,type:1});
    }
  }
  return rs;
}
// 鳴くかどうかの判定＋鳴き取得処理
App.Ai.Naki.prototype.execGetMethods = function(syanten){
  var baseNakiKeiko  = ['yakuhai'];
  for(var i=0;i<baseNakiKeiko.length;i++){
    var methodName = baseNakiKeiko[i];
    if(syanten.yaku.keiko[methodName].expect){
      this[App.Ai.Naki.GET_METHODS[methodName]](syanten);
    }
  }
}
// 鳴き取得関数群
App.Ai.Naki.prototype.getYakuhai = function(syanten){
  // とりあえず役牌なら鳴く
  var yakuhai = syanten.yaku.keiko.yakuhai;
  if(yakuhai.expect){
    var yukoAry = yakuhai.yukohai;
    for(var i=0;i<yukoAry.length;i++){
      var yukoid  = yukoAry[i];
      var yukoPtn = this.patterns.getByQuery({id:yukoid});
      for(var j=0;j<yukoPtn.length;j++){
        var yukoObj = yukoPtn[j];
        this.waits.setPattern(yukoObj);
      }
    }
  }
}
// TEST
App.Ai.Naki.prototype.getTest = function(){

}
App.Ai.Naki.Patterns = function(){
  this.patternList = [];
}
App.Ai.Naki.Patterns.prototype.getByQuery = function(query){
  var rs = [];
  for(var i=0;i<this.patternList.length;i++){
    var pattern = this.patternList[i];
    var flg = pattern.isMatchByQuery(query);
    if(flg){
      rs.push(pattern);
    }
  }
  return rs;
}
App.Ai.Naki.Patterns.prototype.set = function(obj){
  var isMatch = false;
  for(var i=0;i<this.patternList.length;i++){
    var ptn    = this.patternList[i];
    var pmatch = ptn.isMatch(obj);
    if(pmatch){ isMatch = true }
  }
  if(!isMatch){
    this.patternList.push(new App.Ai.Naki.Pattern(obj));
  }
}
App.Ai.Naki.Patterns.prototype.setPattern = function(obj){
  var isMatch = false;
  var convert = {
    colorAdd : obj.color,
    waitNum  : obj.add + 1,
    tiles    : obj.tiles,
    type     : obj.type
  }
  for(var i=0;i<this.patternList.length;i++){
    var ptn    = this.patternList[i];
    var pmatch = ptn.isMatch(convert);
    if(pmatch){ isMatch = true }
  }
  if(!isMatch){
    this.patternList.push(new App.Ai.Naki.Pattern(convert));
  }
}
App.Ai.Naki.Pattern = function(obj){
  this.id    = App.Util.colorAddToCd(obj.colorAdd) + obj.waitNum;
  this.color = obj.colorAdd;
  this.add   = obj.waitNum - 1;
  this.tiles = obj.tiles;
  this.type  = obj.type; // 0:ポン、1:チー、2:カン
  this.count = 0;
}
App.Ai.Naki.Pattern.prototype.isMatch = function(obj){
  if(this.color === obj.colorAdd && (this.add + 1) === obj.waitNum && this.type === obj.type){
    var flg = true;
    for(var i=0;i<this.tiles.length;i++){
      if(obj.tiles[i]){
        if(this.tiles[i] !== obj.tiles[i]){
          flg = false;
        }
      }else{
        flg = false;
      }
    }
    if(flg){this.count++}
    return flg;
  }
  return false;
}
App.Ai.Naki.Pattern.prototype.isMatchByQuery = function(query){
  var keys = Object.keys(query);
  var flg  = true;
  for(var i=0;i<keys.length;i++){
    var key = keys[i];
    if(query[key] !== this[key]){
      flg = false;
    }
  }
  return flg;
}
App.Ai.Naki.GET_METHODS = {
  yakuhai : 'getYakuhai'
}
