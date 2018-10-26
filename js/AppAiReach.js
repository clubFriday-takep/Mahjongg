App.Ai.Reach = function(){
  this.reach     = false;
  this.discards  = [];
}
App.Ai.Reach.prototype.getDiscardObj = function(colorAdd,tileAdd){
  for(var i=0;i<this.discards.length;i++){
    var discard = this.discards[i];
    if((discard.color === colorAdd)&&(discard.tile===tileAdd)){
      return discard;
    }
  }
  var discard = this.createDiscard(colorAdd,tileAdd);
  this.discards.push(discard);
  return discard;
}
// リーチのパターンを評価する関数
// this.discardsにDiscardオブジェクトを詰め込む
App.Ai.Reach.prototype.eval = function(strategy){
  this.reach = true;
  var zeroShantens = this.root.syantens[0];
  for(var i=0;i<zeroShantens.length;i++){
    var shanten     = zeroShantens[i];
    var waitPattern = this.waitPattern(shanten);
    this.evalDiscard(shanten,waitPattern);
  }
  return this;
}
App.Ai.Reach.prototype.evalDiscard = function(shanten,waitPattern){
  var discards = this.getDiscards(shanten);
  if(waitPattern.ptn === 'tanki'){
    var discard1 = this.getDiscardObj(discards[1].color,discards[1].tile);
        discard1.setWait(discards[0].color,discards[0].tile);
    var discard2 = this.getDiscardObj(discards[0].color,discards[0].tile);
        discard2.setWait(discards[1].color,discards[1].tile)
    discard1.cls = shanten;
    discard2.cls = shanten;
  }else{
    var discard  = this.getDiscardObj(discards[0].color,discards[0].tile);
    for(var i=0;i<waitPattern.waits.length;i++){
      var wait = waitPattern.waits[i];
      discard.setWait(wait.color,wait.tile);
      discard.cls = shanten;
    }
  }
}
App.Ai.Reach.prototype.getDiscards = function(shanten){
  var rs = [];
  var discard = {
    color : null,
    tile  : null
  }
  for(var i=0;i<shanten.work.length;i++){
    var colors = shanten.work[i];
    for(var j=0;j<colors.length;j++){
      var tileNum = colors[j];
      if(tileNum>0){
        var rsdiscard = $.extend(true,{},discard);
            rsdiscard.color = i;
            rsdiscard.tile  = j;
            rsdiscard.cls   = shanten;
        rs.push(rsdiscard);
      }
    }
  }
  return rs;
}
// 待ちの種別と待ち牌を返却する
// 但し、単騎待ちの場合は捨て牌によって待ちが変わるので待ちは返却しない
App.Ai.Reach.prototype.waitPattern = function(shanten){
  var ptn = 'tanki';
  if(shanten.tnum === 2){ ptn = 'shabo';   };
  if(shanten.rnum === 1){ ptn = 'ryanmen'; };
  if(shanten.knum === 1){ ptn = 'kanchan'; };
  if(shanten.pnum === 1){ ptn = 'penchan'; };
  var rs  = {
    ptn : ptn,
    waits : []
  }
  var patternMatch = function(ptn,ary){
    switch (ptn) {
      case 'shabo':
        if(ary[0] === ary[1]){return true;}
        break;
      case 'ryanmen':
      case 'penchan':
        if((ary[0] + 1) === ary[1]){return true;}
        break;
      case 'kanchan':
        if((ary[0] + 2) === ary[1]){return true;}
        break;
      default:
    }
    return false;
  }
  var getTiles = {
    shabo : function(colorAdd,ary){
      return [{
        color : colorAdd,
        tile  : ary[0] - 1
      }]
    },
    ryanmen : function(colorAdd,ary){
      return [{
        color : colorAdd,
        tile  : ary[0] - 1 - 1
      },{
        color : colorAdd,
        tile  : ary[1] + 1 - 1
      }]
    },
    kanchan : function(colorAdd,ary){
      return [{
        color : colorAdd,
        tile  : ary[0] + 1 - 1
      }]
    },
    penchan : function(colorAdd,ary){
      if(ary[0] === 1){
        return [{
          color : colorAdd,
          tile  : ary[1] + 1 - 1
        }]
      }else{
        return [{
          color : colorAdd,
          tile  : ary[0] - 1 - 1
        }]
      }
    },
    other : function(){return false}
  }
  for(var i=0;i<4;i++){
    var colorCd  = App.Util.colorAddToCd(i);
    var colorAry = shanten[colorCd];
    for(var j=0;j<colorAry.length;j++){
      var ptnAry = colorAry[j];
      if(ptnAry.length === 2){
        if(patternMatch(ptn,ptnAry)){
          var waits = getTiles[ptn](i,ptnAry);
          for(var k=0;k<waits.length;k++){
            rs.waits.push(waits[k]);
          }
        }
      }
    }
  }
  return rs;
}
App.Ai.Reach.prototype.createDiscard = function(color,tile){
  var that = this;
  var Discard = function(color,tile){
    this.color = color;
    this.tile  = tile;
    this.cls   = null;
    this.waits = [];
  }
  Discard.prototype.setWait = function(color,tile){
    for(var i=0;i<this.waits.length;i++){
      var wait = this.waits[i];
      if((wait.color===color)&&(wait.tile===tile)){
        // SKIP
        return wait;
      }
    }
    var wait = that.createWait(color,tile);
    this.waits.push(wait);
    return wait;
  }
  return new Discard(color,tile);
}
App.Ai.Reach.prototype.createWait = function(color,tile){
  var Wait    = function(color,tile){
    this.color = color;
    this.tile  = tile;
  }
  return new Wait(color,tile);
}
// Test
App.Ai.Reach.prototype.getMaxWait = function(){
  var maxnum  = 0;
  var wkary   = [];
  var discard = {
    color  : null,
    number : null
  }
  for(var i=0;i<this.discards.length;i++){
    var dis  = this.discards[i];
    var wnum = dis.waits.length;
    if(wnum > maxnum){
      wkary = [];
      var newdis = $.extend(true,{},discard);
          newdis.color  = dis.color;
          newdis.number = dis.tile;
      wkary.push(newdis);
    }else if(wnum === maxnum){
      var newdis = $.extend(true,{},discard);
          newdis.color  = dis.color;
          newdis.number = dis.tile;
      wkary.push(newdis);
    }
  }
  var rsadd = App.Util.getRandom(0,wkary.length - 1);
  return wkary[rsadd];
}