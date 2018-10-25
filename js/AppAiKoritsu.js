App.Ai.Koritsu = function(obj){
  var obj = obj || {};
  // Defaluts
  this.root    = null;
  this.modules = null;
  // Specials
  this.points  = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
  // 全ての牌に加算
  this.base  = obj.base  || 1;
  // 特定の牌に加算
  this.moji  = obj.moji  || 5;
  this.yaku  = obj.yaku  || 3;
  this.nine  = obj.nine  || 4;
  this.eight = obj.eight || 3;
  this.seven = obj.seven || 2;
  this.six   = obj.six   || 1;
  this.five  = obj.five  || 0;
  // 組み合わせに加算（高いほど価値が高い）
  this.anko     = 5;
  this.syuntsu  = 5;
  this.rtatsu   = 4;
  this.toitsu   = 3;
  this.ptatsu   = 1;
  this.uchikan  = 2;
  this.sotokan  = 1;
  this.others   = 0;
  this.scalemin = 0;
  this.scalemax = 20;
}
App.Ai.Koritsu.prototype.init = function(){
  this.points = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
}
App.Ai.Koritsu.prototype.da = function(obj){
  this.init();
  this.evalExist();
  this.evalState();
  this.evalCombi();
  return $.extend(true,[],this.points);
}
// 手牌のすべてにベースポイントを加算する
App.Ai.Koritsu.prototype.evalExist = function(){
  var tiles = this.root.group.tiles;
  for(var i=0;i<4;i++){
    for(var j=0;j<9;j++){
      if(tiles[i][j] > 0){
        this.points[i][j] = this.points[i][j] + this.base;
      }
    }
  }
}
// 手牌の位置に応じてポイントを加算する
App.Ai.Koritsu.prototype.evalState = function(){
  var tiles = this.root.group.tiles;
  for(var i=0;i<4;i++){
    for(var j=0;j<9;j++){
      // 字牌
      if( ( i === 3 ) && ( tiles[i][j] > 0) ){
        this.points[i][j] = this.points[i][j] + this.moji;
      }else if( ( i !== 3 ) && ( tiles[i][j] > 0) ){
        switch (j) {
          case 0:
          case 8:
            this.points[i][j] = this.points[i][j] + this.nine;
            break;
          case 1:
          case 7:
            this.points[i][j] = this.points[i][j] + this.eight;
            break;
          case 2:
          case 6:
            this.points[i][j] = this.points[i][j] + this.seven;
            break;
          case 3:
          case 5:
            this.points[i][j] = this.points[i][j] + this.six;
            break;
          case 4:
            this.points[i][j] = this.points[i][j] + this.five;
            break;
          default:
        }
      }
    }
  }
}
// 手牌の組み合わせに応じてポイントを加算する
App.Ai.Koritsu.prototype.evalCombi = function(){
  var that = this;
  var Tile = function(id,coloradd,tileadd){
    this.id       = id;
    this.coloradd = coloradd;
    this.tileadd  = tileadd;
    this.exist    = true;
    this.point    = 0;
    this.combies  = {
      anko     : 0,
      syuntsu  : 0,
      rtatsu   : 0,
      toitsu   : 0,
      ptatsu   : 0,
      uchikan  : 0,
      sotokan  : 0,
      others   : 0
    }
  }
  Tile.prototype.addType = function(type){
    this.combies[type]++;
  }
  Tile.prototype.setFalse = function(){
    this.exist = false;
  }
  Tile.prototype.evaluate = function(){
    var keys = Object.keys(this.combies);
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      if(!(key === 'others')){
        this.point = this.point + this.combies[key]*that[key];
      }
    }
  }
  var TileEval = function(){
    this.Tile  = Tile;
    this.tiles = [];
    this.generateTiles();
  }
  TileEval.prototype.generateTiles = function(){
    for(var i=0;i<4;i++){
      for(var j=0;j<9;j++){
        var id = this.createId(i,j);
        var tile = new Tile(id,i,j)
        this.tiles.push(tile)
      }
    }
    return this;
  }
  TileEval.prototype.createId = function(coloradd,tileadd){
    var id = coloradd*9 + tileadd;
    return id;
  }
  TileEval.prototype.addType = function(coloradd,tileadd,type){
    var id   = this.createId(coloradd,tileadd);
    var tile = this.tiles[id];
    tile.addType(type);
    return this;
  };
  TileEval.prototype.setFalse = function(coloradd,tileadd){
    var id   = this.createId(coloradd,tileadd);
    var tile = this.tiles[id]
    tile.setFalse();
    return this;
  };
  TileEval.prototype.evaluate = function(){
    for(var i=0;i<this.tiles.length;i++){
      this.tiles[i].evaluate();
    }
    return this;
  };
  // 手牌に存在しない牌を消す
  TileEval.prototype.filter = function(){
    var newtiles = [];
    for(var i=0;i<this.tiles.length;i++){
      // 手牌に存在する場合
      if(this.tiles[i].exist){
        newtiles.push(this.tiles[i])
      }
    }
    this.tiles = newtiles;
    return this;
  };
  TileEval.prototype.sortByPoint = function(){
    App.Util.objectSort(this.tiles,'point','desc');
    return this;
  }
  TileEval.prototype.scalingPoint = function(){
    var min = this.tiles[this.tiles.length - 1].point + 0;
    var max = this.tiles[0].point + 0;
    for(var i=0;i<this.tiles.length;i++){
      var tile    = this.tiles[i];
      var scaled  = App.Util.scaling(that.scalemin,that.scalemax,min,max,tile.point);
      var reverse = that.scalemax - scaled;
      tile.point = reverse;
    }
    return this;
  }
  var tileEval = new TileEval();
  var evalgroup = this.root.filterSyantens(1);
  for(var i=0;i<evalgroup.length;i++){
    var group = evalgroup[i];
    var tiles = this.root.group.tiles;
    for(var j=0;j<tiles.length;j++){
      var colors = tiles[j];
      for(var k=0;k<colors.length;k++){
        var tileNum = colors[k];
        var type   = 'others';
        if(tileNum > 0){
          this.evalCombiPatters(tileEval, group,j,k);
        }else{
          tileEval.setFalse(j,k);
        }
      }
    }
  }
  tileEval.evaluate().filter().sortByPoint().scalingPoint();
  for(var i=0;i<tileEval.tiles.length;i++){
    var tile = tileEval.tiles[i];
    this.points[tile.coloradd][tile.tileadd] += tile.point;
  }
}
App.Ai.Koritsu.prototype.evalCombiPatters = function(tileEval, group, coloradd, tileadd){
  for(var i=0;i<4;i++){
    if(coloradd === i){
      var colorCd = App.Util.colorAddToCd(i);
      var combies = group[colorCd];
      for(var j=0;j<combies.length;j++){
        var combi = combies[j];
        var type = this.evalCombiPattersPoint(combi, tileadd);
        tileEval.addType(coloradd,tileadd,type);
      }
    }
  }
}
App.Ai.Koritsu.prototype.evalCombiPattersPoint = function(combi,tileadd){
  var isContain = false;
  var combilen  = combi.length;
  var first     = false;
  var second    = false;
  var third     = false;
  for(var i=0;i<combi.length;i++){
    var combinum = combi[i] - 1;
    if(combinum === tileadd){
      isContain = true;
    }
    switch (i) {
      case 0:
        first  = combinum;
        break;
      case 1:
        second = combinum;
        break;
      case 2:
        third  = combinum;
        break;
    }
  }
  var type = 'others';
  if(isContain){
    if( (combilen === 3) && (first === second) ){
      type = 'anko';
    }else if( (combilen === 3) && (first  <  second) ){
      type = 'syuntsu';
    }else if( (combilen === 2) && (first === second) ){
      type = 'toitsu';
    }else if( (combilen === 2) && (first === (second - 1)) ){
      if( (first===0) || (second===8) ){
        type = 'ptatsu';
      }else{
        type = 'rtatsu';
      }
    }else if( (combilen === 2) && (first === (second - 2)) ){
      if( (first===0) || (second===8) ){
        type = 'sotokan';
      }else{
        type = 'uchikan';
      }
    }
  }
  return type;
}
