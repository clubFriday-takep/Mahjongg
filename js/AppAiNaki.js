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
// 鳴きパターン作成処理
App.Ai.Naki.prototype.makeNakiPatternAll = function(group){
  var tiles  = group.tiles
  var ponmap = this.getPonKanMap(tiles,2);
  var kanmap = this.getPonKanMap(tiles,3);
  var rtmap  = this.getRTatsuMap(tiles);
  this.patterns = new App.Ai.Naki.Patterns();
  this.makePonKanWaits(ponmap,2);
  this.makePonKanWaits(kanmap,3);
  this.makeRTatsuWaits(rtmap);
  this.makePTatsuWaits(tiles);
  this.makeKTatsuWaits(tiles);
  this.patterns.sortById();
}
App.Ai.Naki.prototype.getNakiPattens = function(tile,stack){
  var query = {
    id   : tile.id,
    type : ''
  };
  if(stack.params.chi){
    query.type = 1;
    stack.params.chiPatterns = this.patterns.getByQuery(query);
  }
  if(stack.params.ponkan){
    query.type = 0;
    stack.params.ponPatterns = this.patterns.getByQuery(query);
    query.type = 2;
    stack.params.kanPatterns = this.patterns.getByQuery(query);
  }
  return stack;
}
App.Ai.Naki.prototype.getPonKanMap = function(tiles,oknum){
  var ponmap = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
  for(var i=0;i<4;i++){
    var colors = tiles[i];
    for(var j=0;j<colors.length;j++){
      var tile = colors[j];
      if(tile >= oknum){
        ponmap[i][j] = 1;
      }
    }
  }
  return ponmap;
}
App.Ai.Naki.prototype.makePonKanWaits = function(map,oknum){
  for(var i=0;i<4;i++){
    var submap = map[i];
    for(var j=0;j<submap.length;j++){
      if(map[i][j]>0){
        var tiles = null;
        var type  = null;
        if(oknum === 2){
          tiles = [ j + 1, j + 1];
          type  = 0;
        }else{
          tiles = [ j + 1, j + 1, j + 1];
          type  = 2;
        }
        this.patterns.set({
          colorAdd : i,
          waitNum  : j + 1,
          tiles    : tiles,
          type     : type
        })
      }
    }
  }
}
App.Ai.Naki.prototype.getRTatsuMap = function(tiles){
  var rtmap = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
  for(var i=0;i<3;i++){
    var colors = tiles[i];
    // 両面の左側なら１、右側なら２、両側なら３
    for(var j=0;j<colors.length;j++){
      var tile = colors[j];
      // 左側判定
      if(j < 6){
        if(colors[j + 1] > 0 && colors[j + 2] > 0){
          rtmap[i][j] = 1;
        }
      };
      // 右側判定
      if(j > 2){
        if(colors[j - 2] > 0 && colors[j - 1] > 0){
          if(rtmap[i][j] === 1){
            rtmap[i][j] = 3;
          }else{
            rtmap[i][j] = 2;
          }
        }
      };
    }
  }
  return rtmap;
}
App.Ai.Naki.prototype.makeRTatsuWaits = function(map){
  for(var i=0;i<3;i++){
    var submap = map[i];
    for(var j=0;j<submap.length;j++){
      var maptype = map[i][j];
      switch (maptype) {
        case 1:
          this.patterns.set({
            colorAdd : i,
            waitNum  : j + 1,
            tiles    : [j + 2, j + 3],
            type     : 1
          })
          break;
        case 2:
          this.patterns.set({
            colorAdd : i,
            waitNum  : j + 1,
            tiles    : [j - 1, j],
            type     : 1
          })
          break;
        case 3:
          this.patterns.set({
            colorAdd : i,
            waitNum  : j + 1,
            tiles    : [j + 2, j + 3],
            type     : 1
          })
          this.patterns.set({
            colorAdd : i,
            waitNum  : j + 1,
            tiles    : [j - 1, j],
            type     : 1
          })
          break;
        default:
          // Skip
      }
    }
  }
}
App.Ai.Naki.prototype.makePTatsuWaits = function(tiles){
  for(var i=0;i<3;i++){
    var colors = tiles[i];
    if(colors[0] > 0 && colors[1] > 0){
      this.patterns.set({
        colorAdd : i,
        waitNum  : 3,
        tiles    : [1, 2],
        type     : 1
      })
    };
    if(colors[7] > 0 && colors[8] > 0){
      this.patterns.set({
        colorAdd : i,
        waitNum  : 7,
        tiles    : [8, 9],
        type     : 1
      })
    }
  }
}
App.Ai.Naki.prototype.makeKTatsuWaits = function(tiles){
  for(var i=0;i<3;i++){
    var colors = tiles[i];
    for(var j=1;j<colors.length - 1;j++){
      if(colors[j-1] > 0 && colors[j+1] > 0){
        this.patterns.set({
          colorAdd : i,
          waitNum  : j + 1,
          tiles    : [j, j + 2],
          type     : 1
        })
      }
    }
  }
}

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
App.Ai.Naki.Patterns.prototype.sortById = function(){
  this.patternList = App.Util.objectSort(this.patternList,'id','asc');
}
// 廃止予定
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
