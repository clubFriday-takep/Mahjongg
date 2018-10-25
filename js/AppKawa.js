App.Kawa = (function(){
  var view = null;
  var Kawa = function(){
    this.player0 = [];
    this.player1 = [];
    this.player2 = [];
    this.player3 = [];
    this.lastPlayer = false;
  }
  Kawa.prototype.da = function(pnum,tile){
  	var player = 'player' + pnum;
  	this[player].push(tile);
    this.lastPlayer = pnum;
  }
  Kawa.prototype.getLastTile = function(){
    if(this.lastPlayer !== false){
      var player = 'player' + this.lastPlayer;
      return this[player][this[player].length-1];
    }
    return false;
  }
  Kawa.prototype.getLastPlayer = function(){
    return this.lastPlayer;
  }
  Kawa.prototype.popLastTile = function(pnum){
    var player = 'player' + pnum;
    return this[player].pop();
  }

  var create = function(){
    view = new Kawa();
    return view;
  }

  return {
    create : create
  }
})();
