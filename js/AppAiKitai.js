App.Ai.Kitai = function(obj){}
App.Ai.Kitai.prototype.evalSyantens = function(){
  var syantens = this.root.syantens;
  var sAdds   = this.getFilteredSyantenAdd(syantens,3);
  for(var i=0;i<sAdds.length;i++){
    var sAdd = sAdds[i];
    for(var j=0;j<syantens[sAdd].length;j++){
      var syanten = syantens[sAdd][j];
      syanten.yaku = this.evalSyanten(syanten);
    }
  }
  return syantens;
}
App.Ai.Kitai.prototype.evalSyanten  = function(syanten){
  var yaku = new App.Ai.Kitai.Yaku(this,syanten);
      yaku.eval();
  return yaku;
}
// Handlerに移植？
App.Ai.Kitai.prototype.getFilteredSyantenAdd = function(syantens,num){
  var num   = num || 3;
  var rsAdd = [];
  for(var i=0;i<syantens.length;i++){
    var spattern = syantens[i];
    if( (spattern.length > 0) && (num > 0) ){
      rsAdd.push(i);
      num--;
    }
  }
  return rsAdd;
}

App.Ai.Kitai.Yaku = function(parent,syanten){
  this.parent    = parent;
  this.syanten   = syanten;
  this.sclasses  = null;
  this.yaku = {
    dora     : { num : 0, han : 1, naki : 1}, // TODO
    pinhu    : { num : 0, han : 1, naki : 0},
    tanyao   : { num : 0, han : 1, naki : 1},
    ipeko    : { num : 0, han : 1, naki : 0},
    yakuhai  : { num : 0, han : 1, naki : 1},
    toitoi   : { num : 0, han : 2, naki : 2},
    sananko  : { num : 0, han : 2, naki : 2},
    dojun    : { num : 0, han : 2, naki : 2},
    doko     : { num : 0, han : 2, naki : 2},
    itsu     : { num : 0, han : 2, naki : 1},
    honroto  : { num : 0, han : 2, naki : 2},
    chanta   : { num : 0, han : 2, naki : 1},
    syosangen: { num : 0, han : 2, naki : 2},
    sankantsu: { num : 0, han : 2, naki : 2},
    honitsu  : { num : 0, han : 3, naki : 2},
    junchan  : { num : 0, han : 3, naki : 2},
    ryanpeko : { num : 0, han : 3, naki : 0},
    chinitsu : { num : 0, han : 6, naki : 5},
    suanko   : { num : 0, han : 0, naki : 0, yakuman : 1}
  }
  this.keiko = {
    pinhu     : { expect : false, rate : 0, yukohai : [] },
    tanyao    : { expect : false, rate : 0, yukohai : [] },
    yakuhai   : { expect : false, rate : 0, yukohai : [] },
    toitoi    : { expect : false, rate : 0, yukohai : [] },
    sananko   : { expect : false, rate : 0, yukohai : [] },
    suanko    : { expect : false, rate : 0, yukohai : [] },
    dojun     : { expect : false, rate : 0, yukohai : [] },
    doko      : { expect : false, rate : 0, yukohai : [] },
    itsu      : { expect : false, rate : 0, yukohai : [] },
    honroto   : { expect : false, rate : 0, yukohai : [] },
    chanta    : { expect : false, rate : 0, yukohai : [] },
    junchan   : { expect : false, rate : 0, yukohai : [] },
    syosangen : { expect : false, rate : 0, yukohai : [] },
    daisangen : { expect : false, rate : 0, yukohai : [] },
    sankantsu : { expect : false, rate : 0, yukohai : [] },
    honitsu   : { expect : false, rate : 0, yukohai : [] },
    chinitsu  : { expect : false, rate : 0, yukohai : [] },
    tsuiso    : { expect : false, rate : 0, yukohai : [] },
  }
  this.han  = 0;
  this.yakuList = [];
}
App.Ai.Kitai.Yaku.prototype.init = function(){
  this.han = 0;
  this.yakuList = [];
  var keys = Object.keys(this.yaku);
  for(var i=0;i<keys.length;i++){
    var key = keys[i];
    this.yaku[key].num = 0;
  }
}
App.Ai.Kitai.Yaku.prototype.eval = function(){
  Logger.debug(['役評価',this])
  // Init
  this.init();
  this.splitSclass();
  // 上がるまで不確定の役の判定処理
  // 上がり時の処理
  if(this.syanten.scnt === -1){
    // 上がり時は引数にtrue
    this.evalConfirmedYaku();
  }else{
    // 役傾向の処理
    this.evalExpectYaku();
    // 確定役の処理
    this.evalConfirmedYaku();
  }
  // 役数計算
  this.calcYaku();
}
App.Ai.Kitai.Yaku.prototype.calcYaku = function(){
  var keys = Object.keys(this.yaku);
  for(var i=0;i<keys.length;i++){
    var key  = keys[i];
    var yaku = this.yaku[key];
    if(yaku.num > 0){
      this.han = this.han + yaku.han;
      this.yakuList.push(key);
    }
  }
}
// 役リスト返却処理
App.Ai.Kitai.Yaku.prototype.getYakuList = function(menzen){
  var rs = [];
  for(var i=0;i<this.yakuList.length;i++){
    var obj  = {};
    var key  = this.yakuList[i];
    var yaku = this.yaku[key];
    if(menzen){
      obj[key] = yaku.num * yaku.han;
    }else{
      obj[key] = yaku.num * yaku.naki;
    }
    rs.push(obj);
  }
  return rs;
}
// 確定役判定処理群
// Facade処理
App.Ai.Kitai.Yaku.prototype.evalConfirmedYaku = function(){
  this.evalTanyao();
  this.evalIpekoRyanpeko();
  this.evalYakuhai();
  this.evalSananko();
  this.evalItsu();
  this.evalDojun();
  this.evalDoko();
}
// タンヤオの判定処理
App.Ai.Kitai.Yaku.prototype.evalTanyao = function(){
  var isTanyao = true;
  // 自牌の組み合わせがないこと
  if(this.syanten.j.length > 0){
    isTanyao = false;
  }else{
    var toitsuAnkoAry = [];
    var tatsuAry      = [];
    var syuntsuAry    = [];
    // たんやおチェック関数
    var tanyaoCheck = function(ary,type){
      var tflg = true;
      for(var i=0;i<ary.length;i++){
        var kumiawase = ary[i];
        switch (type) {
          case 'ta':
            if(kumiawase[0]===1 || kumiawase[0]===9){
              tflg = false;
            }
            break;
          case 'ts':
            if(kumiawase[0]===1 || kumiawase[1]===9){
              tflg = false;
            }
            break;
          case 'sy':
            if(kumiawase[0]===1 || kumiawase[2]===9){
              tflg = false;
            }
            break;
        }
      }
      if(!tflg){
        isTanyao = false;
      }
    }
    for(var i=0;i<3;i++){
      toitsuAnkoAry = toitsuAnkoAry.concat(this.sclasses.getToitsu(i));
      toitsuAnkoAry = toitsuAnkoAry.concat(this.sclasses.getAnko(i));
      tatsuAry = tatsuAry.concat(this.sclasses.getKTatsu(i));
      tatsuAry = tatsuAry.concat(this.sclasses.getPTatsu(i));
      tatsuAry = tatsuAry.concat(this.sclasses.getRTatsu(i));
      syuntsuAry = syuntsuAry.concat(this.sclasses.getSyuntsu(i));
    }
    tanyaoCheck(toitsuAnkoAry,'ta');
    tanyaoCheck(tatsuAry,'ts');
    tanyaoCheck(syuntsuAry,'sy');
  }
  if(isTanyao){
    this.yaku.tanyao.num++;
  }
}
// イイぺーこーとかの判定
App.Ai.Kitai.Yaku.prototype.evalIpekoRyanpeko = function(){
  var ipekonum = 0;
  if(this.syanten.snum > 1){
    var checkForEval = function(forEval,syuntsu){
      for(var i=0;i<forEval.length;i++){
        var fe = forEval[i];
        if(fe[0] === syuntsu[0]){
          forEval.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    for(var i=0;i<3;i++){
      var syuntsuAry = this.sclasses.getSyuntsu(i);
      var forEval    = [];
      for(var j=0;j<syuntsuAry.length;j++){
        var syuntsu = syuntsuAry[j];
        var flg = checkForEval(forEval,syuntsu);
        if(flg){
          ipekonum++;
        }else{
          forEval.push(syuntsu);
        }
      }
    }
  }
  if(ipekonum === 1){
    this.yaku.ipeko.num++;
  }else if(ipekonum === 2){
    this.yaku.ryanpeko.num++;
  }
}
// 役牌の判定
App.Ai.Kitai.Yaku.prototype.evalYakuhai = function(){
  if(this.syanten.anum > 0){
    var getKazeAdd = function(kaze){
      switch (kaze) {
        case 'j1':
          return 1;
        case 'j2':
          return 2;
        case 'j3':
          return 3;
        case 'j4':
          return 4;
      }
    }
    var jianko = this.sclasses.getAnko(3);
    var bakaze = getKazeAdd( App.Ba.view.getBakaze() );
    var jikaze = getKazeAdd( App.Ba.view.getJikaze(this.parent.root.player.playerNum) );
    for(var i=0;i<jianko.length;i++){
      var ja = jianko[i];
      if(ja[0] === bakaze){this.yaku.yakuhai.num++};
      if(ja[0] === jikaze){this.yaku.yakuhai.num++};
    }
  }
}
// 三暗刻、四暗刻の判定
App.Ai.Kitai.Yaku.prototype.evalSananko = function(){
  if(this.syanten.anum === 3){
    this.yaku.sananko.num++;
  }else if(this.syanten.anum === 4){
    this.yaku.suanko.num++;
  }
}
// ３色同順
App.Ai.Kitai.Yaku.prototype.evalDojun = function(){
  if(this.syanten.snum > 2){
    var sameAry = [0,0,0,0,0,0,0];
    for(var i=0;i<3;i++){
      var syuntsuAry = this.sclasses.getSyuntsu(i);
      for(var j=0;j<syuntsuAry.length;j++){
        var syuntsu = syuntsuAry[j];
        sameAry[syuntsu[0]-1]++;
      }
    }
    for(var i=0;i<sameAry.length;i++){
      if(sameAry === 3){
        this.yaku.dojun.num++;
      }
    }
  }
}
// ３色同刻
App.Ai.Kitai.Yaku.prototype.evalDoko = function(){
  if(this.syanten.anum > 2){
    var sameAry = [0,0,0,0,0,0,0,0,0];
    for(var i=0;i<3;i++){
      var ankoAry = this.sclasses.getAnko(i);
      for(var j=0;j<ankoAry.length;j++){
        var anko = ankoAry[j];
        sameAry[anko[0]-1]++;
      }
    }
    for(var i=0;i<sameAry.length;i++){
      if(sameAry === 3){
        this.yaku.doko.num++;
      }
    }
  }
}
// 一気通貫
App.Ai.Kitai.Yaku.prototype.evalItsu = function(){
  if(this.syanten.snum > 2){
    for(var i=0;i<3;i++){
      var syuntsuAry = this.sclasses.getSyuntsu(i);
      if(syuntsuAry.length > 2){
        var p123 = false,
            p456 = false,
            p789 = false;
        for(var j=0;j<syuntsuAry.length;j++){
          var syuntsu = syuntsuAry[j];
          switch (syuntsu[0]) {
            case 1:
              p123 = true;
              break;
            case 4:
              p456 = true;
              break;
            case 7:
              p789 = true;
              break;
            default:
          }
        }
        if(p123 && p456 && p789){
          this.yaku.itsu.num++;
        }
      }
    }
  }
}
// 混老頭
// チャンタ
// 小三元

// 期待役処理群
App.Ai.Kitai.Yaku.prototype.evalExpectYaku = function(){
  this.exYakuhai();
  this.exPinhu();
  this.exTanyao();
  this.exSomete();
  /*
  toitoi    : { expect : false, rate : 0, yukohai : [] },
  sananko   : { expect : false, rate : 0, yukohai : [] },
  suanko    : { expect : false, rate : 0, yukohai : [] },
  dojun     : { expect : false, rate : 0, yukohai : [] },
  doko      : { expect : false, rate : 0, yukohai : [] },
  itsu      : { expect : false, rate : 0, yukohai : [] },
  honroto   : { expect : false, rate : 0, yukohai : [] },
  chanta    : { expect : false, rate : 0, yukohai : [] },
  junchan   : { expect : false, rate : 0, yukohai : [] },
  syosangen : { expect : false, rate : 0, yukohai : [] },
  daisangen : { expect : false, rate : 0, yukohai : [] },
  sankantsu : { expect : false, rate : 0, yukohai : [] },
  */
}
// 平和の判定処理
App.Ai.Kitai.Yaku.prototype.exPinhu = function(){
  var yukomap  = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
  var point = 0;
  var janto = false;
  // 対子に対する処理
  if(this.syanten.tnum === 1){
    var jitoitsuAry = this.sclasses.getToitsu(3);
    if(jitoitsuAry.length > 0){
      var bakaze = Number(App.Ba.view.getBakaze().slice(1));
      var jikaze = Number(App.Ba.view.getJikaze(this.parent.root.player.playerNum).slice(1));
      if( (!(jitoitsuAry[0][0] === bakaze)) && (!(jitoitsuAry[0][0] === jikaze)) && (jitoitsuAry[0][0] < 5) ){
        point = point + 10;
        janto = true;
        yukomap[3][jitoitsuAry[0][0] - 1] = 1;
      }
    }else{
      for(var i=0;i<3;i++){
        var toitsuAry = this.sclasses.getToitsu(i);
        if(toitsuAry.length > 0){
          point = point + 10;
          janto = true;
          yukomap[i][toitsuAry[0][0] - 1] = 1;
        }
      }
    }
  }
  // 順子に対する処理
  // あらかじめ雀頭を考慮したマイナスを付与
  switch (this.syanten.snum) {
    case 4:
      point = point + 90;
      break;
    case 3:
      point = point + 70;
      break;
    case 2:
      point = point + 50;
      break;
    case 1:
      point = point + 10;
      break;
    default:
      if(point > 0){
        point = point - 10;
      }
  }
  if(janto){
    point = point + 10;
  }
  // 両面塔子に対する処理
  if(this.syanten.rnum > 3){
    if(janto){
      if(point < 80){
        point = 80;
      }
    }else{
      if(point < 50){
        point = 50;
      }
    }
  }else{
    point = point + this.syanten.rnum*10;
    if(janto){
      point = point + 10;
    }
  }
  if(point > 0){
    this.keiko.pinhu.expect = true;
    this.keiko.pinhu.rate   = point;
    var updYuko = function(color,ary){
      for(var a=0;a<ary.length;a++){
        for(var b=0;b<ary[a].length;b++){
          var abnum = ary[a][b] - 1;
          yukomap[color][abnum] = 1;
        }
      }
    }
    // 有効マップの更新
    for(var i=0;i<3;i++){
      var syuntsuAry = this.sclasses.getSyuntsu(i);
      var rtatsuAry  = this.sclasses.getRTatsu(i);
      updYuko(i,syuntsuAry);
      updYuko(i,rtatsuAry);
    }
    // 有効牌のPUSH
    for(var i=0;i<4;i++){
      var ycolorAry = yukomap[i];
      for(var j=0;j<ycolorAry.length;j++){
        var ytile = ycolorAry[j];
        if(ytile > 0){
          this.keiko.pinhu.yukohai.push(App.Util.colorAddToCd(i) + (j + 1));
        }
      }
    }
  }
}
// タンヤオの判定処理
App.Ai.Kitai.Yaku.prototype.exTanyao = function(){
  var stn = this.syanten;
  var fixnum     = stn.anum + stn.snum;
  var unfixnum   = stn.tnum + stn.rnum + stn.knum;
  var ptnnum     = fixnum + unfixnum;
  if( ptnnum > 2 ){
    var chuchannum = 0;
    var yaochunum  = 0;
    var rtwoeight  = 0;
    var yukomap = [
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ]
    var updYuko    = function(color,ary){
      for(var i=0;i<ary.length;i++){
        yukomap[color][ary[i]-1] = 1;
      }
    }
    var comCntAry  = function(color,ary,type){
      for(var i=0;i<ary.length;i++){
        var tiles = ary[i];
        switch (type) {
          case 1: // 暗刻
          case 3: // 対子
            if( (tiles[0] !== 1) && (tiles[0] !== 9 ) ){
              chuchannum++;
              updYuko(color,tiles);
            }else{
              yaochunum++;
            }
            break;
          case 2: // 順子
            if( (tiles[0] !== 1) && (tiles[2] !== 9 ) ){
              chuchannum++;
              updYuko(color,tiles);
            }else{
              yaochunum++;
            }
            break;
          case 4: // 両面
          case 5: // 間張
            if( (tiles[0] !== 1) && (tiles[1] !== 9 ) ){
              chuchannum++;
              updYuko(color,tiles);
            }else{
              yaochunum++;
            }
            break;
          case 6: // 辺張
            yaochunum++;
            break;
          default:
        }
      }
    }
    for(var i=0;i<3;i++){
      var ankoAry   = this.sclasses.getAnko(i);
      var syuntsuAry = this.sclasses.getSyuntsu(i);
      var toitsuAry = this.sclasses.getToitsu(i);
      var ryanmenAry = this.sclasses.getRTatsu(i);
      var kanchan = this.sclasses.getKTatsu(i);
      var penchan = this.sclasses.getPTatsu(i);
      comCntAry(i,ankoAry,1);
      comCntAry(i,syuntsuAry,2);
      comCntAry(i,toitsuAry,3);
      comCntAry(i,ryanmenAry,4);
      comCntAry(i,kanchan,5);
      comCntAry(i,penchan,6);
    }
    // 字牌カウント
    var jiAnkoAry = this.sclasses.getAnko(3);
    var jitoitsuAry = this.sclasses.getToitsu(3);
    yaochunum = yaochunum + jiAnkoAry.length + jitoitsuAry.length;
    var workCheck = function(){
      var rs = 0;
      var workAll = 0;
      var yaochus = 0;
      for(var i=0;i<3;i++){
        var colortiles = stn.work[i];
        for(var j=0;j<9;j++){
          var colortile = colortiles[j];
          workAll = workAll + colortile;
          if((j === 0) || (j===8)){
            yaochus = yaochus + colortile;
          }
        }
      }
      var jitiles = stn.work[3];
      for(var i=0;i<7;i++){
        workAll = workAll + jitiles[i];
        yaochus = yaochus + jitiles[i];
      }
      var yaochuRate = Math.round( yaochus/workAll*100 );
      if(yaochuRate < 11){
        return 20;
      }else if(yaochuRate < 21){
        return 10;
      }else{
        return 0;
      }
    }
    // 計算処理
    var rate = 0;
    if(chuchannum > 4){
      rate = 100;
    }else if((chuchannum === 4) && (yaochunum === 0)){
      rate = 90;
    }else if((chuchannum === 3) && (yaochunum === 0)){
      rate = 70 + workCheck();
    }else if((chuchannum === 3) && (yaochunum === 1)){
      rate = 50 + workCheck();
    }else if((chuchannum === 2) && (yaochunum === 0)){
      rate = 30 + workCheck();
    }else if((chuchannum === 2) && (yaochunum === 1)){
      rate = 10 + workCheck();
    }
    this.keiko.tanyao.rate = rate;
    if(rate > 0){
      this.keiko.tanyao.expect = true;
      for(var i=0;i<yukomap.length;i++){
        for(var j=0;j<yukomap[i].length;j++){
          if(yukomap[i][j]>0){
            this.keiko.tanyao.yukohai.push(App.Util.colorAddToCd(i) + (j + 1));
          }
        }
      }
    }
  }
}
// 染め手の判定処理
App.Ai.Kitai.Yaku.prototype.exSomete = function(){
  var colornum = [0,0,0,0];
  var yukomap  = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0]
  ];
  for(var i=0;i<4;i++){
    var colorCd  = App.Util.colorAddToCd(i);
    var addnum   = colornum[i];
    var colorAry = this.syanten[colorCd];
    for(var j=0;j<colorAry.length;j++){
      var tiles  = colorAry[j];
      addnum = addnum + tiles.length;
      for(var k=0;k<tiles.length;k++){
        yukomap[i][tiles[k]-1] = 1;
      }
    }
    var works = this.syanten.work[i];
    for(var j=0;j<works.length;j++){
      addnum = addnum + works[j];
      if(works[j] > 0){
        yukomap[i][j] = 1;
      }
    }
    colornum[i] = addnum;
  }
  var jAnkoAry   = this.sclasses.getAnko(3);
  var jAnkoNum   = jAnkoAry.length;
  var jToitsuAry = this.sclasses.getToitsu(3);
  var jToitsuNum = jToitsuAry.length;
  var jGroupNum  = jAnkoNum + jToitsuNum;

  // 字一色の判定
  var tsuisoExpect = true;
  var tsuisoRate   = 0;
  if(jGroupNum > 4){
    tsuisoRate = 100;
  }else if(jGroupNum > 3){
    if(colornum[3] > 8){
      tsuisoRate = 100;
    }else{
      tsuisoRate = 90;
    }
  }else if(jGroupNum > 2){
    if(colornum[3] > 9){
      tsuisoRate = 80;
    }else if(colornum[3] > 8){
      tsuisoRate = 70;
    }else if(colornum[3] > 7){
      tsuisoRate = 60;
    }else{
      tsuisoRate = 50;
    }
  }else{
    tsuisoExpect = false;
  }
  this.keiko.tsuiso.expect = tsuisoExpect;
  this.keiko.tsuiso.rate   = tsuisoRate;
  if(tsuisoExpect){
    for(var i=0;i<yukomap[3].length;i++){
      if(yukomap[3][i]>0){
        this.keiko.tsuiso.yukohai.push('j' + (i + 1));
      }
    }
  }

  // 清一色の判定
  var chinitsuExpect = true;
  var chinitsuRate   = 0;
  for(var i=0;i<3;i++){
    var isChinitsuColor = true;
    var mpscolornum = colornum[i];
    switch (mpscolornum) {
      case 14:
        chinitsuRate = 100;
        break;
      case 13:
        chinitsuRate = 90;
        break;
      case 12:
        chinitsuRate = 80;
        break;
      case 11:
        chinitsuRate = 70;
        break;
      case 10:
        chinitsuRate = 50;
        break;
      case 9:
        chinitsuRate = 20;
        break;
      default:
        isChinitsuColor = false;
    }
    if(isChinitsuColor){
      this.keiko.chinitsu.expect = chinitsuExpect;
      this.keiko.chinitsu.rate   = chinitsuRate;
      for(var j=0;j<yukomap[i].length;j++){
        if(yukomap[i][j]>0){
          this.keiko.chinitsu.yukohai.push(App.Util.colorAddToCd(i) + (j + 1));
        }
      }
    }
  }

  // 混一色の判定
  for(var i=0;i<3;i++){
    var honitsuExpect = true;
    var honitsuRate   = 0;
    var isHonitsuColor = true;
    var mpscolornum = colornum[i];
    var mpsjinum    = mpscolornum + colornum[3];
    if(mpscolornum > 6){
      switch (mpsjinum) {
        case 14:
          honitsuRate = 100;
          break;
        case 13:
          honitsuRate = 90;
          break;
        case 12:
          honitsuRate = 80;
          break;
        case 11:
          honitsuRate = 60;
          break;
        case 10:
          honitsuRate = 50;
          break;
        case 9:
          honitsuRate = 20;
          break;
        default:
          isHonitsuColor = false;
      }
      if(isHonitsuColor){
        var hjAnkoAry   = this.sclasses.getAnko(3);
        var hjAnkoNum   = hjAnkoAry.length;
        var hjToitsuAry = this.sclasses.getToitsu(3);
        var hjToitsuNum = hjToitsuAry.length;
        var hjGroupNum  = hjAnkoNum + hjToitsuNum;
        var hjaddRate   = hjGroupNum * 10;
        honitsuRate = honitsuRate + hjaddRate;
        if(honitsuRate > 100){
          honitsuRate = 100;
        }
        this.keiko.honitsu.expect = honitsuExpect;
        this.keiko.honitsu.rate   = honitsuRate;
        for(var j=0;j<yukomap[i].length;j++){
          if(yukomap[i][j]>0){
            this.keiko.honitsu.yukohai.push(App.Util.colorAddToCd(i) + (j + 1));
          }
        }
        for(var j=0;j<yukomap[3].length;j++){
          if(yukomap[3][j]>0){
            this.keiko.honitsu.yukohai.push(App.Util.colorAddToCd(3) + (j + 1));
          }
        }
      }
    }
  }
}
// 役牌の判定処理
App.Ai.Kitai.Yaku.prototype.exYakuhai = function(){
  if(this.syanten.anum > 0 || this.syanten.tnum > 0){
    var yukomap = [0,0,0,0,0,0,0]
    var getKazeAdd = function(kaze){
      switch (kaze) {
        case 'j1':
          return 1;
        case 'j2':
          return 2;
        case 'j3':
          return 3;
        case 'j4':
          return 4;
      }
    }
    var jianko = this.sclasses.getAnko(3);
    var jitoitsu = this.sclasses.getToitsu(3);
    var bakaze = getKazeAdd( App.Ba.view.getBakaze() );
    var jikaze = getKazeAdd( App.Ba.view.getJikaze(this.parent.root.player.playerNum) );
    for(var i=0;i<jianko.length;i++){
      var ja = jianko[i];
      if(ja[0] === bakaze || ja[0] === jikaze || ja[0] > 4){
        this.keiko.yakuhai.expect = true;
        this.keiko.yakuhai.rate   = 100;
        yukomap[ja[0]-1] = 1;
      }
    }
    var jiToitsuFlg = false;
    for(var i=0;i<jitoitsu.length;i++){
      var jt = jitoitsu[i];
      if(jt[0] === bakaze || jt[0] === jikaze || jt[0] > 4){
        jiToitsuFlg = true;
        yukomap[jt[0]-1] = 1;
        this.keiko.yakuhai.rate = this.keiko.yakuhai.rate + 10;
      };
    }
    if(jiToitsuFlg){
      this.keiko.yakuhai.expect = true;
      this.keiko.yakuhai.rate = this.keiko.yakuhai.rate + 50;
    }
    if(this.keiko.yakuhai.rate > 100){
      this.keiko.yakuhai.rate = 100;
    }
    for(var i=0;i<yukomap.length;i++){
      if(yukomap[i] > 0){
        this.keiko.yakuhai.yukohai.push('j' + (i + 1));
      }
    }
  }
}

App.Ai.Kitai.Yaku.prototype.splitSclass = function(syanten){
  Sclasses = function(){
    this.classes = [];
  }
  Sclasses.prototype.getSyuntsu = function(add){
    var sclass = this.classes[add];
    return sclass.getSyuntsu();
  }
  Sclasses.prototype.getAnko    = function(add){
    var sclass = this.classes[add];
    return sclass.getAnko();
  }
  Sclasses.prototype.getToitsu = function(add){
    var sclass = this.classes[add];
    return sclass.getToitsu();
  }
  Sclasses.prototype.getRTatsu = function(add){
    var sclass = this.classes[add];
    return sclass.getRTatsu();
  }
  Sclasses.prototype.getKTatsu = function(add){
    var sclass = this.classes[add];
    return sclass.getKTatsu();
  }
  Sclasses.prototype.getPTatsu = function(add){
    var sclass = this.classes[add];
    return sclass.getPTatsu();
  }

  Sclass = function(colorAdd){
    this.color   = colorAdd;
    this.anko    = [];
    this.syuntsu = [];
    this.toitsu  = [];
    this.ryanmen = [];
    this.kanchan = [];
    this.penchan = [];
  }
  Sclass.prototype.set = function(tiles){
    if(tiles.length > 2){
      if(tiles[0] === tiles[1]){
        this.anko.push(tiles);
      }else{
        this.syuntsu.push(tiles);
      }
    }else if(tiles.length === 2){
      if(tiles[0] === tiles[1]){
        this.toitsu.push(tiles);
      }else if((tiles[0] + 2) === tiles[1]){
        this.kanchan.push(tiles);
      }else if((tiles[0] + 1) === tiles[1]){
        if( (tiles[0]===1) || tiles[1]===9 ){
          this.penchan.push(tiles);
        }else{
          this.ryanmen.push(tiles);
        }
      }
    }
  }
  Sclass.prototype.getSyuntsu = function(){
    var rs = [];
    for(var i=0;i<this.syuntsu.length;i++){
      rs.push(this.syuntsu[i]);
    }
    return rs;
  }
  Sclass.prototype.getAnko = function(){
    var rs = [];
    for(var i=0;i<this.anko.length;i++){
      rs.push(this.anko[i]);
    }
    return rs;
  }
  Sclass.prototype.getToitsu = function(){
    var rs = [];
    for(var i=0;i<this.toitsu.length;i++){
      rs.push(this.toitsu[i]);
    }
    return rs;
  }
  Sclass.prototype.getRTatsu = function(){
    var rs = [];
    for(var i=0;i<this.ryanmen.length;i++){
      rs.push(this.ryanmen[i]);
    }
    return rs;
  }
  Sclass.prototype.getKTatsu = function(){
    var rs = [];
    for(var i=0;i<this.kanchan.length;i++){
      rs.push(this.kanchan[i]);
    }
    return rs;
  }
  Sclass.prototype.getPTatsu = function(){
    var rs = [];
    for(var i=0;i<this.penchan.length;i++){
      rs.push(this.penchan[i]);
    }
    return rs;
  }

  this.sclasses = new Sclasses();
  for(var i=0;i<4;i++){
    var sclass  = new Sclass(i);
    var colorCd = App.Util.colorAddToCd(i);
    for(var j=0;j<this.syanten[colorCd].length;j++){
      var tiles = this.syanten[colorCd][j];
      sclass.set(tiles);
    }
    this.sclasses.classes.push(sclass);
  }
}

// 後で移植
App.Point = (function(){
  var pointKo  = {
    30 : {
      1 : { ron : 1000, oya : 500,  ko : 300 },
      2 : { ron : 2000, oya : 1000, ko : 500 },
      3 : { ron : 3900, oya : 2000, ko : 1000 },
      4 : { ron : 7700, oya : 3900, ko : 2000 },
    }
  }
  var pointOya = {
    20 : {

    },
    30 : {
      1 : { ron : 1500, all : 500 },
      2 : { ron : 2900, all : 1000 },
      3 : { ron : 5800, all : 2000 },
      4 : { ron : 11600, all : 3900 },
    }
  }
  var manganOya = {
    mangan  : { ron : 12000, all : 4000 },
    haneman : { ron : 18000, all : 6000 },
    baiman  : { ron : 24000, all : 8000 },
    sanbai  : { ron : 36000, all : 12000 },
    yakuman : { ron : 48000, all : 16000 }
  }
  var manganKo = {
    mangan  : { ron : 8000,  oya : 4000,  ko : 2000 },
    haneman : { ron : 12000, oya : 6000,  ko : 3000 },
    baiman  : { ron : 16000, oya : 8000,  ko : 4000 },
    sanbai  : { ron : 24000, oya : 12000, ko : 6000 },
    yakuman : { ron : 32000, oya : 16000, ko : 8000 }
  }
  var getMangan = function(han,isOya){
    var manflg = false;
    var table  = manganKo;
    if(isOya){ table = manganOya };
    if(han < 5){
      return false;
    }else if(han < 6){
      manflg = 'mangan';
    }else if(han < 8){
      manflg = 'haneman';
    }else if(han < 11){
      manflg = 'baiman';
    }else if(han < 13){
      manflg = 'sanbai';
    }else{
      manflg = 'yakuman';
    }
    return table[manflg];
  }
  var getNotMangan = function(fu,han,isOya){
    var table = pointKo;
    if(isOya){table=pointOya};
    return table[fu][han];
  }
  var createDeals = function(player,oya,isOya,isTsumo,hojuP,pObj){
    Logger.debug(['Parameters',player,oya,isOya,isTsumo,hojuP,pObj]);
    var deals = [0,0,0,0];
    // パターン判定
    var patterns = 'ron';
    if(isTsumo && !isOya){      patterns = 'koTsumo' }
    else if(isTsumo && isOya){  patterns = 'oyaTsumo'}
    if(patterns === 'ron'){
      deals[player] = pObj.ron;
      deals[hojuP]  = deals[hojuP] - pObj.ron;
    }else{
      for(var i=0;i<4;i++){
        if(patterns === 'koTsumo'){
          if(i === player){
            deals[i] = deals[i] + pObj.oya + pObj.ko*2;
          }else if(i === oya){
            deals[i] = deals[i] - pObj.oya;
          }else{
            deals[i] = deals[i] - pObj.ko;
          }
        }else{
          if(i === player){
            deals[i] = deals[i] + pObj.all*3;
          }else{
            deals[i] = deals[i] - pObj.all;
          }
        }
      }
    }
    return deals;
  }
  var getPoint = function(yakuList,stack,fu,han){
    // 上がりプレイヤー
    var player = stack.player;
    // おや
    var oya    = App.Ba.view.getOya();
    // 上がりプレイヤーがおやかどうか
    var isOya  = false;
    if(oya === player){ isOya = true };
    // ツモ上がりかどうか
    var isTsumo  = stack.params.tsumo;
    // 放銃プレイヤー
    var hojuP  = false;
    if(!isTsumo){ hojuP = stack.params.discardPlayer };
    // 得点オブジェクト
    var pObj   = getMangan(han,isOya);
    if(!pObj){ pObj = getNotMangan(fu,han,isOya) };
    return createDeals(player,oya,isOya,isTsumo,hojuP,pObj);
  }
  return {
    getPoint : getPoint
  }
})();

// MEMO
/*
（不確定系）
平和系
タンヤオ系
３色同順系
染め手
チャンタ系
（１飜役）
平和（順子×４＋頭）
タンヤオ（１９字牌なし）
（２飜役）
トイトイ
３色同順
３色同刻
一気通貫
混老頭
チャンタ
小三元
三槓子
（３飜役）
ホンイツ
純ちゃん
（５飜役）
清一色
*/
