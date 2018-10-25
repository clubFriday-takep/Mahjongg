App.Const = (function(){
  // Tileオブジェクトの生成はYamaモジュールにて実施
  var TILES = [
    { id : 'm1', name : '一萬', group : 'm', num : 1, sort : 1 },
    { id : 'm2', name : '二萬', group : 'm', num : 2, sort : 2 },
    { id : 'm3', name : '三萬', group : 'm', num : 3, sort : 3 },
    { id : 'm4', name : '四萬', group : 'm', num : 4, sort : 4 },
    { id : 'm5', name : '五萬', group : 'm', num : 5, sort : 5 },
    { id : 'm6', name : '六萬', group : 'm', num : 6, sort : 6 },
    { id : 'm7', name : '七萬', group : 'm', num : 7, sort : 7 },
    { id : 'm8', name : '八萬', group : 'm', num : 8, sort : 8 },
    { id : 'm9', name : '九萬', group : 'm', num : 9, sort : 9 },
    { id : 'p1', name : '一筒', group : 'p', num : 1, sort : 10 },
    { id : 'p2', name : '二筒', group : 'p', num : 2, sort : 11 },
    { id : 'p3', name : '三筒', group : 'p', num : 3, sort : 12 },
    { id : 'p4', name : '四筒', group : 'p', num : 4, sort : 13 },
    { id : 'p5', name : '五筒', group : 'p', num : 5, sort : 14 },
    { id : 'p6', name : '六筒', group : 'p', num : 6, sort : 15 },
    { id : 'p7', name : '七筒', group : 'p', num : 7, sort : 16 },
    { id : 'p8', name : '八筒', group : 'p', num : 8, sort : 17 },
    { id : 'p9', name : '九筒', group : 'p', num : 9, sort : 18 },
    { id : 's1', name : '一索', group : 's', num : 1, sort : 19 },
    { id : 's2', name : '二索', group : 's', num : 2, sort : 20 },
    { id : 's3', name : '三索', group : 's', num : 3, sort : 21 },
    { id : 's4', name : '四索', group : 's', num : 4, sort : 22 },
    { id : 's5', name : '五索', group : 's', num : 5, sort : 23 },
    { id : 's6', name : '六索', group : 's', num : 6, sort : 24 },
    { id : 's7', name : '七索', group : 's', num : 7, sort : 25 },
    { id : 's8', name : '八索', group : 's', num : 8, sort : 26 },
    { id : 's9', name : '九索', group : 's', num : 9, sort : 27 },
    { id : 'j1', name : '東',   group : 'j', num : 1, sort : 28 },
    { id : 'j2', name : '南',   group : 'j', num : 2, sort : 29 },
    { id : 'j3', name : '西',   group : 'j', num : 3, sort : 30 },
    { id : 'j4', name : '北',   group : 'j', num : 4, sort : 31 },
    { id : 'j5', name : '白',   group : 'j', num : 5, sort : 32 },
    { id : 'j6', name : '發',   group : 'j', num : 6, sort : 33 },
    { id : 'j7', name : '中',   group : 'j', num : 7, sort : 34 }
  ]
  var getTileInfo = function(id,info){
    var info = info || 'name';
    for(var i=0;i<TILES.length;i++){
      var tile = TILES[i];
      if(id === tile.id){
        return tile[info];
      }
    }
  }
  return {
    TILES : TILES,
    getTileInfo : getTileInfo
  }
})();
