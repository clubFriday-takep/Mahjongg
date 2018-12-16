App.Ai = (function(){
  var AI = function(obj){
    var obj        = obj || {};
    this.group     = {};
    this.syantens  = [];
    this.agaries   = [];
    this.player    = obj.player;
    this.nakiwaits = [];
    this.modpath   = {
      handler     : 'Handler',
      taikyokukan : 'Taikyokukan',
      koritsu     : 'Koritsu',
      reach       : 'Reach',
      naki        : 'Naki',
      kitai       : 'Kitai'
    };
    this.modparam = {
      handler : {},
      taikyokukan : {},
      koritsu : {},
      kitai   : {
        ai : this
      }
    };
    this.modules   = {
      handler     : null,
      taikyokukan : null,
      koritsu     : null,
      kitai       : null,
      paikoritsu  : null,
      tempai      : null,
      yomi        : null
    };
    this.importModules();
  }
  // TEST
  AI.prototype.showTiles = function(){
    var str = '';
    for(var i=0;i<this.player.tehai.length;i++){
      var tile = this.player.tehai[i];
      str = str + ' ' + tile.name;
    }
    Logger.debug('Player' + this.player.playerNum + ' の手牌  : ' + str);
  }
  AI.prototype.start = function(){

  }
  AI.prototype.classfyTiles = function(){
    this.splitGroups();
    this.howSyanten();
  }
  AI.prototype.da = function(){
    this.splitGroups();
    this.howSyanten();
    return this.modules.handler.da();
  }
  // ツモかどうかの判定処理
  AI.prototype.isTsumo = function(tile){
    return this.modules.reach.isWait(tile);
  }
  // ロンかどうかの判定処理
  AI.prototype.isRon = function(tile,stack){
    return this.modules.reach.isWait(tile);
  }
  AI.prototype.getNakiTiles = function(tile,type){
    for(var i=0;i<this.nakiwaits.length;i++){
      var nakiwait = this.nakiwaits[i];
      var isMatch = nakiwait.isMatchByQuery({
        id : tile.id,
        type : type
      })
      if(isMatch){
        this.player.tehaiToNaki(nakiwait.color,nakiwait.tiles,tile);
      }
    }
  }
  // メモ：ユーザ鳴き処理
  AI.prototype.makeNakiPatternAll = function(){
    this.splitGroups();
    this.modules.naki.makeNakiPatternAll(this.group);
  }
  AI.prototype.getNakiPattens = function(tile,stack){
    return this.modules.naki.getNakiPattens(tile,stack);
  }
  AI.prototype.setNaki = function(waits){
    this.nakiwaits = waits;
    var playerNum = this.player.playerNum;
    var ponkanflg = false;
    var chiflg    = false;
    for(var i=0;i<waits.length;i++){
      var wait = waits[i];
      if(wait.type === 0){
        ponkanflg = true;
      }else if(wait.type === 1){
        chiflg = true;
      }
    }
    App.Ba.view.setNaki(playerNum,ponkanflg,chiflg)
  }
  AI.prototype.isNaki = function(tileId,type){
    for(var i=0;i<this.nakiwaits.length;i++){
      var wait = this.nakiwaits[i];
      if(wait.id === tileId && wait.type === type){
        return true;
      }
    }
    return false;
  }
  AI.prototype.splitGroups = function(){
    var splitedGroup = new SG();
        splitedGroup.setTehai(this.player.tehai);
    this.group = splitedGroup;
  }
  AI.prototype.howSyanten = function(){
    this.showTiles();
    classByAnko(this.group);
  	classBySyuntsu(this.group);
  	classByToitsu(this.group);
  	classByTatsu(this.group);
    this.countTempaiNum();
  	// 上位X位に絞る
  	//filteredSyanten(group);
  }
  AI.prototype.countTempaiNum = function(ranks){
    var filnum   = ranks || 8;
    var filtered = [];
    var syantens = [[],[],[],[],[],[],[],[],[]];
    var agaries  = [];
    var nnum     = this.player.naki.length;
    for(var i=0;i<this.group.classes.length;i++){
			var cls  = this.group.classes[i];
      var scnt = 8 - cls.anum*2 - cls.snum*2 - nnum*2;
      // 面子過多？
			if(cls.tnum + cls.rnum + cls.knum + cls.pnum > 3){
				// 雀頭あり
				if(cls.tnum > 0){
					scnt = scnt - 3;
				}else{
					scnt = scnt - 2;
				}
			}else{
				scnt = scnt - cls.tnum - cls.rnum - cls.knum - cls.pnum;
			}
			cls.scnt = scnt;
			// 本当にリーチOR上がりか？
			if(scnt < 1){
				if(cls.tnum === 0 && ((cls.anum + cls.snum + nnum) === 4) && (cls.rnum + cls.knum + cls.pnum) === 1){
					scnt = 8; //排除
					cls.scnt = scnt;
				}else if(cls.tnum === 0 && ((cls.anum + cls.snum + nnum) === 3) && (cls.rnum + cls.knum + cls.pnum) === 2){
					scnt = 8; //排除
					cls.scnt = scnt;
				}
			}
      if(scnt >= 0){
        syantens[scnt].push(cls);
      }else{
        agaries.push(cls);
        Logger.debug(['上がりの可能性あり',cls,this.syantens])
      }
    }
    this.syantens = syantens;
    this.agaries  = agaries;
  }
  AI.prototype.filterSyantens = function(num){
    var num = num || 1;
    var cnt = 0;
    var rs  = [];
    for(var i=0;i<this.syantens.length;i++){
      if(cnt < num){
        var g = this.syantens[i];
        if(g.length > 0){
          for(var j=0;j<g.length;j++){
            rs.push( $.extend(true,{},g[j]) );
          }
          cnt++;
        }
      }
    }
    return rs;
  }
  // AIモジュール群をインポートする
  AI.prototype.importModules  = function(){
    // 設定ファイルの読み込み処理
    var pname  = 'player' + this.playerNum;
    var keys = Object.keys(this.modpath);
    for(var i=0;i<keys.length;i++){
      var key      = keys[i];
      var defflg   = Settings.AI[pname] || false;
      var modpath  = Settings.AI.default[key].path  || this.modpath[key];
      var modparam = Settings.AI.default[key].param || this.modparam[key];
      if(defflg){
        modpath = Settings.AI[pname][key].path || modpath;
      }
      this.modules[key] = new App.Ai[modpath](modparam);
      this.modules[key].root    = this;
      this.modules[key].modules = this.modules;
    }
  }

  // モジュール内共通関数
  // 牌種別文字列（mpsj）⇔牌種別番地（0123）変換処理
  var getCadd = function(color){
  	switch (color) {
  		case 'm':
  			return 0;
  		case 'p':
  			return 1;
  		case 's':
  			return 2;
  		case 'j':
  			return 3;
  	}
  }
  var getCcd = function(add){
  	switch (add) {
  		case 0:
  			return 'm';
  		case 1:
  			return 'p';
  		case 2:
  			return 's';
  		case 3:
  			return 'j';
  	}
  }

  // Classオブジェクト
  var Classfy = function(){
		this.m  = []; // 例）[[1,1,1],[2,2],[3,4,5],[6,7,8],[9,9,9]] : ちゅーれんの場合
		this.p  = [];
		this.s  = [];
		this.j  = [];
		this.work = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0]
		];
		this.scnt = 8;
		this.anum = 0; // 暗刻数
		this.snum = 0; // 順子数
		this.tnum = 0; // 対子数
		this.rnum = 0; // 両面塔子数
		this.knum = 0; // 間張塔子数
		this.pnum = 0; // 辺張塔子数
	}
  // 牌の組み合わせをセットする関数群
	Classfy.prototype.isSetTiles = function(num,ary){
		var colors = $.extend(true,[],this.work[num]);
		var flg = true;
		for(var i=0;i<ary.length;i++){
			var arynum = ary[i];
			colors[arynum]--;
			if(colors[arynum] < 0){ flg = false };
		}
		return flg;
	}
	Classfy.prototype.setTiles = function(num,ary){  // 例）0, [1,1]： 萬子の２萬２枚をセット
		var newary  = [];
		for(var m=0;m<ary.length;m++){
			this.work[num][ary[m]]--;
			newary.push(ary[m] + 1);
		}
		switch (num) {
			case 0:
				this.m.push(newary);
				break;
			case 1:
				this.p.push(newary);
				break;
			case 2:
				this.s.push(newary);
				break;
			case 3:
				this.j.push(newary);
				break;
		}
	}
	Classfy.prototype.copyClass = function(){
		return $.extend(true,{},this);
	}
	// 暗刻候補数を返却（０～４）
	Classfy.prototype.getAnkoNum = function(){
		var counter = 0;
		for(var ank=0;ank<4;ank++){
			var mps = this.work[ank];
			for(var ankj=0;ankj<mps.length;ankj++){
				if(this.work[ank][ankj] > 2){
					counter++;
				}
			}
		}
		return counter;
	}
	// 対子候補数を返却（０～７）
	Classfy.prototype.getToitsuNum = function(){
		var counter = 0;
		for(var ank=0;ank<4;ank++){
			var mps = this.work[ank];
			for(var ankj=0;ankj<mps.length;ankj++){
				if(this.work[ank][ankj] > 1){
					counter++;
				}
			}
		}
		return counter;
	}
	// 牌のグルーピング情報を返却　対子数、暗刻数、順子数、塔子数、残牌数
	Classfy.prototype.getClassedNum = function(){
		var cnmap = ['m','p','s','j'];
		var cnEval = function(ary){
			var cnlen = ary.length;
			var toi   = true;
			if(ary[0] !== ary[1]){ toi = false };
			if( (cnlen > 2) && toi  ){ return 'anko' };
			if( (cnlen > 2) && !toi ){ return 'syuntsu' };
			if( (cnlen < 3) && toi  ){ return 'toitsu' };
			if( (cnlen < 3) && !toi ){ return 'tatsu' };
		}
		var classedNum = {
			toitsu:0, anko:0, syuntsu:0, tatsu:0, last:0, sublast : {
				m:0,p:0,s:0,j:0
			}
		}
		for(var cn=0;cn<4;cn++){
			var cnary = this[cnmap[cn]];
			for(var cna=0;cna<cnary.length;cna++){
				var cntype = cnEval(cnary[cna]);
				classedNum[cntype]++;
			}
		}
		for(var cw=0;cw<4;cw++){
			var cwk   = this.work[cw];
			var color = cnmap[cw];
			for(var cs=0;cs<9;cs++){
				classedNum.last += cwk[cs];
				classedNum.sublast[color] += cwk[cs];
			}
		}
		return classedNum;
	}

  // Groupオブジェクト
	var SG = function(){
		var obj = obj || {}
		this.Classfy = Classfy;
		this.tiles   = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0]
		];
		this.chitoi  = false;
		this.kokushi = false;
		this.classes = [];
		this.points   = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0]
		];
		this.discards = [];
	}
	SG.prototype.setTehai = function(tehai){
		var gmap = {m:0,p:1,s:2,j:3}
		for(var i=0;i<tehai.length;i++){
			var tile = tehai[i];
			var tg   = tile.group;
			this.tiles[gmap[tg]][tile.num-1]++;
		}
	}
	SG.prototype.createClass = function(){
		var cls = new this.Classfy();
		cls.work = $.extend(true,[],this.tiles);
		return cls;
	}
	SG.prototype.initPoints  = function(){
		this.points = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0]
		];
	}
	SG.prototype.setPoint   = function(cadd,tileadd,point){
		this.points[cadd][tileadd] = this.points[cadd][tileadd] + point;
	}

  /*
   * 暗刻の振り分け関数群
   */
  // Groupオブジェクト関連メソッド
  // 暗刻数によるパターン分けを実施するサブルーチン
	var selectAPattern = function(mother,child){
		if( (mother===0) || (child===0) ){ return [] };
		mother--;child--;
		var selmap = [ // エグイ実装
			// 1
			[
				[[0]] // 1C1
			],
			[
				[[0],[1]], // 2C1
				[[0,1]] // 2C2
			],
			[
				[[0],[1],[2]], // 3C1
				[[0,1],[0,2],[1,2]], // 3C2
				[[0,1,2]] // 3C3
			],
			[ // 4
				[[0],[1],[2],[3]], // 4C1
				[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]], //4C2
				[[0,1,2],[0,1,3],[0,2,3],[1,2,3]]
			]
		]
		return selmap[mother][child];
	}
  // 暗刻によるクラス分け
  var classByAnko = function(group){
		if(group.classes.length===0){
			group.classes.push(group.createClass());
		}
		var newclsary = [];
		for(var i=0;i<group.classes.length;i++){
			var cls = group.classes[i];
			var anknum = cls.getAnkoNum();
			// 暗刻数分のループ
			for(var j=1;j<anknum + 1;j++){
				var selary = selectAPattern(anknum,j);
				// 使用する暗刻の組み合わせ分のループ
				for(var k=0;k<selary.length;k++){
					var selsubary = selary[k];
					var copiedcls = $.extend(true,{},cls);
					var selsubcnt = 0;
					for(var l=0;l<4;l++){
						var tiles = cls.work[l];
						for(var m=0;m<9;m++){
							var tileNum = tiles[m];
							if(tileNum > 2){
								var flg = selsubary.indexOf(selsubcnt)
								if(flg !== -1){
									copiedcls.setTiles(l,[m,m,m]);
									copiedcls.anum++;
								}
								selsubcnt++;
							}
						}
					}
					newclsary.push(copiedcls);
				}
			}
		}
		for(var i=0;i<newclsary.length;i++){
			group.classes.push(newclsary[i])
		}
	}

  /*
   * 順子の振り分け関数群
   */
  // 順子数によるパターン分けを実施するサブルーチン
	var selectSPatterns = function(workary,clnum,mnum,pnum,snum){
		if( mnum===0 && pnum===0 && snum===0 ){ return false; }
		if( mnum*3 > clnum.m){ return false; }
		if( pnum*3 > clnum.p){ return false; }
		if( snum*3 > clnum.s){ return false; }
		var rs = {
			m : [],
			p : [],
			s : [],
		};
		if(mnum>0){selectSSubPatterns(rs,workary[0],mnum-1,'m')};
		if(pnum>0){selectSSubPatterns(rs,workary[1],pnum-1,'p')};
		if(snum>0){selectSSubPatterns(rs,workary[2],snum-1,'s')};
		// 組み合わせ不正の場合、Falseを返却
		if(mnum > 0 && rs.m.length===0){return false;}
		if(pnum > 0 && rs.p.length===0){return false;}
		if(snum > 0 && rs.s.length===0){return false;}
		//if(rs.m.length===0&&rs.p.length===0&&rs.s.length===0){return false;}
		return rs;
	};
	// 順子数によるパターン分けを実施するサブルーチン2
	// 組み合わせを返却する処理（全パターン）INPUT:各配列のMAX値
	var getSpatternAll = function(beforeary){
		var rs = [];
		var sfunc = function(wkary,maxnum){
			var nextary = [];
			if(wkary.length === 0){
				for(var t1=0;t1<maxnum;t1++){
					forpush = [t1]
					nextary.push(forpush)
				}
			}else{
				for(var t1=0;t1<wkary.length;t1++){
					for(var t2=0;t2<maxnum;t2++){
						var twk = $.extend(true,[],wkary[t1])
						twk.push(t2)
						nextary.push(twk);
					}
				}
			}
			return nextary;
		}
		for(var gs=0;gs<beforeary.length;gs++){
			if(beforeary[gs]>0){
				rs = sfunc(rs,beforeary[gs]);
			}
		}
		return rs;
	}
  // 組み合わせを返却する処理（Base）
	var spattern1 = false, spattern2 = false, spattern3 = false, spattern4 = false;
	var initSpattern = function(){spattern1 = false, spattern2 = false, spattern3 = false, spattern4 = false;}
	var getSpattern123 = function(pnum,max){
		var maxnum = max || 7;
		var sfunc = function(bary,start){
			var afterary = [];
			if(start === 0){
				for(var t1=0;t1<maxnum;t1++){
					forpush = [t1]
					afterary.push(forpush)
				}
			}else{
				for(var t1=0;t1<bary.length;t1++){
					for(var t2=bary[t1][start-1];t2<maxnum;t2++){
						var twk = $.extend(true,[],bary[t1]);
						twk.push(t2)
						afterary.push(twk);
					}
				}
			}
			return afterary;
		}
		if(pnum < 4){ if(!spattern1){ spattern1 = sfunc([],0) } };
		if(pnum < 4 && pnum > 0){ if(!spattern2){ spattern2 = sfunc(spattern1,1) } };
		if(pnum < 4 && pnum > 1){ if(!spattern3){ spattern3 = sfunc(spattern2,2) } };
		if(pnum === 3){ if(!spattern4){ spattern4 = sfunc(spattern3,3) } };
		if(pnum === 0){ return spattern1 };
		if(pnum === 1){ return spattern2 };
		if(pnum === 2){ return spattern3 };
		if(pnum === 3){ return spattern4 };
		return false;
	}
	var selectSSubPatterns = function(rs,colorary,roop,color){
		var minusTiles = function(spattern,cpcolorInroop){
			var minusTile0 = spattern[0];
			var minusTile1 = spattern[1];
			var minusTile2 = spattern[2];
			if( cpcolor[minusTile0] > 0 && cpcolor[minusTile1] > 0 && cpcolor[minusTile2] > 0){
				cpcolor[minusTile0]--;cpcolor[minusTile1]--;cpcolor[minusTile2]--;
				return true;
			}else{
				return false;
			}
		}
		var spatterns = [
			[0,1,2],[1,2,3],[2,3,4],[3,4,5],[4,5,6],[5,6,7],[6,7,8]
		];
		var maxsptns = getSpattern123(roop);
		for(var sp1=0;sp1<maxsptns.length;sp1++){
			var cpcolor    = $.extend(true,{},colorary);
			var forpushary = [];
			var partsptns  = maxsptns[sp1];
			var sptnsflg  = true;
			for(var sp2=0;sp2<partsptns.length;sp2++){
				var forpushp = spatterns[partsptns[sp2]];
				var sptnsflg = minusTiles(forpushp,cpcolor);
				if(sptnsflg){
					forpushary.push(forpushp)
				}else{
					sp2 = partsptns.length;
				};
			}
			if(sptnsflg){
				rs[color].push(forpushary);
			}
		}
	}
	// 順子数によるパターン分けを実施するメイン処理 TODO BUGFIX
	var classBySyuntsu = function(group){
		initSpattern()
		var newclsary = [];
		for(var i=0;i<group.classes.length;i++){
			var cls = group.classes[i];
			var clnum = cls.getClassedNum();
			var max   = Math.round( (clnum.last - clnum.last%3) / 3 ); // 最大順子数
			// 順子の組み合わせ数分のループ
			for(var j=0;j<max+1;j++){
				for(var k=0;k<max-j+1;k++){
					for(var l=0;l<max-j-k+1;l++){
						var sptns = selectSPatterns(cls.work,clnum.sublast,j,k,l);
						if(sptns){
							// 色内の組み合わせパターンごとにクラス配列を増殖する内部関数
							var colorLoop = function(clsary,colorAdd,colorary){
								var nextclsary = [];
								// クラス配列分の繰り返し
								for(var m=0;m<clsary.length;m++){
									var clsarywk = clsary[m];
									// 色配列分の繰り返し
									for(var n=0;n<colorary.length;n++){
										var newcls = $.extend(true,{},clsarywk);
										for(var o=0;o<colorary[n].length;o++){
											newcls.setTiles(colorAdd,colorary[n][o]);
											newcls.snum++;
										}
										nextclsary.push(newcls);
									}
								}
								return nextclsary;
							}
							var cpptns = [$.extend(true,{},cls)];
							var spkeys = Object.keys(sptns);
							// 色ごとのループ
							for(var p=0;p<spkeys.length;p++){
								var spkey    = spkeys[p];
								var colorAdd = getCadd(spkey);
								var colorary = sptns[spkey];
								if(colorary.length > 0){
									cpptns = colorLoop(cpptns,colorAdd,colorary);
								}
							}
							for(var p=0;p<cpptns.length;p++){
								newclsary.push(cpptns[p]);
							}
						}
					}
				}
			}
		}
		// 生成した新ClassをGroupオブジェクトに詰め込む
		for(var i=0;i<newclsary.length;i++){
			group.classes.push(newclsary[i]);
		}
	}

  /*
   * 対子の振り分け関数群
   */
  // 対子数によるパターン分けを実施するサブ処理（色内で取りうる組み合わせを返却）
  var classToitsuPattern = function(colorary){
    var rs = [];
    for(var ttp=0;ttp<colorary.length;ttp++){
      if(colorary[ttp]>1){
        rs.push([ttp,ttp])
      }
    }
    return rs;
  }
  // 対子数によるパターン分けを実施するサブ処理（getSpattern123から同じ対子組み合わせを排除）
  var filterSameNumAry = function(groupary){
    var rs = [];
    for(var ga=0;ga<groupary.length;ga++){
      var before = null;
      var gaflg  = true;
      var secga  = groupary[ga];
      for(var ga1=0;ga1<secga.length;ga1++){
        if(ga1>0){
          if(before === secga[ga1]){
            gaflg = false;
          }
        }
        before = secga[ga1]
      }
      if(gaflg){
        rs.push(secga);
      }
    }
    return rs;
  }
  // 対子数によるパターン分けを実施するメイン処理
  var classByToitsu = function(group){
    var newclsary = [];
    for(var i=0;i<group.classes.length;i++){
      var cls = group.classes[i];
      // 対子patterns
      var mtp = classToitsuPattern(cls.work[0]);
      var ptp = classToitsuPattern(cls.work[1]);
      var stp = classToitsuPattern(cls.work[2]);
      var jtp = classToitsuPattern(cls.work[3]);
      var max = 4;
      for(var j=0;j<max;j++){
        for(var k=0;k<max-j;k++){
          for(var l=0;l<max-j-k;l++){
            for(var m=0;m<max-j-k-l;m++){
              if(mtp.length >= j && ptp.length >= k && stp.length >= l && jtp.length >= m && !(j===0&&k===0&&l===0&&m===0) ){
                // 組み合わせ番地変数群
                var banchicnt = 1, mbanchi = false, pbanchi = false, sbanchi = false, jbanchi = false;
                // 萬子処理
                initSpattern();
                var msptn = getSpattern123(j-1,mtp.length);
                    msptn = filterSameNumAry(msptn);
                var mlen  = 0;
                if(msptn.length !==0){ mlen = msptn.length; mbanchi = banchicnt; banchicnt++; }
                // 筒子処理
                initSpattern();
                var psptn = getSpattern123(k-1,ptp.length);
                    psptn = filterSameNumAry(psptn);
                var plen  = 0;
                if(psptn.length !==0){ plen = psptn.length; pbanchi = banchicnt; banchicnt++; }
                // 索子処理
                initSpattern();
                var ssptn = getSpattern123(l-1,stp.length);
                    ssptn = filterSameNumAry(ssptn);
                var slen  = 0;
                if(ssptn.length !==0){ slen = ssptn.length; sbanchi = banchicnt; banchicnt++; }
                // 自牌処理
                initSpattern();
                var jsptn = getSpattern123(m-1,jtp.length);
                    jsptn = filterSameNumAry(jsptn);
                var jlen  = 0;
                if(jsptn.length !==0){ jlen = jsptn.length; jbanchi = banchicnt; banchicnt++; }
                var kumiawase = getSpatternAll([mlen,plen,slen,jlen]); // 萬子筒子索子自牌の組み合わせ
                for(var n=0;n<kumiawase.length;n++){
                  var cpcls = $.extend(true,{},cls);
                  var pushflg = false;
                  if(mlen !== 0){
                    for(var o=0;o<msptn[kumiawase[n][mbanchi-1]].length;o++){
                      var colortile = mtp[msptn[kumiawase[n][mbanchi-1]][o]];
                      pushflg = true;
                      cpcls.setTiles(0,colortile);
                      cpcls.tnum++;
                    }
                  }
                  if(plen !== 0){
                    for(var o=0;o<psptn[kumiawase[n][pbanchi-1]].length;o++){
                      var colortile = ptp[psptn[kumiawase[n][pbanchi-1]][o]];
                      pushflg = true;
                      cpcls.setTiles(1,colortile);
                      cpcls.tnum++;
                    }
                  }
                  if(slen !== 0){
                    for(var o=0;o<ssptn[kumiawase[n][sbanchi-1]].length;o++){
                      var colortile = stp[ssptn[kumiawase[n][sbanchi-1]][o]];
                      pushflg = true;
                      cpcls.setTiles(2,colortile);
                      cpcls.tnum++;
                    }
                  }
                  if(jlen !== 0){
                    for(var o=0;o<jsptn[kumiawase[n][jbanchi-1]].length;o++){
                      var colortile = jtp[jsptn[kumiawase[n][jbanchi-1]][o]];
                      pushflg = true;
                      cpcls.setTiles(3,colortile);
                      cpcls.tnum++;
                    }
                  }
                  if(pushflg){ newclsary.push(cpcls) };
                }
              }
            }
          }
        }
      }
    }
    // 生成した新ClassをGroupオブジェクトに詰め込む
    for(var i=0;i<newclsary.length;i++){
      group.classes.push(newclsary[i]);
    }
  }

  /*
   * 塔子の振り分け関数群
   */
   // 塔子数によるパターン分けを実施するサブ処理（Workの牌種別数からの組み合わせパターンの決定）
 	var tatsuPattern = [ [0,1],[0,2],[1,2],[1,3],[2,3],[2,4],[3,4],[3,5],[4,5],[4,6],[5,6],[5,7],[6,7],[6,8],[7,8] ]
 	var classTatsuPattern = function(colorary){
 		var rs = [];
 		for(var ctp=0;ctp<tatsuPattern.length;ctp++){
 			var ctpx = tatsuPattern[ctp];
 			if( (colorary[ctpx[0]] > 0) && (colorary[ctpx[1]] > 0) ){
 				rs.push([ctpx[0],ctpx[1]])
 			}
 		}
 		return rs;
 	}
 	//  塔子数によるパターン分けを実施するサブ処理（各色の牌を引き当てる処理）
 	var drawTatsu = function(cpcls,kumiawaseBanchi,msptn,mtp,color){
 		// mtpから選ぶ
 		for(var dt=0;dt<msptn[kumiawaseBanchi].length;dt++){
 			var setary = mtp[msptn[kumiawaseBanchi][dt]];
 			// 両面・間張・辺張の判定
 			var setaryptn = null;
 			var dtpwork;
 			for(var dtp=0;dtp<setary.length;dtp++){
 				if(dtp>0){
 					if(dtpwork + 1 === setary[dtp] && setary[dtp] !== 8 && setary[dtp] !== 1){
 						dtpwork = 'rnum';
 					}else if(dtpwork + 2 === setary[dtp]){
 						dtpwork = 'knum';
 					}else{
 						dtpwork = 'pnum';
 					}
 				}else{
 					dtpwork = setary[dtp];
 				}
 			}
 			var setflg = cpcls.isSetTiles(color,setary);
 			if(setflg){
 				cpcls.setTiles(color,setary);
 				cpcls[dtpwork]++;
 			}else{
 				return false;
 			}
 		}
 		return cpcls;
 	}
 	// 塔子数によるパターン分けを実施するメイン処理
 	var classByTatsu = function(group){
 		var newclsary = [];
 		for(var i=0;i<group.classes.length;i++){
 			var cls = group.classes[i];
 			// 塔子patterns
 			var mtp = classTatsuPattern(cls.work[0]);
 			var ptp = classTatsuPattern(cls.work[1]);
 			var stp = classTatsuPattern(cls.work[2]);
 			var clnum = cls.getClassedNum();
 			// 最大塔子数（性能を考慮して数を制約）
 			var max   = 5 - clnum.anko - clnum.syuntsu - clnum.toitsu;
 			if(max > 4){ max = 4 };
 			for(var j=0;j<max+1;j++){
 				for(var k=0;k<max-j+1;k++){
 					for(var l=0;l<max-j-k+1;l++){
 						if(mtp.length >= j && ptp.length >= k && stp.length >= l && !(j===0&&k===0&&l===0) ){
 							// 組み合わせ番地変数群
 							var banchicnt = 1, mbanchi = false, pbanchi = false, sbanchi = false;
 							// 萬子処理
 							initSpattern();
 							var msptn = getSpattern123(j-1,mtp.length);
 							var mlen  = 0;
 							if(msptn){ mlen = msptn.length; mbanchi = banchicnt; banchicnt++; }
 							// 筒子処理
 							initSpattern();
 							var psptn = getSpattern123(k-1,ptp.length);
 							var plen  = 0;
 							if(psptn){ plen = psptn.length; pbanchi = banchicnt; banchicnt++; }
 							// 索子処理
 							initSpattern();
 							var ssptn = getSpattern123(l-1,stp.length);
 							var slen  = 0;
 							if(ssptn){ slen = ssptn.length; sbanchi = banchicnt; banchicnt++; }
 							//if((mlen + plen + slen) < 1000){ // 性能対策
 								var kumiawase = getSpatternAll([mlen,plen,slen]); // 萬子筒子索子の組み合わせ
 								for(var m=0;m<kumiawase.length;m++){
 									var cpcls = $.extend(true,{},cls);
 									if(mbanchi && cpcls){ // TODO
 										cpcls = drawTatsu(cpcls,kumiawase[m][mbanchi-1],msptn,mtp,0)
 									}
 									if(pbanchi && cpcls){
 										cpcls = drawTatsu(cpcls,kumiawase[m][pbanchi-1],psptn,ptp,1)
 									}
 									if(sbanchi && cpcls){
 										cpcls = drawTatsu(cpcls,kumiawase[m][sbanchi-1],ssptn,stp,2)
 									}
 								}
 								if(cpcls){newclsary.push(cpcls)}
 							//} // 性能対策End
 						}
 					}
 				}
 			}
 		}
 		// 生成した新ClassをGroupオブジェクトに詰め込む
 		for(var i=0;i<newclsary.length;i++){
 			group.classes.push(newclsary[i]);
 		}
 	}

  var create = function(obj){
    return new AI(obj)
  }
  return {
    create : create
  }
})();
