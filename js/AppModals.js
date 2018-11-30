App.Modals = (function(){
  // モーダルテンプレート
  var templates = {
    reach : `
      <div class="modal-content">
        <h5 id="modal_header">捨て牌を選択してください</h5>
        <div style="height:10px"></div>
        <div id="discardList"></div>
      </div>
      <div class="modal-footer">
        <a id="decide" class="modal-action modal-close waves-effect waves-green btn-flat">決定</a>
      </div>
    `,
    agari : `
      <div class="modal-content">
        <h5 id="modal_header"><span id="modal_player"></span>の上がり</h5>
        <div style="height:10px"></div>
        <div id="agariTilesTehai"></div>
        <div id="agariTilesNaki"></div>
        <div id="agariResult"></div>
        <div id="yakuList"></div>
        <div id="deals"></div>
      </div>
      <div class="modal-footer">
        <a id="nextGame" class="modal-action modal-close waves-effect waves-green btn-flat">次へ</a>
      </div>
    `,
    ryukyoku : `
      <div class="modal-content">
        <h5 id="modal_header">流局</h5>
      </div>
      <div class="modal-footer">
        <a id="ryukyoku" class="modal-action modal-close waves-effect waves-green btn-flat">次へ</a>
      </div>
    `
  }
  // リーチメソッド
  var reach = function(ba){
    var discards0 = ba.players[2].ai.modules.reach.discards;
    var discards  = [];
    // ソート用にdiscardオブジェクトを加工する
    for(var i=0;i<discards0.length;i++){
      var discard = discards0[i];
      var sortno = (discard.color * 10) + discard.tile;
      discard.sort = sortno;
      discards.push(discard);
    }
    discards = App.Util.objectSort(discards,'sort','asc');
    Logger.debug(['Discardオブジェクト',discards])
    var bindHtml = '';
    for(var i=0;i<discards.length;i++){
      var discard = discards[i];
      var tileId   = App.Util.colorAddToCd(discard.color) + (discard.tile + 1);
      var tileName = App.Const.getTileInfo(tileId);
      bindHtml = bindHtml + `
        <p>
          <input name="discards" type="radio" id="${i}" tileId="${tileId}" tileColor="${discard.color}" tileAddress="${discard.tile}" />
          <label for="${i}">${tileName}</label>
        </p>
      `;
    }
    $('#modal').html(templates.reach);
    $('#discardList').html(bindHtml);
    $('#decide').bind('click',{ba:ba},function(p){
      var checked = $('#discardList input[name="discards"]:checked');
      if(checked){
        p.data.ba.userReachExec({
          tileId      : checked.attr('tileId'),
          tileColor   : Number(checked.attr('tileColor')),
          tileAddress : Number(checked.attr('tileAddress'))
        });
      }
    })
    $('#modal').modal({dismissible:true});
    $('#modal').modal('open');
  }
  // 上がりメソッド
  var agari = function(stack,yakuList){
    $('#modal').html(templates.agari);
    // Player名の設定
    $('#modal_player').html('Player' + stack.player);
    // 役リストの生成
    var html = '';
    Logger.debug(['Stack',stack]);
    Logger.debug(['YakuList',yakuList]);
    var han = 0;
    for(var i=0;i<yakuList.length;i++){
      var yaku = yakuList[i];
      var key  = Object.keys(yaku)[0];
      var name = App.Const.YAKUNAMES[key];
      han = han + yaku[key];
      html = html + `<div>${name}　${yaku[key]}翻</div>`;
    }
    $('#yakuList').html(html);
    // 得点表示
    var fu = 30;
    var deals = App.Point.getPoint(yakuList,stack,fu,han);
    var agariResult = `<div>${fu}符 ${han}翻</div>`;
    $('#agariResult').html(agariResult);
    var agariDeals = '';
    for(var i=0;i<deals.length;i++){
      var deal = deals[i];
      if(deal !== 0){
        agariDeals = agariDeals + `<div>Player${i}(${deal})</div>`
      }
    }
    $('#deals').html(agariDeals);
    // 得点を反映
    App.Ba.view.setDeals(deals);

    $('#nextGame').bind('click',{stack:stack},App.Ba.view.nextGame);
    // モーダル表示
    $('#modal').modal({dismissible:false});
    $('#modal').modal('open');
  }
  var ryukyoku = function(stack){
    $('#modal').html(templates.ryukyoku);
    $('#ryukyoku').bind('click',{stack:stack},App.Ba.view.nextGameRyukoku);
    $('#modal').modal({dismissible:false});
    $('#modal').modal('open');
  }
  return {
    reach : reach,
    agari : agari,
    ryukyoku : ryukyoku
  }
})();
