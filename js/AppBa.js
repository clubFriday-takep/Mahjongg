App.Ba = (function(){
  // TEST
  var view = null;
  var Ba  = function(obj){
		var obj = obj || {};
    //this.stack    = new Stack();
    this.stack    = App.Stack;
    this.stack.init();
		this.players  = [];
    this.auto     = false;
		this.points   = [25000,25000,25000,25000];
		this.kyotaku  = 0;
		this.wanpai   = [];
		this.dorashow = [];
		this.yama     = {};
		this.kawa     = {};
	}
  Ba.prototype.skip = function(){
    // なにもしない
  }
  Ba.prototype.init = function(stack){
    this.yama = App.Yama.create();
    this.kawa = App.Kawa.create();
    this.createPlayers();
    this.selectOya();
		return this;
	}
  Ba.prototype.nextInit = function(){
    this.wanpai = [];
    this.dorashow = [];
    this.yama = App.Yama.create();
    this.kawa = App.Kawa.create();
    this.createPlayers();
    return this;
  }
  Ba.prototype.next = function(){
    // test
    var pullObj = App.Stack.pull();
    var stack   = pullObj.stack;
    Logger.debug(stack);
    this[stack.method](stack);
    if(!stack.draw){
      stack = this.next();
    }
    return stack;
  }
  // Player作成処理
  Ba.prototype.createPlayers = function(){
    this.players  = [];
    for(var i=0;i<4;i++){
      var user = false;
      if(!this.auto && (i===2)){
        user = true;
      }
      var player = App.Player.create({
        playerNum : i,
        user      : user
      });
      this.players.push(player);
    }
  }
  // 親決定処理
  Ba.prototype.selectOya = function(){
    // this.stack.oya = App.Util.getRandom(0,3);
    this.stack.state.oya = App.Util.getRandom(0,3);
  }
  // 配牌処理
  Ba.prototype.haipai = function(stack){
    this.haipaiToPlayers();
    this.haipaiToWanpai();
    this.ripaiAll();
  }
  // 配牌サブルーチン：Playerへの配牌
  Ba.prototype.haipaiToPlayers = function(){
    var haipaiPlayer = this.stack.state.oya;
    var pulls = 4*13;
    for(var i=0;i<pulls;i++){
      var player = this.players[haipaiPlayer];
      player.tsumo();
      haipaiPlayer = (haipaiPlayer + 1)%4;
    }
  }
  // 配牌サブルーチン：王牌作成・ドラ表示
  Ba.prototype.haipaiToWanpai = function(){
    for(var i=0;i<14;i++){
			if(i===9){
				this.dorashow.push(this.yama.lefts.shift());
			}else{
				this.wanpai.push(this.yama.lefts.shift());
			}
		}
  }
  // リー牌処理
  Ba.prototype.ripaiAll = function(){
    for(var i=0;i<4;i++){
			var player = this.players[i];
			player.ripai();
		}
  }

  // TODO 開始処理（PlayerAIに問い合わせ？）
  Ba.prototype.start = function(stack){
    //console.log('Ba Start');
  }
  Ba.prototype.isLeft = function(stack){
    return this.yama.isLeft();
  }
  Ba.prototype.tsumo = function(stack){
    var player = this.players[stack.player];
    player.tsumo();
  }
  Ba.prototype.da = function(stack){
    Logger.debug(stack);
    var pnum   = stack.player;
    var player = this.players[pnum];
    var tile   = player.da();
    this.kawa.da(pnum,tile);
    player.ripai();
    Logger.info('Player' + pnum + 'の打牌 : ' + tile.name);
  }
  // マニュアル打牌処理
  Ba.prototype.manualDa = function(obj){
    // なにもしない。Dealerがマニュアルの打牌を指示する。
    // setUserInjectEventへ
  }
  // リーチ後のマニュアル打牌処理
  Ba.prototype.mreachDa = function(obj){
    // なにもしない。Dealerがマニュアルの打牌を指示する。
    // setUserInjectEventへ
  }
  Ba.prototype.tsumogiri = function(stack){
    var player = this.players[stack.player];
    var tile   = player.tsumogiri();
    this.kawa.da(stack.player,tile);
    player.ripai();
    Logger.info('Player' + player + 'の打牌 : ' + tile.name);
    App.Dealer.view.execute(true);
    App.Dealer.view.svg.unbindEvents();
  }
  Ba.prototype.skipRon = function(stack){
    App.Dealer.view.execute(true);
    App.Dealer.view.svg.unbindEvents();
  }
  // リーチのモーダル画面から牌を選択された際の処理
  Ba.prototype.userReachExec = function(obj){
    var player      = this.players[2];
    console.log(obj);
    var discardInfo = player.getTileInfo(obj.tileColor,obj.tileAddress);
    console.log(discardInfo);
    this.userDaExec(discardInfo.tileAddress, true);
  }
  Ba.prototype.userDaExec = function(tileAddress,isReach){
    var player = this.players[2];
    Logger.info(['ユーザの打牌','Address : ' + tileAddress])
    var daObjUser  = player.userDaDiscard(tileAddress);
    if(isReach){
      daObjUser.reach = true;
      this.stack.setReach(2);
      player.queryReach(daObjUser);
    }
    this.kawa.da(2,daObjUser);
    this.stack.push({
      mode   : 'draw',
      method : 'skip',
      player : 2,
      draw   : true
    });
    player.ripai();
    App.Dealer.view.execute(true);
    App.Dealer.view.svg.unbindEvents();
  }
  Ba.prototype.userInject = function(stack){}
  /*
   * あらゆるユーザイベントの設定は[setUserInjectEvent]をとおる！
   */
  Ba.prototype.setUserInjectEvent = function(dealerObj,stack){
    Logger.debug('User Event 設定処理 開始');
    App.UserHandler.initGrobal();
    App.UserHandler.setEvents(stack);
  }
  Ba.prototype.end = function(stack){
    //console.log('> Ba End');
    //console.log(this);
  }
  // ツモかどうかの判定処理
  Ba.prototype.isTsumo = function(stack){
    var player  = this.players[stack.player];
    var isTsumo = player.isTsumo();
    if(isTsumo){
      Logger.enphasis(['ご無礼、ツモです！！']);
      App.Stack.push({
        mode : 'agari',
        method : 'agari',
        player : stack.player,
        params : {
          tsumo : true
        }
      })
    }
  }
  // ロンかどうかの判定処理
  Ba.prototype.isRon = function(stack){
    var player  = this.players[stack.player];
    var isRon = player.isRon();
    if(isRon){
      Logger.enphasis(['ご無礼、ロンです！！']);
      App.Stack.push({
        mode : 'agari',
        method : 'agari',
        player : stack.player,
        params : {
          tsumo : false
        }
      })
    }
  }
  Ba.prototype.naki = function(stack){
    var nakitile   = this.kawa.getLastTile();
    var passplayer = this.kawa.getLastPlayer();
    var nakiflg    = false;
    var daplayer   = (this.stack.nowplay + 3)%4;
    var nakiwork   = this.stack.nakiwork;
    var nakiplayer = null;
    var nakiType   = null;
    if(nakitile){
      // ポン・カンの鳴きがあるか？
      for(var i=0;i<this.stack.ponkanWait.length - 1;i++){
        var searchplayer = (daplayer + i + 1)%4;
        var flg = this.stack.ponkanWait[searchplayer];
        if(flg && !nakiflg){
          var isnaki = this.isNakiTile(searchplayer,nakitile.id,0);
          if(isnaki && !nakiflg){
            nakiflg = true;
            nakiplayer = searchplayer;
            nakiType = 0;
          }
        }
      }
    }
    // TODO チーの処理
    if(!nakiflg){

    }
    if(nakiflg){
      var player = this.players[nakiplayer];
      nakiwork.nakiplayer = nakiplayer;
      nakiwork.passplayer = passplayer;
      player.doNaki(nakitile,nakiType)
    }
    nakiwork.nakiflg = nakiflg;
  }
  Ba.prototype.nakiafter = function(stack){
    // 鳴かれたプレイヤーの牌を捨てる
    if(stack.param.nakiflg){
      this.kawa.popLastTile(stack.param.passplayer);
    }
  }
  Ba.prototype.setNaki = function(playerNum,ponkanflg,chiflg){
    this.stack.state.waits.ponkan[playerNum] = ponkanflg || false;
    this.stack.state.waits.chi[playerNum]    = chiflg    || false;
  }
  Ba.prototype.isNakiTile = function(playerNum,tileId,type){
    var pnum   = playerNum;
    var player = this.players[pnum];
    return player.isNaki(tileId,type);
  }
  Ba.prototype.agari = function(stack){
    // Skip
  }
  Ba.prototype.agariCalc = function(stack){
    Logger.debug(['上がり後計算処理開始',stack]);
    var player = this.players[stack.player];
    // ロンの場合、手牌に捨て牌をセット
    if(!stack.params.tsumo){
      player.tehai.push(this.kawa.getLastTile());
    }
    var yakuList = player.agari({
      reach : this.stack.state.waits.reach[stack.player],
      tsumo : stack.params.tsumo
    });
    Logger.debug(['YakuList',yakuList]);
    App.Modals.agari(stack,yakuList);
  }
  Ba.prototype.ryukyoku = function(stack){
    Logger.info('流局しました。');
    App.Modals.ryukyoku(stack);
  }
  Ba.prototype.nextGame = function(e){
    Logger.debug(['Next Game',e.data]);
    App.Stack.push({
      mode   : 'nextGame',
      method : 'skip',
      params : {
        agari  : true,
        player : e.data.stack.player
      }
    });
    App.Dealer.view.execute(true);
  }
  Ba.prototype.nextGameRyukoku = function(e){
    Logger.debug(['Next Game',e.data]);
    App.Stack.push({
      mode   : 'nextGame',
      method : 'skip',
      params : {
        agari  : false,
        player : e.data.stack.player
      }
    });
    App.Dealer.view.execute(true);
  }
  Ba.prototype.getBakaze = function(){
    return this.stack.state.bakaze;
  }
  Ba.prototype.getJikaze = function(playerNum){
    var oya = this.stack.state.oya;
    var bkz = this.stack.state.bakaze;
    var kz  = (playerNum - oya + 4)%4;
    var kzl = ['j1','j2','j3','j4'];
    for(var i=0;i<kzl.length;i++){
      if(kzl[i] === bkz){
        return kzl[ (i + kz)%4 ];
      }
    }
  }
  Ba.prototype.getNextKaze = function(kaze){
    var kzl = ['j1','j2','j3','j4'];
    var kza = null;
    for(var i=0;i<kzl.length;i++){
      var kz = kzl[i];
      if(kz === kaze){
        kza = i;
      }
    }
    kza = (kza + 1)%4;
    return kzl[kza];
  }

  var create = function(obj){
		App.Ba.view = new Ba(obj);
		return App.Ba.view;
	}
  return {
    view   : view,
    create : create
  }
})();
