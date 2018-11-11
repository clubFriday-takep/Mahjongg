App.Stack = (function(){
  var Keep  = function(obj){
    this.mode     = obj.mode;            // Stack内のモード種別
    this.player   = obj.player || state.nowplay; // PlayerNumber
    this.method   = obj.method || false; // Baでコールしたいメソッド
    this.params   = obj.params || {};    // 受け渡しパラメータ
    this.draw     = obj.false  || false; // Ba Method終了時に再描画するか？
  }
  var state = {
    keeps   : [],
    logging : true,
    auto    : false,
    nowplay : 0,
    kyoku   : 1,
    bakaze  : 'j1',
    oya     : 0,
    turns   : 0,
    waits : { // 上がり以外いらなくなるかも
      agari  : [false,false,false,false],
      tempai : [false,false,false,false],
      ponkan : [false,false,false,false],
      chi    : [false,false,false,false],
    }
  }
  // Push Method Map
  var pushMap = {
    tsumo : ['setPushTsumo']
  }
  // pull Method Map
  var pullMap = {
    init   : ['logging','set'],
    haipai : ['logging','set'],
    start  : ['logging','set','draw'],
    tsumo  : ['logging','setPullTsumo','draw'],
    da     : ['logging','set','draw'],
      manualDa : ['logging','set','draw'],
    draw   : ['logging','draw']
  }
  // 定数群
  var Names = {
    init   : '初期化',
    haipai : '配牌',
    start  : '開始',
    tsumo  : 'ツモ',
    da     : '打',
      manualDa : 'ユーザ打',
    draw   : '描画'
  }
  var Setmap = {
    init   : { mode : 'haipai', method : 'haipai'},
    haipai : { mode : 'start',  method : 'start'},
    start  : { mode : 'tsumo',  method : 'tsumo'},
    tsumo  : { mode : 'da',     method : 'da'},
      manualTsumo : { mode : 'manualDa', method : 'manualDa' },
    da     : { mode : 'tsumo',  method : 'tsumo'},
      manualDa : { mode : 'tsumo',  method : 'tsumo'}
  }

  // Internal Methods Start
  var execPushs = function(keep){
    var exmethods = pushMap[keep.mode];
    Exs.exec(exmethods,keep);
  }
  var execPulls = function(keep){
    var exmethods = pullMap[keep.mode];
    Exs.exec(exmethods,keep);
  }
  // 共通実行処理
  var Exs = {};
  Exs.exec = function(exmethods,keep){
    if(exmethods){
      for(var i=0;i<exmethods.length;i++){
        var methodName = exmethods[i];
        this[methodName](keep);
      }
    }
  }
  // ロギング処理
  Exs.logging = function(keep){
    if( (keep.mode in Names) && (state.logging) ){
      Logger.enphasis(Names[keep.mode] + '処理' + '(Player:' + keep.player + ')');
    }
  }
  // 次のStackをSetする処理
  Exs.set = function(keep){
    var mode = keep.mode;
    if(mode in Setmap){
      var sets = Setmap[mode];
      push({
        mode : sets.mode,
        method : sets.method
      })
    }
  }
  // SVG描画予約処理
  Exs.draw = function(keep){
    keep.draw = true;
  }
  // ツモ固有処理
  Exs.setPushTsumo = function(keep){
    Logger.debug('ツモをスタックに追加します。')
    //Test
    if(state.turns === 16){
      //alert('stop!')
    }
    //Test end
    if(state.turns === 0){
      state.nowplay = state.oya;
      keep.player = state.nowplay + 0;
    }else{
      keep.player = (state.nowplay + 1)%4;
    }
    state.nowplay = keep.player + 0;
  }
  Exs.setPullTsumo = function(keep){
    state.turns++;
    Logger.debug(keep);
    if(keep.player === 2 && !state.auto){
      keep.mode = 'manualTsumo';
    }
    this.set(keep);
  }
  // 打固有処理

  // Internal Methods End

  // External Methods Start
  // Stackを積む処理
  // keepオブジェクトの変数をパラメータに設定する
  var push = function(obj){
    var keep = new Keep(obj);
    state.keeps.push(keep);
    execPushs(keep);
    return state;
  }
  // Stackから取り出す処理
  var pull = function(){
    var keep = state.keeps.pop();
    execPulls(keep);
    return {
      state : state,
      stack : keep
    };
  }
  // 初期化処理
  // initをStackに詰め込む
  var init = function(settings){
    var settings = settings || {};
    var keys = Object.keys(settings);
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      state[key] = settings[key];
    }
    push({ mode : 'init', method : 'init' });
    return state;
  }
  // API Methods END

  // APIs
  return {
    state : state,
    push  : push,
    pull  : pull,
    init  : init
  }
})();
