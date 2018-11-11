App.Player = (function(){
  var Player = function(obj){
    var obj = obj || {};
    this.playerNum = obj.playerNum || 0;
    this.user      = obj.user      || false;
    this.tehai     = [];
    this.naki      = [];
    this.ai        = null;
    this.reach     = false;
    this.init();
  }
  Player.prototype.getTileInfo = function(color,address){
    var group = App.Util.colorAddToCd(color);
    var rs    = {
      tile : false,
      tileAddress : false
    };
    for(var i=0;i<this.tehai.length;i++){
      var tehai = this.tehai[i];
      if(group === tehai.group && (address + 1) === tehai.num){
        rs.tile    = tehai;
        rs.tileAddress = i;
      }
    }
    return rs;
  }
  Player.prototype.init = function(){
    this.createAi();
  }
  Player.prototype.createAi = function(){
    var that = this;
    this.ai = App.Ai.create({
      player : that
    });
  }
  Player.prototype.tsumo = function(){
    this.tehai.push(App.Ba.view.yama.tsumo());
  }
  // TODO AIによる分析処理
  Player.prototype.start = function(){

  }
  Player.prototype.da = function(){
    var daObj = this.ai.da();
    var tile  = this.tehai.splice(daObj.add, 1)[0];
    if(daObj.reach){
      tile.reach = true;
      this.reach = true;
      console.log('> リーチ！！！');
    }
    return tile;
  }
  Player.prototype.userDaAi = function(){
    var daObj = this.ai.da();
    Logger.debug(['ユーザの手牌表示',this.tehai]);
    return daObj;
  }
  Player.prototype.userDaDiscard = function(tileadd){
    var tile  = this.tehai.splice(tileadd, 1)[0];
    return tile;
  }
  Player.prototype.ripai = function(){
    this.tehai.sort(function(a,b){
      if(a.sort<b.sort) return -1;
      if(a.sort>b.sort) return 1;
      return 0;
  	});
  }
  Player.prototype.doNaki = function(tile,type){
    var nakiTiles = this.ai.getNakiTiles(tile,type);
  }
  Player.prototype.tehaiToNaki = function(color,tiles,tile){
    var pushtiles = [];
    for(var i=0;i<tiles.length;i++){
      var newtehai = [];
      var pullflg = false;
      var tileId = App.Util.colorAddToCd(color) + '' + tiles[i];
      for(var j=0;j<this.tehai.length;j++){
        if(!pullflg){
          var tehaitile = this.tehai[j];
          if(tehaitile.id === tileId){
            pushtiles.push(tehaitile);
          }else{
            newtehai.push(tehaitile);
          }
        }else{
          newtehai.push(tehaitile);
        }
      }
      this.tehai = newtehai;
    }
    pushtiles.push(tile);
    this.naki.push(pushtiles);
  }
  Player.prototype.isNaki = function(tileId,type){
    return this.ai.isNaki(tileId,type);
  }
  var create = function(obj){
    return new Player(obj);
  }
  return {
    create : create
  }
})();
