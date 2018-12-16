App.Player = (function(){
  var Player = function(obj){
    var obj = obj || {};
    this.playerNum = obj.playerNum || 0;
    this.user      = obj.user      || false;
    this.tehai     = [];
    this.naki      = [];
    this.nakiflg   = false;
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
    this.ai.makeNakiPatternAll();
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
  Player.prototype.tsumogiri = function(){
    var tile = this.tehai.splice(this.tehai.length - 1, 1)[0];
    return tile;
  }
  Player.prototype.userDaAi = function(){
    var daObj = this.ai.da();
    return daObj;
  }
  Player.prototype.userDaDiscard = function(tileadd){
    var tile  = this.tehai.splice(tileadd, 1)[0];
    return tile;
  }
  Player.prototype.queryTempai = function(){
    this.ai.splitGroups();
    this.ai.howSyanten();
    Logger.debug(['Sayntens',this.ai.syantens]);
    if(this.ai.syantens[0].length > 0){
      this.ai.modules.reach.evalTempai();
      return true;
    }else{
      return false;
    }
  }
  Player.prototype.queryReach = function(daObj){
    Logger.debug(['da Object',daObj,this]);
    this.ai.modules.reach.queryReach(daObj);
  }
  Player.prototype.ripai = function(){
    this.tehai.sort(function(a,b){
      if(a.sort<b.sort) return -1;
      if(a.sort>b.sort) return 1;
      return 0;
  	});
  }
  // ツモかどうかの判定処理
  Player.prototype.isTsumo = function(){
    var tile = this.tehai[this.tehai.length - 1];
    return this.ai.isTsumo(tile);
  }
  // ロンかどうかの判定処理
  Player.prototype.isRon = function(tile,stack){
    return this.ai.isRon(tile,stack);
  }
  Player.prototype.makeNakiPatterns = function(){
    this.ai.makeNakiPatternAll();
  }
  Player.prototype.getNakiPattens = function(tile,stack){
    return this.ai.getNakiPattens(tile,stack);
  }
  Player.prototype.doNaki = function(tile,type){
    var nakiTiles = this.ai.getNakiTiles(tile,type);
  }
  Player.prototype.tehaiToNaki = function(color,tiles,tile){
    var pushtiles = [];
    var delmap   = [false,false,false,false,false,false,false,false,false,false,false,false,false,false];
    var newtehai = [];
    for(var i=0;i<tiles.length;i++){
      var tileId = App.Util.colorAddToCd(color) + '' + tiles[i];
      for(var j=0;j<this.tehai.length;j++){
        var tehaitile = this.tehai[j];
        if(!delmap[j]){
          if(tehaitile.id === tileId){
            pushtiles.push(tehaitile);
            delmap[j] = true;
            break;
          }
        }
      }
    }
    for(var i=0;i<this.tehai.length;i++){
      if(!delmap[i]){
        newtehai.push(this.tehai[i]);
      }
    }
    this.tehai = newtehai;
    this.nakiflg = true;
    pushtiles.push(tile);
    this.naki.push(pushtiles);
  }
  Player.prototype.isNaki = function(tileId,type){
    return this.ai.isNaki(tileId,type);
  }
  Player.prototype.agari  = function(obj){
    // 上がりの基礎となるグループ情報を作成し、上がりパターンを取得する
    this.ai.splitGroups();
    this.ai.howSyanten();
    var agariPatterns = this.ai.agaries;
    Logger.debug(agariPatterns);
    // 変数の宣言
    var han = 0;
    var subject = null;
    var yakuList = [];
    // リーチ、面前ツモの場合に役リストに追加する
    if(obj.reach){
      yakuList.push({reach:1});
    }
    if(obj.tsumo && this.tehai.length === 14){
      yakuList.push({tsumo:1});
    }
    // 上がりパターンごとに評価関数を実行し、より高い役を選択する
    for(var i=0;i<agariPatterns.length;i++){
      var cls = agariPatterns[i];
      var yaku = this.ai.modules.kitai.evalSyanten(cls);
      if(yaku.han >= han){
        subject = yaku;
        han = yaku.han;
      }
      Logger.debug(['Yaku', yaku])
    }
    // 選択されたパターンについて役リストを作成する
    var margeAry = subject.getYakuList('menzen');
    for(var i=0;i<margeAry.length;i++){
      var yaku = margeAry[i];
      yakuList.push(yaku);
    }
    Logger.debug(['はんすう',yakuList,'THIS',this]);
    return yakuList;
  }
  var create = function(obj){
    return new Player(obj);
  }
  return {
    create : create
  }
})();
