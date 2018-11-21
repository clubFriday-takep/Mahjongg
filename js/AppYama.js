App.Yama = (function(){
  var Tile = function(obj){
    this.id     = obj.id;
    this.name   = obj.name;
    this.group  = obj.group;
    this.num    = obj.num;
    this.sort   = obj.sort;
    this.dora   = false;
    this.red    = false;
    this.reach  = false;
    this.pnum   = 0;
    this.naki   = false;
    this.nakiAd = null;
    this.ankan  = false;
  }
  var Yama = function(){
    this.red   = true;
    this.lefts = [];
  }
  Yama.prototype.init = function(){
    this.setLefts();
    this.leftsToRandom();
  }
  Yama.prototype.setLefts = function(){
    this.lefts = [];
    var tiles = $.extend(true,[],App.Const.TILES);
    for(var i=0;i<tiles.length;i++){
      for(var j=0;j<4;j++){
        var tile = new Tile(tiles[i]);
        if( (tile.id==='m5'||tile.id==='p5'||tile.id==='s5') && j===0 && this.red===true ){
          tile.red = true;
        }
        tile.pnum = i;
        this.lefts.push(tile);
      }
    }
  }
  Yama.prototype.leftsToRandom = function(){
  	var len  = this.lefts.length;
  	var randomLefts = [];
  	for(var i=0;i<len;i++){
  		var r = App.Util.getRandom(0, len - i - 1);
  		randomLefts.push(this.lefts[r]);
  		this.lefts.splice(r, 1);
  	}
  	this.lefts = randomLefts;
  }
  Yama.prototype.tsumo = function(){
    return this.lefts.pop();
  }
  Yama.prototype.isLeft = function(){
    if(this.lefts.length>0){
      return true;
    }else{
      return false;
    }
  }

  var create = function(){
    var yama = new Yama();
        yama.init();
    return yama;
  }

  return {
    create : create
  }
})();
