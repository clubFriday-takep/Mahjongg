App.Ai.Handler = function(obj){
  // Parameters
}
App.Ai.Handler.prototype.da = function(){
  var strategy = {
    speed : true,
    large : false,
    reach : true
  }
  var discardObj = {
    add     : null,
    reach   : false,
    naki    : false,
    request : []
  }

  // リーチの場合は即捨て
  if(this.root.player.reach){
    discardObj.add = 13;
    return discardObj;
  }
  // リーチの可能性あり：リーチ時の捨て牌決定
  if( (this.root.syantens[0].length > 0) && strategy.reach ){
    this.modules.reach.eval(strategy);
    // TEST
    var rdiscard = this.modules.reach.getMaxWait();
    discardObj.add = this.discartToAdd({
      color  : rdiscard.color,
      number : rdiscard.number
    })
    discardObj.reach = true;
    return discardObj;
  }

  // 期待値を計算する
  this.modules.kitai.evalSyantens();

  // Test　とりあえず役牌があれば鳴いてみる
  this.modules.naki.eval();
  this.root.setNaki(this.modules.naki.waits.patternList);

  var points = this.modules.koritsu.da(strategy);
  var ranks  = this.pointsToRanks(points);
  // 捨て牌処理
  var franks = this.filterRanks(ranks);
  var discard = this.discardByRanks(franks);
  discardObj.add = this.discartToAdd(discard);
  return discardObj;
}
App.Ai.Handler.prototype.discardByRanks = function(ranks){
  var rlen = ranks.length;
  var add  = App.Util.getRandom(0,rlen - 1);
  return ranks[add];
}
App.Ai.Handler.prototype.discartToAdd = function(discard){
  for(var i=0;i<this.root.player.tehai.length;i++){
    var tile = this.root.player.tehai[i];
    if( (App.Util.colorAddToCd(discard.color) === tile.group) && ( (discard.number + 1) === tile.num) ){
      return i;
    }
  }
}
// TODO AI本体に移植？
App.Ai.Handler.prototype.pointsToRanks = function(point){
  var rankNum = rankNum;
  var ranks = [];
  for(var i=0;i<4;i++){
    for(var j=0;j<9;j++){
      var rank = {
        color  : i,
        number : j,
        point  : point[i][j] + 0
      }
      ranks.push(rank);
    }
  }
  App.Util.objectSort(ranks,'point','desc');
  return ranks;
}
// TODO AI本体に移植？
App.Ai.Handler.prototype.filterRanks = function(ranks){
  var wkp = 0;
  var filtered = [];
  for(var i=0;i<ranks.length;i++){
    var rank = ranks[i];
    if(wkp < rank.point){
      filtered = [];
      wkp = rank.point;
      filtered.push(rank);
    }else if(wkp === rank.point){
      filtered.push(rank);
    }
  }
  return filtered;
}
App.Ai.Handler.prototype.getFilteredSyantensAdd = function(num){
  var num   = num || 3;
  var rsAdd = [];
  for(var i=0;i<this.root.syantens.length;i++){
    var spattern = this.root.syantens[i];
    if( (spattern.length > 0) && (num > 0) ){
      rsAdd.push(i);
      num--;
    }
  }
  return rsAdd;
}
/* MEMO
・鳴きの設定（仕掛けパラメータ次第）
　・強い：役牌、ドラがあればタンヤオ系の鳴き
　・中間：役牌の２鳴き、役に必要なものを鳴く
　・弱い：鳴かない
・押し引き
　・押しが最強：積極的な不要牌整理
　　　半チャン序盤、親時、終盤の負けてる時
　・押しが強い：
　・中間：
　・押しが弱い：
・手作り
　・最強：大物手を狙う
　・強い：期待値を最大化しつつ、速さを重視
　・速い：速さを重視する
　・弱い：期待値を最大化しつつ、鳴かない
・不要牌整理
　・役傾向／期待値
　・牌効率
・危険牌回避
*/
