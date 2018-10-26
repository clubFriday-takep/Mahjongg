App.Ba = (function(){
  var view = null;
  // 場の進行を管理するオブジェクト
  var Stack = function(){
    this.mode       = 'init';
    this.usermode   = '';
    this.modebefore = '';
    this.bakaze     = 'j1';
    this.kyoku      = 0;
    this.oya        = 0;
    this.nowplay    = 0;
    this.turns      = 0;
    this.nakiwork   = {
      nakiflg    : false,
      nakiplayer : false,
      passplayer : false
    }
    this.agariWait  = [false,false,false,false];
    this.ponkanWait = [false,false,false,false];
    this.chiWait    = [false,false,false,false];
    this.agari      = [false,false,false,false];
    this.tempai     = [false,false,false,false];
  }
  Stack.prototype.setNext = function(mode){
    this.modebefore2 = this.modebefore + '';
    this.modebefore  = this.mode + '';
    this.mode = mode;
  }
  Stack.prototype.next = function(query){
    var rs = {
      mode    : 'end',
      draw    : true,
      param   : {},
      nowplay : this.nowplay
    }
    rs.mode = this.mode;
    // TEST
    var stacknamemap = {
      init:'初期化',
      haipai:'配牌',
      start:'ゲーム開始',
      tsumo:'ツモ！',
      da:'打牌',
      naki:'鳴き処理',
      nakiafter:'鳴き後処理',
      userInject:'ユーザ介入',
      end:'終了'
    }
    console.log();
    console.log('---------------');
    if(this.mode in stacknamemap){
      console.log(stacknamemap[this.mode] + ' ' + '開始');
    }else{
      console.log(this.mode);
    }
    console.log('---------------');
    switch (rs.mode) {
      case 'init' :
        this.setNext('haipai');
        this.kyoku = 1;
        rs.draw    = false;
        break;
      case 'haipai':
        this.setNext('start');
        rs.draw   = false;
        break;
      case 'start':
        this.setNext('tsumo');
        this.nowplay = this.oya + 0;
        rs.draw      = true;
        break;
      case 'tsumo':
        if(this.isLast()){
          this.setNext('end');
        }else{
          this.setNext('da');
        }
        rs.draw = true;
        rs.param.nowplay = this.nowplay + 0;
        this.turns++;
        break;
      case 'da':
        this.setNext('naki');
        // Test
        /*
        if(this.turns > 8){
          this.setNext('end');
        }
        */
        // Test End
        // 鳴き判定
        if(this.nakiwork.nakiflg){
          rs.param.nowplay = this.nakiwork.nakiplayer;
          this.nowplay = this.nakiwork.nakiplayer;
          this.nakiwork.nakiflg = false;
        }else{
          rs.param.nowplay = this.nowplay + 0;
          this.nowplay = (this.nowplay + 1)%4;
        }
        break;
      case 'naki':
        this.setNext('nakiafter');
        break;
      case 'nakiafter':
        rs.param.nakiflg    = this.nakiwork.nakiflg;
        rs.param.passplayer = this.nakiwork.passplayer;
        if(this.nakiwork.nakiflg){
          this.setNext('da');
        }else{
          this.setNext('tsumo');
        }
        break;
      case 'userInject' :
        this.setNext('end');
        rs.param.usermode = this.usermode;
        break;
      default:
        //rs.mode = 'end';
        this.setNext('end');
    }
    return rs;
  }
  Stack.prototype.isLast = function(){
    if(App.Ba.view.yama.lefts.length === 0){
      return true;
    }else{
      return false;
    }
  }
  var Ba  = function(obj){
		var obj = obj || {};
    this.stack    = new Stack();
		this.players  = [];
    this.auto     = false;
		this.points   = [25000,25000,25000,25000];
		this.kyotaku  = 0;
		this.wanpai   = [];
		this.dorashow = [];
		this.yama     = {};
		this.kawa     = {};
	}
  Ba.prototype.init = function(stack){
    this.yama = App.Yama.create();
    this.kawa = App.Kawa.create();
    this.createPlayers();
    this.selectOya();
    //this.haipai();
		return this;
	}
  Ba.prototype.next = function(){
    var stack = this.stack.next();
    this[stack.mode](stack);
    if(!stack.draw){
      stack = this.next();
    }
    return stack;
  }
  // Player作成処理
  Ba.prototype.createPlayers = function(){
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
    this.stack.oya = App.Util.getRandom(0,3);
  }
  // 配牌処理
  Ba.prototype.haipai = function(stack){
    this.haipaiToPlayers();
    this.haipaiToWanpai();
    this.ripaiAll();
  }
  // 配牌サブルーチン：Playerへの配牌
  Ba.prototype.haipaiToPlayers = function(){
    var haipaiPlayer = this.stack.oya;
    var pulls = 4*13;
    for(var i=0;i<pulls;i++){
      var player = this.players[haipaiPlayer];
      player.tsumo();
      haipaiPlayer = (haipaiPlayer + 1)%4;
    }
    // TEST
    /*
    var tehai2 = [
      {id:'m1',group:'m',pnum:0,num:1,reach:false,sort:1,red:false,dora:false,name:'１萬'},
      {id:'m2',group:'m',pnum:1,num:2,reach:false,sort:2,red:false,dora:false,name:'２萬'},
      {id:'m3',group:'m',pnum:2,num:3,reach:false,sort:3,red:false,dora:false,name:'３萬'},
      //{id:'m1',group:'m',pnum:0,num:1,reach:false,sort:1,red:false,dora:false,name:'１萬'},
      //{id:'m2',group:'m',pnum:1,num:2,reach:false,sort:2,red:false,dora:false,name:'２萬'},
      //{id:'m3',group:'m',pnum:2,num:3,reach:false,sort:3,red:false,dora:false,name:'３萬'},
      {id:'m4',group:'m',pnum:3,num:4,reach:false,sort:4,red:false,dora:false,name:'４萬'},
      {id:'m5',group:'m',pnum:4,num:5,reach:false,sort:5,red:false,dora:false,name:'５萬'},
      {id:'m6',group:'m',pnum:5,num:6,reach:false,sort:6,red:false,dora:false,name:'６萬'},
      {id:'m7',group:'m',pnum:6,num:7,reach:false,sort:7,red:false,dora:false,name:'７萬'},
      {id:'m8',group:'m',pnum:7,num:8,reach:false,sort:8,red:false,dora:false,name:'８萬'},
      {id:'m9',group:'m',pnum:8,num:9,reach:false,sort:9,red:false,dora:false,name:'９萬'},
      {id:'p1',group:'p',pnum:0,num:1,reach:false,sort:10,red:false,dora:false,name:'１筒'},
      {id:'p5',group:'p',pnum:4,num:5,reach:false,sort:14,red:false,dora:false,name:'５筒'},
      {id:'j1',group:'j',pnum:0,num:1,reach:false,sort:28,red:false,dora:false,name:'東'},
      {id:'j1',group:'j',pnum:0,num:1,reach:false,sort:28,red:false,dora:false,name:'東'},
      //{id:'j1',group:'j',pnum:0,num:1,reach:false,sort:28,red:false,dora:false,name:'東'},
      ]
    var tehai1 = [
      {id:'p1',group:'p',pnum:0,num:1,reach:false,sort:10,red:false,dora:false,name:'１筒'},
      {id:'p1',group:'p',pnum:0,num:1,reach:false,sort:10,red:false,dora:false,name:'１筒'},
      {id:'p1',group:'p',pnum:0,num:1,reach:false,sort:10,red:false,dora:false,name:'１筒'},
      {id:'p3',group:'p',pnum:0,num:3,reach:false,sort:12,red:false,dora:false,name:'３筒'},
      {id:'p3',group:'p',pnum:0,num:3,reach:false,sort:12,red:false,dora:false,name:'３筒'},
      {id:'p5',group:'p',pnum:4,num:5,reach:false,sort:14,red:false,dora:false,name:'５筒'},
      {id:'p5',group:'p',pnum:4,num:5,reach:false,sort:14,red:false,dora:false,name:'５筒'},
      //{id:'m1',group:'m',pnum:0,num:1,reach:false,sort:1,red:false,dora:false,name:'１萬'},
      {id:'m1',group:'m',pnum:0,num:1,reach:false,sort:1,red:false,dora:false,name:'１萬'},
      {id:'m1',group:'m',pnum:0,num:1,reach:false,sort:1,red:false,dora:false,name:'１萬'},
      {id:'m2',group:'m',pnum:1,num:2,reach:false,sort:2,red:false,dora:false,name:'２萬'},
      {id:'m2',group:'m',pnum:1,num:2,reach:false,sort:2,red:false,dora:false,name:'２萬'},
      {id:'m3',group:'m',pnum:2,num:3,reach:false,sort:3,red:false,dora:false,name:'３萬'},
      {id:'m3',group:'m',pnum:2,num:3,reach:false,sort:3,red:false,dora:false,name:'３萬'},
      //{id:'j1',group:'j',pnum:0,num:1,reach:false,sort:28,red:false,dora:false,name:'東'},
    ]
  for(var i=0;i<4;i++){
    var player = this.players[i];
    if(i===2){
      player.tehai = $.extend(true,[],tehai1);
    }else{
      player.tehai = $.extend(true,[],tehai2);
    }
  }
  */
  // TEST END
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

  // TODO 開始処理（PlayerAIに問い合わせ）
  Ba.prototype.start = function(stack){
    //console.log('Ba Start');
  }
  Ba.prototype.tsumo = function(stack){
    var player = this.players[stack.param.nowplay];
    player.tsumo();
  }
  Ba.prototype.da = function(stack){
    /*
    if(stack.nowplay === 2 && this.auto === false){
      this.userDa();
      App.UserHandler.userDo(stack);
    }
    */
    if(App.UserHandler.isInject(stack)){
      return false;
    }
    //else{
      var pnum   = stack.param.nowplay
      var player = this.players[pnum];
      var tile   = player.da();
      this.kawa.da(pnum,tile);
      player.ripai();
      console.log('> Player' + pnum + 'の打牌 : ' + tile.name);
    //}
  }
  Ba.prototype.userDa = function(){
    console.log('AAAAAAAAAAAAAAA');
    this.stack.setNext('userInject');
    this.stack.usermode = 'da';
  }
  Ba.prototype.userReachExec = function(obj){
    var player      = this.players[2];
    console.log(obj);
    var discardInfo = player.getTileInfo(obj.tileColor,obj.tileAddress);
    console.log(discardInfo);
    this.userDaExec(discardInfo.tileAddress);
  }
  Ba.prototype.userDaExec = function(tileAddress){
    var player = this.players[2];
    console.log(player);
    //var daObjAi  = player.userDaAi();
    //console.log(daObjAi);
    console.log('> ユーザの打牌');
    console.log('> Address : ' + tileAddress);
    //console.log(this);
    //console.log('>> ' + player.tehai[Number(tileAddress)].name);
    //console.log('> AIの推奨する打牌');
    //console.log('>> ' + player.tehai[daObjAi.add].name);
    var daObjUser  = player.userDaDiscard(tileAddress);
    this.kawa.da(2,daObjUser);
    this.stack.setNext('tsumo');
    player.ripai();
    App.Dealer.view.execute(true);
    App.Dealer.view.svg.unbindEvents();
  }
  Ba.prototype.userInject = function(stack){

  }
  Ba.prototype.setUserInjectEvent = function(dealerObj,stack){
    console.log('> User Event 設定処理');
    App.UserHandler.setEvents();
  }
  Ba.prototype.end = function(stack){
    //console.log('> Ba End');
    //console.log(this);
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
    this.stack.ponkanWait[playerNum] = ponkanflg || false;
    this.stack.chiWait[playerNum]    = chiflg    || false;
  }
  Ba.prototype.isNakiTile = function(playerNum,tileId,type){
    var pnum   = playerNum;
    var player = this.players[pnum];
    return player.isNaki(tileId,type);
  }
  Ba.prototype.getBakaze = function(){
    return this.stack.bakaze;
  }
  Ba.prototype.getJikaze = function(playerNum){
    var oya = this.stack.oya;
    var bkz = this.stack.bakaze;
    var kz  = (playerNum - oya + 4)%4;
    var kzl = ['j1','j2','j3','j4'];
    for(var i=0;i<kzl.length;i++){
      if(kzl[i] === bkz){
        return kzl[ (i + kz)%4 ];
      }
    }
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
