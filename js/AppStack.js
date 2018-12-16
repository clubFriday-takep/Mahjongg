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
      reach  : [false,false,false,false],
      tenpai : [false,false,false,false],
      ponkan : [false,false,false,false],
      chi    : [false,false,false,false],
    }
  }
  // ログ出力する文字列を管理
  var Names = {
    init     : '初期化',
    haipai   : '配牌',
    start    : '開始',
    tsumo    : 'ツモ',
    isTsumo  : 'ツモ上がり判定',
    da       : '打',
      manualDa : 'ユーザ打',
      mreachDa : 'リーチ中の打',
    makeNaki : '鳴き情報作成',
      mMakeNaki : 'ユーザ鳴き情報作成',
    isRon    : 'ロン上がり判定コントロール',
    isRonsb  : 'プレイヤーごとロン上がり判定',
    isNaki   : '鳴き判定処理',
    isNakisb : 'プレイヤーごとの鳴き判定',
     mIsDoNaki : 'ユーザ鳴き選択',
    agari    : 'あがり',
    draw     : '描画',
    ryukyoku : '流局',
    nextGame : '次局',
    nextInit : '次局初期化'
  }
  var Setmap = {
    init     : { mode : 'haipai',  method : 'haipai'},
    nextInit : { mode : 'haipai',  method : 'haipai'},
    haipai   : { mode : 'start',   method : 'start'},
    start    : { mode : 'tsumo',   method : 'tsumo'},
    tsumo    : { mode : 'isTsumo',      method : 'skip'},
    isTsumo  : { mode : 'da', method : 'da'},
    da       : { mode : 'makeNaki',   method : 'makeNaki'},
      manualDa : { mode : 'makeNaki',  method : 'makeNaki'},
      mreachDa : { mode : 'makeNaki',  method : 'makeNaki'},
    makeNaki : { mode : 'isRon', method : 'isRon'},
      mMakeNaki : { mode : 'isRon',  method : 'isRon'},
    isRon    : { mode : 'isNaki', method : 'skip'},
    //isRonsb // 特殊処理
    isNaki   : { mode : 'tsumo', method : 'tsumo'},
      //mIsDoNaki : {} Skip
      //mDoNaki : {},
  }
  /*
   * Method Map
   * スタックがpushまたはpullされたときの呼び出しメソッドを規定
   */
  // Push Method Map
  var pushMap = {
    tsumo : ['setPushTsumo']
  }
  // pull Method Map
  var pullMap = {
    init     : ['logging','set'],
    nextInit : ['logging','set'],
    haipai   : ['logging','set'],
    start    : ['logging','set','draw'],
    tsumo    : ['logging','isLeft','setPullTsumo','draw'],
      manualTsumo : ['logging','set','draw'],
    isTsumo  : ['logging','isTsumo','set'],
    da       : ['logging','setPullDa','draw'],
      manualDa  : ['logging','set','draw'],
      mreachDa  : ['logging','set','draw'],
    makeNaki : ['logging','setPullNaki'],
      mMakeNaki : ['logging','set'],
    isRon    : ['logging','set','isRon'],
    isRonsb  : ['logging'],
    isNaki   : ['logging','set','isNaki'],
      mIsDoNaki : ['logging','draw'],
    agari    : ['logging','draw'],
    draw     : ['logging','draw'],
    ryukyoku : ['logging'],
    nextGame : ['logging','nextGame'],
  }
  // Internal Methods Start
  // 共通実行処理
  // pull/push実行時メソッドを規定
  var Exs = {};
  Exs.exec = function(exmethods,keep){
    if(exmethods){
      for(var i=0;i<exmethods.length;i++){
        var methodName = exmethods[i];
        var flg = this[methodName](keep);
        if(flg){return flg};
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
  // ツモ固有処理(contains test)
  Exs.setPushTsumo = function(keep){
    // Test start
    //if(state.turns === 16){ alert('stop!') };
    // Test end
    if(state.turns === 0){
      state.nowplay = state.oya;
      keep.player = state.nowplay + 0;
    }else{
      keep.player = (state.nowplay + 1)%4;
    }
    state.nowplay = keep.player + 0;
  }
  Exs.isLeft = function(keep){
    if(!App.Ba.view.isLeft()){
      push({
        mode   : 'ryukyoku',
        method : 'ryukyoku'
      })
      return true;
    }
  }
  Exs.setPullTsumo = function(keep){
    state.turns++;
    this.set(keep);
  }
  // ツモ上がり判定
  Exs.isTsumo = function(keep){
    // ツモ判定条件がそろっていれば、ツモ判定メソッドをKeepに設定する。
    if(state.waits.agari[keep.player] || state.waits.reach[keep.player] || state.waits.tenpai[keep.player]){
      keep.method = 'isTsumo';
    }
  }
  // ロン上がり判定
  Exs.isRon = function(keep){
    for(var i=0;i<4;i++){
      if(!(i===0)){
        var pnum = (keep.player + 4 - i)%4;
        // ロン判定条件がそろっていれば、プレイヤーごとロン判定スタックを追加する。
        if(state.waits.agari[pnum] || state.waits.reach[pnum] || state.waits.tenpai[pnum]){
          push({
            mode   : 'isRonsb',
            method : 'isRon',
            player : pnum,
            params : {
              discardPlayer : keep.player,
              reach  : state.waits.reach[pnum],
              tenpai : state.waits.tenpai[pnum]
            }
          });
        }
      }
    }
  }
  Exs.isNaki = function(keep){
    for(var i=0;i<4;i++){
      if(!(i===0)){
        var pnum = (keep.player + 4 - i)%4;
        // マニュアルプレイヤーの場合
        if(pnum === 2 && !state.auto && !state.waits.reach[2]){
          var userpon = true;
          var userchi = false;
          if(keep.player === 1){ userchi = true };
          push({
            mode   : 'isNakisb',
            method : 'mIsNaki',
            player : pnum,
            params : {
              discardPlayer : keep.player,
              ponkan : userpon,
              chi : userchi,
              chiPatterns : [],
              ponPatterns : [],
              kanPatterns : []
            }
          });
          return true;
        }
        // チーが許される
        if(i===1){
          if(state.waits.ponkan[pnum] || state.waits.chi[pnum]){
            push({
              mode   : 'isNakisb',
              method : 'isNaki',
              player : pnum,
              params : {
                discardPlayer : keep.player,
                ponkan : state.waits.ponkan[pnum],
                chi    : state.waits.chi[pnum],
                chiPatterns : [],
                ponPatterns : [],
                kanPatterns : []
              }
            });
          }
        // チーが許されない
        }else{
          if(state.waits.ponkan[pnum]){
            push({
              mode   : 'isNakisb',
              method : 'isNaki',
              player : pnum,
              params : {
                discardPlayer : keep.player,
                ponkan : state.waits.ponkan[pnum],
                chi    : state.waits.chi[pnum],
                chiPatterns : [],
                ponPatterns : [],
                kanPatterns : []
              }
            });
          }
        }
      }
    }
  }
  Exs.setPullDa = function(keep){
    if(keep.player === 2 && !state.auto){
      if(state.waits.reach[2]){
        push({
          mode   : 'mreachDa',
          method : 'mreachDa',
          player : 2
        })
      }else{
        push({
          mode   : 'manualDa',
          method : 'manualDa',
          player : 2
        })
      }
      return true;
    }
    this.set(keep);
  }
  // 鳴き候補作成
  Exs.setPullNaki = function(keep){
    if(keep.player === 2 && !state.auto){
      push({
        mode   : 'mMakeNaki',
        method : 'mMakeNaki',
        player : 2
      })
      return true;
    }
    this.set(keep);
  }
  Exs.nextGame = function(keep){
    state.keeps = [];
    state.turns = 0;
    var keys = Object.keys(state.waits);
    for(var i=0;i<keys.length;i++){
      var key = keys[i];
      state.waits[key] = [false,false,false,false];
    }
    if( (keep.agari && (keep.player !== state.oya)) || !keep.agari ){
      state.kyoku++;
      state.oya = (state.oya++)%3;
      if(state.kyoku === 5){
        state.bakaze = App.Ba.view.getNextKaze();
      }else if(state.kyoku === 9){
        // TODO：終了
      }
    }
    push({
      mode   : 'nextInit',
      method : 'nextInit',
      player : 0
    })
  }
  var execPushs = function(keep){
    var exmethods = pushMap[keep.mode];
    Exs.exec(exmethods,keep);
  }
  var execPulls = function(keep){
    var exmethods = pullMap[keep.mode];
    return Exs.exec(exmethods,keep) || false;
  }
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
    var flg  = execPulls(keep);
    if(flg){
      return pull();
    }else{
      return {
        state : state,
        stack : keep
      };
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
  var setReach = function(playerNum){
    state.waits.reach[playerNum] = true;
    Logger.info('Player' + playerNum + 'がリーチしました。');
  }
  var clearAll = function(){
    state.keeps = [];
  }
  var setNowPlay = function(playerNum){
    state.nowplay = playerNum;
  }
  var setTempai = function(playerNum){
    state.waits.tenpai[playerNum] = true;
  }
  // API Methods END

  // APIs
  return {
    state : state,
    push  : push,
    pull  : pull,
    init  : init,
    setReach : setReach,
    clearAll : clearAll,
    setNowPlay : setNowPlay,
    setTempai : setTempai
  }
})();
