App.UserHandler = (function(){
  // Const
  // Grobal
  var dealer = null;
  var ba     = null;
  var user   = null;
  var params = {
    mode   : false,
    method : false
  }
  var stack  = null;
  /*
   * Internal Methods
   */
  // Stack情報をParamsに設定する
  var setParamsFromStack = function(stk){
    stack = stk;
    var keys = ['mode','method'];
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      params[key] = stk[key];
    }
  }
  /*
   * External Methods
   */
  // Grobal Parameter 初期化
  var initGrobal = function(){
    dealer = App.Dealer.view;
    ba     = App.Ba.view;
    user   = ba.players[2];
    var keys = Object.keys(params);
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      params[key] = false;
    }
  }
  // 打牌イベント
  var manualDaEvents = function(elist){
    // できる操作
    var types = ['da'];
    user.userDaAi();
    // 手牌クリック時処理
    var clickUserTiles = function(e){
      e.data.ba.userDaExec(this.getAttribute('tileAddress'));
    }
    // リーチメニュークリック処理
    var clickReach = function(e){
      // モーダルのリーチ画面をセットしてモーダル画面を立ち上げる
      App.Modals.reach(e.data.ba);
      //$('#modal').modal('open');
    }
    // ０シャンテンの時
    if(user.ai.syantens[0].length > 0){
      types.push('reach');
      elist.push({
        selector : '#menuReach',
        trigger  : 'click',
        func     : clickReach,
        param    : {
          ba     : ba,
          //types  : types
        }
      })
    }
    // 手牌クリックイベント
    elist.push({
      selector : '.userTile',
      trigger  : 'click',
      func     : clickUserTiles,
      param    : {
        ba     : ba,
        types  : types
      }
    })
  }
  // リーチ後打牌イベント
  var mreachDaEvents = function(elist){
    var types = ['next'];
    /*
    var clickNext = function(e){
      Logger.debug(['次へボタン押下','e.data',e.data]);
      e.data.ba.tsumogiri(e.data.stack);
    }
    */
    elist.push({
      selector : '#menuNext',
      trigger  : 'click',
      func     : clickNext,
      param    : {
        ba     : ba,
        types  : types,
        stack  : stack
      }
    })
  }
  // 上がりイベント
  var agariEvents = function(elist){
    var types = ['agari','next'];
    /*
    var clickAgari = function(e){
      Logger.debug(['上がりボタン押下','e.data',e.data]);
      e.data.ba.agariCalc(e.data.stack);
    }
    */
    elist.push({
      selector : '#menuAgari',
      trigger  : 'click',
      func     : clickAgari,
      param    : {
        ba     : ba,
        types  : types,
        stack  : stack
      }
    });
    elist.push({
      selector : '#menuNext',
      trigger  : 'click',
      func     : clickNext,
      param    : {
        ba     : ba,
        types  : types,
        stack  : stack
      }
    })
  }
  // イベント実行時共通関数
  var clickNext = function(e){
    if('agari' === e.data.stack.method){
      if(!e.data.stack.params.tsumo){
        e.data.ba.skipRon(e.data.stack);
        return '';
      }
    }
    e.data.ba.tsumogiri(e.data.stack);
  }
  var clickAgari = function(e){
    e.data.ba.agariCalc(e.data.stack);
  }
  // Event設定処理
  var setEvents = function(stk){
    setParamsFromStack(stk);
    var elist = [];
    switch (params.method) {
      case 'manualDa':
        manualDaEvents(elist);
        break;
      case 'mreachDa':
        mreachDaEvents(elist);
        break;
      case 'agari':
        agariEvents(elist);
        break;
      default:
        // Skip
    }
    dealer.svg.setEvents(elist);
    dealer.svg.bindEvents();
  }
  var commonEvents = function(elist){}

  // ユーザ操作実行処理
  var execute = function(){
    return true;
  }
  var exeUserDa = function(){

  }
  return {
    initGrobal : initGrobal,
    //isInject   : isInject,
    setEvents  : setEvents,
    execute    : execute
  }
})();
