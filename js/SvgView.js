SvgView = (function(){
	var menuIds  = {
		ai : '#menuAi',
		agari : '#menuAgari',
		reach : '#menuReach',
		pon : '#menuPon',
		chi : '#menuChi',
		can : '#menuCan',
		next : '#menuNext',
		cancel : '#menuCancel'
	}
	var menuOnOffMap = {
		da : ['ai'],
		agari : ['agari','cancel'],
		reach : ['reach'],
		pon : ['pon','cancel'],
		chi : ['chi','cancel'],
		next : ['next']
	}
	var doMenuOnOff = function(types){
		var types = types || [];
		var onOffMap = {};
		var menuAry  = Object.keys(menuIds);
		for(var i=0;i<menuAry.length;i++){
			var menukey = menuAry[i];
			onOffMap[menukey] = false;
		}
		for(var i=0;i<types.length;i++){
			var type = types[i];
			var ids  = menuOnOffMap[type];
			for(var j=0;j<ids.length;j++){
				onOffMap[ids[j]] = true;
			}
		}
		for(var i=0;i<menuAry.length;i++){
			var menukey = menuAry[i];
			if(onOffMap[menukey]){
				$(menuIds[menukey]).removeClass('disabled');
			}else{
				$(menuIds[menukey]).addClass('disabled');
			}
		}
	}
	var SVGEvent = function(obj){
		var obj = obj || {};
		this.selector = obj.selector || '';
		this.trigger  = obj.trigger  || 'click';
		this.func     = obj.func     || function(){};
		this.param    = obj.param    || {};
	}
	var SVGView = function(obj){
		var obj = obj || {};
		this.selector = obj.selector || '#mysvg';
		this.events   = [];
		this.h        = obj.h        || 400; //デフォルトのSVGの高さ
		this.w        = obj.w        || 600; //デフォルトのSVGの幅
		this.ba       = obj.ba       || {}; //場オブジェクトの参照
		this.svg      = ''; //SVGオブジェクトの参照
		this.tileUH   = 45; //ユーザの牌の高さ
		this.tileUW   = 30; //ユーザの牌の広さ
		this.tileOH   = 36; //相手の牌の高さ
		this.tileOW   = 24; //相手の牌の広さ
		this.tileKH   = 36; //河の牌の高さ
		this.tileKW   = 24; //河の牌の広さ
		return this;
	}
	// SVGオブジェクトの初期化処理（描画もする）
	SVGView.prototype.init = function(){
		$(this.selector).html('');
		this.setSize();
		this.createSvg();
		this.render();
		return this;
	}
	// SVGの再描画処理
	SVGView.prototype.rerender = function(){
		$('#mysvg svg').html('');
		this.render();
	}
	// SVGのサイズ決定処理
	// ブラウザの表示領域に合わせて決定
	SVGView.prototype.setSize = function(){
		this.h = $(this.selector).height();
		this.w = $(this.selector).width();
	}
	// SVGの表示領域の決定
	SVGView.prototype.createSvg = function(){
		this.svg = d3.select(this.selector)
						.append('svg')
						.attr('width', this.w)
						.attr('height', this.h);
	}
	// 色ぬりぬり共通関数
	SVGView.prototype.fill = function(d,i){
		var color = 'white';
		// リーチの場合赤く染める
		if(d.reach){
			color = 'red';
		}
		return color;
	}
	// 色ぬりしたオブジェクトの透過度を決定する関数
	SVGView.prototype.fillOpacity = function(d,i){
		if(d.reach){
			return '0.5';
		}else{
			return '0.0';
		}
	}
	// 描画処理
	SVGView.prototype.render = function(){
		var that = this;
		// 手牌の初期位置計算
		// User Width
		var tbstart   = Math.round( (that.w - (that.tileUW*12) ) / 2 ) - (that.tileUW * 2);
		// Top Width
		var tbstartT  = Math.round( (that.w - (that.tileOW*12) ) / 2 );
		// Right and Left Height
		var tbstartRL = Math.round( (that.h - (that.tileOW*12) ) / 2 );
		// 鳴きの初期位置（一番右側）計算
		// TOP
		var nkendR  = Math.round( that.w - 100 );
		var nkendCR = 30;
		// 河の初期位置計算
		// User Width and Height
		var kustartx  = Math.round( (that.w - (that.tileUW*6) ) / 2 );
		var kustarty  = Math.round( (that.h - (that.h*1/4) - that.tileUH - that.tileKH ) );
		// Top Height
		var kTstarty  = Math.round( (that.h*1/4) - that.tileKH/2 + that.tileKH/2);
		// Left width
		var kLstartx = Math.round( that.tileKH*3 );
		// Right width
		var kRstartx = Math.round( that.w - that.tileKH*6 );
		// Right and Left Height
		var kRLstarty =  Math.round( (that.h - (that.tileKW*6) ) / 2 );
		// ドラ表示の初期位置計算
		var doranum = that.ba.dorashow.length;
		//var dshowH  = Math.round(that.h/2 - (that.tileKH/2));
		var dshowH  = Math.round(that.h/2);
		var dshowW  = Math.round(that.w/2 - (7*that.tileKW/2));
		// 場情報の初期位置計算
		// Ba Tile
		var bafontsize = 16;
		// TopHeight
		var fontsize = 10;
		var fontfamily = 'Franklin Gothic Medium';
		var pointbarlen = that.tileOW*12;
		// Player0,2 Left
		var pointbartl = Math.round(that.w/2 - pointbarlen/2)
		// player1 Top
		var pointbarlt = Math.round(that.tileOH*4 - that.tileOH/2)
		// player1 Left
		var pointbarll = Math.round(that.tileOW*4 - 10)
		// player2 top
		var pointbarbt = Math.round(that.h - that.tileUH*2)
		// player3 left
		var pointbarrl = Math.round(that.w - that.tileOW*2)
		// player3 top
		var pointbarrt = Math.round(that.h - that.tileOW*2)
		var pointty  = 20 + this.tileOH + 20;
		// 風表示
		var kazemap = { j1:'東',j2:'南',j3:'西',j4:'北'};
		var p0kaze  = kazemap[that.ba.getJikaze(0)];
		var p1kaze  = kazemap[that.ba.getJikaze(1)];
		var p2kaze  = kazemap[that.ba.getJikaze(2)];
		var p3kaze  = kazemap[that.ba.getJikaze(3)];
		var p0name  = 'たけだ さん';
		var p1name  = 'まちだ さん';
		var p2name  = 'たけむら さん';
		var p3name  = 'にしゆき さん';
		// 場・局の描画
		this.svg.append('g')
						.attr('class','baTiles')
						.append('rect')
						.attr('x',that.w/2 - bafontsize*6/2)
						.attr('y',that.h/2 - bafontsize*2/2 - that.tileOH/2 - 5)
						.attr('width',bafontsize*6)
						.attr('height',bafontsize*2)
						.attr('fill','#2f4f4f')
		this.svg.append('g')
						.attr('class','baText')
						.append('text')
						.attr('x',that.w/2 - bafontsize*6/2 + 5)
						.attr('y',that.h/2 - bafontsize*2/2 - 2)
						.text('　' + kazemap[that.ba.getBakaze()] + '：' + that.ba.stack.state.kyoku%4 + '局')
						.attr('fill','white')
						.attr('font-family',fontfamily)
						.attr('font-size',bafontsize)
		// 得点の描画
		// Player0
		this.svg.append('g')
						.attr('class','pointTiles')
						.append('rect')
						.attr('x',0)
						.attr('y',0)
						.attr('width',pointbarlen)
						.attr('height',fontsize*2)
						.attr('fill','#2f4f4f')
						.attr("transform","rotate("+180+")" + " translate(" + (-pointbartl-pointbarlen) + "," + (-pointty-fontsize/2) + ")")
		this.svg.append('g')
						.attr('class','pointText')
						.append('text')
						.attr('x',0)
						.attr('y',0)
						.text( '　' + p0kaze + '　　' + p0name + '　' + '得点：'　+ that.ba.points[0])
						.attr('fill','white')
						.attr('font-family',fontfamily)
						.attr("transform","rotate("+180+")" + " translate(" + (-pointbartl-pointbarlen) + "," + (-pointty+fontsize) + ")")
		// Player1
		this.svg.append('g')
						.attr('class','pointTiles')
						.append('rect')
						.attr('x',0)
						.attr('y',0)
						.attr('width',pointbarlen)
						.attr('height',fontsize*2)
						.attr('fill','#2f4f4f')
						.attr("transform","rotate("+90+")" + " translate(" + (pointbarlt) + "," + (-pointbarll) + ")")
		this.svg.append('g')
						.attr('class','pointText')
						.append('text')
						.attr('x',0)
						.attr('y',0)
						.text( '　' + p1kaze + '　　' + p1name + '　' + '得点：'　+ that.ba.points[1])
						.attr('fill','white')
						.attr('font-family',fontfamily)
						.attr("transform","rotate("+90+")" + " translate(" + (pointbarlt) + "," + (-pointbarll+fontsize+5) + ")")
						// 140,-85
		// Player2
		this.svg.append('g')
						.attr('class','pointTiles')
						.append('rect')
						.attr('x',0)
						.attr('y',0)
						.attr('width',pointbarlen)
						.attr('height',fontsize*2)
						.attr('fill','#2f4f4f')
						.attr("transform","rotate("+0+")" + " translate(" + (pointbartl) + "," + (pointbarbt) + ")")
		this.svg.append('g')
						.attr('class','pointText')
						.append('text')
						.attr('x',0)
						.attr('y',0)
						.text( '　' + p2kaze + '　　' + p2name + '　' + '得点：'　+ that.ba.points[2])
						.attr('fill','white')
						.attr('font-family',fontfamily)
						.attr("transform","rotate("+0+")" + " translate(" + (pointbartl) + "," + (pointbarbt+fontsize+5) + ")")
		// Player3
		this.svg.append('g')
						.attr('class','pointTiles')
						.append('rect')
						.attr('x',0)
						.attr('y',0)
						.attr('width',pointbarlen)
						.attr('height',fontsize*2)
						.attr('fill','#2f4f4f')
						.attr("transform","rotate("+270+")" + " translate(" + (-kRLstarty*2+5) + "," + (pointbarrl-fontsize*3-5) + ")")
		this.svg.append('g')
						.attr('class','pointText')
						.append('text')
						.attr('x',0)
						.attr('y',0)
						.text( '　' + p3kaze + '　　' + p3name + '　' + '得点：'　+ that.ba.points[3])
						.attr('fill','white')
						.attr('font-family',fontfamily)
						.attr("transform","rotate("+270+")" + " translate(" + (-kRLstarty*2+5) + "," + (pointbarrl-fontsize*2) + ")")
		// ドラ表示牌の描画
		var doraAry = [{id:'dummy'},{id:'dummy'},{id:'dummy'},{id:'dummy'},{id:'dummy'},{id:'dummy'},{id:'dummy'}];
		for(var i=0;i<doranum;i++){
			doraAry[i+2] = that.ba.dorashow[i];
		}
		this.svg.append('g')
						.attr('class','dorashow')
						.selectAll('image')
						.data(doraAry)
						.enter()
						.append("image")
						.attr('xlink:href', function(d){
							if(d.id === 'dummy'){
								return 'img/bk.png';
							}else{
								return 'img/' + d.id + '.png';
							}
						})
						.attr('x', function(d,i){
							return dshowW + that.tileKW*i;
						})
						.attr('y', dshowH)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
		// Userの手牌描画
		this.svg.append('g')
						.attr('class','userTiles')
						.selectAll('image')
						.data(that.ba.players[2].tehai)
						.enter()
						.append("image")
						.attr('tileId',function(d){
							return d.id;
						})
						.attr('tileAddress',function(d,i){
							return i;
						})
						.attr('xlink:href', function(d){
							return 'img/' + d.id + '.png';
						})
						.attr('x', function(d,i){
							return tbstart + (that.tileUW * i);
						})
						.attr('y', function(d,i){
							return that.h - that.tileUH - 20;
						})
						.attr('height', that.tileUH)
						.attr('width',  that.tileUW)
						.attr('class', 'userTile')
		// Userの鳴き牌描画
		var usernakiend = nkendR + 0;
		for(var i=0;i<that.ba.players[2].naki.length;i++){
			var nakitiles = that.ba.players[2].naki[i];
			this.svg.append('g')
							.attr('class','userNaki')
							.selectAll('image')
							.data(nakitiles)
							.enter()
							.append("image")
							.attr('xlink:href', function(d){
								return 'img/' + d.id + '.png';
							})
							.attr('x', function(d,i){
								return usernakiend - (that.tileUW * i) - that.tileUW;
							})
							.attr('y', function(d,i){
								return that.h - that.tileUH - 20;
							})
							.attr('height', that.tileUH)
							.attr('width',  that.tileUW)
							.attr('class', 'userTile')
			usernakiend = usernakiend - (nakitiles.length * that.tileUH) - 5;
		}
		// Userの河描画
		this.svg.append('g')
						.attr('class','userKawa')
						.selectAll('image')
						.data(that.ba.kawa.player2)
						.enter()
						.append('image')
						.attr('xlink:href', function(d){
							return 'img/' + d.id + '.png';
						})
						.attr('x', function(d,i){
							return kustartx + (that.tileKW * (i%6) );
						})
						.attr('y', function(d,i){
							if( i < 6){
								return kustarty;
							}else if(i < 12){
								return kustarty + that.tileKH;
							}else{
								return kustarty + that.tileKH*2;
							}
						})
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
		// Userの河の色付け
		this.svg.append('g')
						.selectAll('rect')
						.data(that.ba.kawa.player2)
						.enter()
						.append('rect')
						.attr('x', function(d,i){
							return kustartx + (that.tileKW * (i%6) );
						})
						.attr('y', function(d,i){
							if( i < 6){
								return kustarty;
							}else if(i < 12){
								return kustarty + that.tileKH;
							}else{
								return kustarty + that.tileKH*2;
							}
						})
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
						.attr('fill', function(d,i){ return that.fill(d,i); })
						.attr('fill-opacity', function(d,i){ return that.fillOpacity(d,i); })
		// Player0（上）の手牌描画
		this.svg.append('g')
						.attr('class','cpuTiles')
						.selectAll('image')
						.data(that.ba.players[0].tehai)
						.enter()
						.append('image')
						.attr('xlink:href', function(d){
							return 'img/bk.png';
						})
						.attr('x', function(d,i){
							return that.w - tbstartT - (that.tileOW * i);
						})
						.attr('y', function(d,i){
							return 20;
						})
						.attr('height', that.tileOH)
						.attr('width',  that.tileOW)
		// Player0（上）の鳴き描画
		var p0nakiend = nkendCR + 0;
		for(var i=0;i<that.ba.players[0].naki.length;i++){
			var nakitiles = that.ba.players[0].naki[i];
			this.svg.append('g')
							.attr('class','otherNaki')
							.selectAll('image')
							.data(nakitiles)
							.enter()
							.append("image")
							.attr('xlink:href', function(d){
								return 'img/' + d.id + '.png';
							})
							.attr('transform', function(d,i){
								var p0nakix = p0nakiend + (that.tileKW * i) + that.tileKW;
								var p0nakiy = 20 + that.tileKH;
								var str =  "translate("
								 		str += p0nakix
										str += ","
										str += p0nakiy
										str += ") rotate(180)";
								return str;
							})
							.attr('x', 0)
							.attr('y', 0)
							.attr('height', that.tileKH)
							.attr('width',  that.tileKW)
							.attr('class', 'userTile')
			p0nakiend = p0nakiend + (nakitiles.length * that.tileOW) + 5;
		}
		// Player0（上）の河描画
		this.svg.append('g')
						.attr('class','cpuKawa')
						.selectAll('image')
						.data(that.ba.kawa.player0)
						.enter()
						.append('image')
						.attr('xlink:href', function(d){
							return 'img/' + d.id + '.png';
						})
						.attr('transform', function(d,i){
							var x = kustartx + that.tileKW*6 - (that.tileKW * (i%6));
							var y = 0;
							if( i < 6){
								y = kTstarty + that.tileKH*2;
							}else if(i < 12){
								y = kTstarty + that.tileKH;
							}else{
								y = kTstarty;
							}
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(180)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
		// Player0（上）のの色付け
		this.svg.append('g')
						.selectAll('rect')
						.data(that.ba.kawa.player0)
						.enter()
						.append('rect')
						.attr('transform', function(d,i){
							var x = kustartx + that.tileKW*6 - (that.tileKW * (i%6));
							var y = 0;
							if( i < 6){
								y = kTstarty + that.tileKH*2;
							}else if(i < 12){
								y = kTstarty + that.tileKH;
							}else{
								y = kTstarty;
							}
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(180)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
						.attr('fill', function(d,i){ return that.fill(d,i); })
						.attr('fill-opacity', function(d,i){ return that.fillOpacity(d,i); })
		// Player1（左）の手牌描画
		this.svg.append('g')
						.attr('class','cpuTiles')
						.selectAll('image')
						.data(that.ba.players[1].tehai)
						.enter()
						.append('image')
						.attr('xlink:href',function(d){
							return 'img/bk.png'
						})
						.attr('transform', function(d,i){
							var str =  "translate("
									str += that.tileOH + 20
									str += "," + ( tbstartRL +  that.tileOW * i)
									str += ") rotate(90)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileOH)
						.attr('width',  that.tileOW)
		// Player1（左）の鳴き描画
		var p1nakiend = nkendCR + 0;
		for(var i=0;i<that.ba.players[1].naki.length;i++){
			var nakitiles = that.ba.players[1].naki[i];
			this.svg.append('g')
							.attr('class','otherNaki')
							.selectAll('image')
							.data(nakitiles)
							.enter()
							.append("image")
							.attr('xlink:href', function(d){
								return 'img/' + d.id + '.png';
							})
							.attr('transform', function(d,i){
								var p1nakix = that.tileOH + 20;
								var p1nakiy = that.h - p1nakiend - (that.tileKW * i) - that.tileKW;
								var str =  "translate("
								 		str += p1nakix
										str += ","
										str += p1nakiy
										str += ") rotate(90)";
								return str;
							})
							.attr('x', 0)
							.attr('y', 0)
							.attr('height', that.tileKH)
							.attr('width',  that.tileKW)
							.attr('class', 'userTile')
			p1nakiend = p1nakiend - (nakitiles.length * that.tileOW) - 5;
		}
		// Player1（左）の河描画
		this.svg.append('g')
						.attr('class','cpuKawa')
						.selectAll('image')
						.data(that.ba.kawa.player1)
						.enter()
						.append('image')
						.attr('xlink:href', function(d){
							return 'img/' + d.id + '.png';
						})
						.attr('transform', function(d,i){
							var x = 0; //kRLstartx
							if( i < 6){
								x = kLstartx + that.tileKH*3;
							}else if(i < 12){
								x = kLstartx + that.tileKH*2;
							}else{
								x = kLstartx + that.tileKH*1;
							}
							var y = kRLstarty + that.tileKW * (i%6);
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(90)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
		// Player1（左）のの色付け
		this.svg.append('g')
						.selectAll('rect')
						.data(that.ba.kawa.player1)
						.enter()
						.append('rect')
						.attr('transform', function(d,i){
							var x = 0; //kRLstartx
							if( i < 6){
								x = kLstartx + that.tileKH*3;
							}else if(i < 12){
								x = kLstartx + that.tileKH*2;
							}else{
								x = kLstartx + that.tileKH*1;
							}
							var y = kRLstarty + that.tileKW * (i%6);
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(90)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
						.attr('fill', function(d,i){ return that.fill(d,i); })
						.attr('fill-opacity', function(d,i){ return that.fillOpacity(d,i); })
		// Player3（右）の手牌描画
		this.svg.append('g')
						.attr('class','cpuTiles')
						.selectAll('image')
						.data(that.ba.players[3].tehai)
						.enter()
						.append('image')
						.attr('xlink:href',function(d){
							return 'img/bk.png'
						})
						.attr('transform', function(d,i){
							var y = that.h - tbstartRL - that.tileOW * i;
							var str =  "translate("
							 		str += (that.w - that.tileOH - 20)
									str += ","
									str += y
									str += ") rotate(270)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileOH)
						.attr('width',  that.tileOW)
		// Player3（右）の鳴き描画
		var p3nakiend = nkendCR + 0;
		for(var i=0;i<that.ba.players[3].naki.length;i++){
			var nakitiles = that.ba.players[3].naki[i];
			this.svg.append('g')
							.attr('class','otherNaki')
							.selectAll('image')
							.data(nakitiles)
							.enter()
							.append("image")
							.attr('xlink:href', function(d){
								return 'img/' + d.id + '.png';
							})
							.attr('transform', function(d,i){
								var p3nakix = that.w - that.tileOH - 20;
								var p3nakiy = p3nakiend + (that.tileKW * i) + that.tileKW;
								var str =  "translate("
								 		str += p3nakix
										str += ","
										str += p3nakiy
										str += ") rotate(270)";
								return str;
							})
							.attr('x', 0)
							.attr('y', 0)
							.attr('height', that.tileKH)
							.attr('width',  that.tileKW)
							.attr('class', 'userTile')
			p3nakiend = p3nakiend + (nakitiles.length * that.tileOW) + 5;
		}
		// Player3（右）の河描画
		this.svg.append('g')
						.attr('class','cpuKawa')
						.selectAll('image')
						.data(that.ba.kawa.player3)
						.enter()
						.append('image')
						.attr('xlink:href', function(d){
							return 'img/' + d.id + '.png';
						})
						.attr('transform', function(d,i){
							var x = 0; //kRLstartx
							if( i < 6){
								x = kRstartx;
							}else if(i < 12){
								x = kRstartx + that.tileKH*1;
							}else{
								x = kRstartx + that.tileKH*2;
							}
							var y = kRLstarty + that.tileKW*6 - that.tileKW*(i%6);
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(270)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
		// Player3（右）の色付け
		this.svg.append('g')
						.selectAll('rect')
						.data(that.ba.kawa.player3)
						.enter()
						.append('rect')
						.attr('transform', function(d,i){
							var x = 0; //kRLstartx
							if( i < 6){
								x = kRstartx;
							}else if(i < 12){
								x = kRstartx + that.tileKH*1;
							}else{
								x = kRstartx + that.tileKH*2;
							}
							var y = kRLstarty + that.tileKW*6 - that.tileKW*(i%6);
							var str =  "translate("
									str += x
									str += ","
									str += y
									str += ") rotate(270)";
							return str;
						})
						.attr('x', 0)
						.attr('y', 0)
						.attr('height', that.tileKH)
						.attr('width',  that.tileKW)
						.attr('fill', function(d,i){ return that.fill(d,i); })
						.attr('fill-opacity', function(d,i){ return that.fillOpacity(d,i); })
	}
	// イベント受付処理
	SVGView.prototype.setEvents = function(ary){
		//this.unbindEvents();
		this.events = [];
		for(var i=0;i<ary.length;i++){
			var obj  = ary[i];
			var eobj = new SVGEvent(obj);
			this.events.push(eobj);
		}
		//var eobj = new SVGEvent(obj);
		//this.events.push(eobj);
	}
	SVGView.prototype.bindEvents = function(){
		for(var i=0;i<this.events.length;i++){
			var eobj = this.events[i];
			$(eobj.selector).bind(eobj.trigger,eobj.param,eobj.func);
			if('types' in eobj.param){
				doMenuOnOff(eobj.param.types);
			}
		}
		// TEST
		$('#menuAi').on('click',function(){
			var win = window.open("./ai.html","ai","width=" + window.innerWidth + ",height="  + window.innerHeight);
		})
	}
	SVGView.prototype.unbindEvents = function(){
		doMenuOnOff();
		for(var i=0;i<this.events.length;i++){
			var eobj = this.events[i];
			$(eobj.selector).unbind(eobj.trigger);
		}
		this.events = [];
	}

	var create = function(obj){
		return new SVGView(obj);
	}
	return {
		create : create
	}
})();
