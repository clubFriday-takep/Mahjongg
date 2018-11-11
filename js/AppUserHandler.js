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
  /*
   * Internal Methods
   */
  // Stack情報をParamsに設定する
  var setParamsFromStack = function(stack){
    var keys = ['mode','method'];
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      params[key] = stack[key];
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
  var daEvents = function(elist){
    var types = ['da'];
    var daObjAi  = user.userDaAi();
    // 手牌クリック時処理
    var clickUserTiles = function(e){
      e.data.ba.userDaExec(this.getAttribute('tileAddress'));
    }
    var clickReach = function(e){
      App.Modals.reach(e.data.ba);
      $('#modal').modal('open');
    }
    if(params.method !== 'manualDa'){
      return false;
    }else{
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
  }
  // Inject判定処理
  /*
  var isInject = function(stack){
    var rs = false;
    initGrobal();
    if(ba.auto){return false};
    params.mode = stack.mode;
    switch (stack.mode) {
      case 'da':
        if(stack.nowplay === 2){
          rs = true;
        }
        break;
      default:
    }
    if(rs){
      ba.stack.setNext('userInject');
    }
    return rs;
  }
  */
  // Event設定処理
  var setEvents = function(stack){
    setParamsFromStack(stack);
    var elist = [];
    daEvents(elist);
    dealer.svg.setEvents(elist);
    dealer.svg.bindEvents();
  }
  var commonEvents = function(elist){

  }

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
