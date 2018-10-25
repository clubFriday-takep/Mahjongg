App.Modals = (function(){
  var templates = {
    reach : `
      <div class="modal-content">
        <h5 id="modal_header">捨て牌を選択してください</h4>
        <div style="height:10px"></div>
        <div id="discardList"></div>
      </div>
      <div class="modal-footer">
        <a id="decide" class="modal-action modal-close waves-effect waves-green btn-flat">決定</a>
      </div>
    `
  }
  var reach = function(ba){
    var discards = ba.players[2].ai.modules.reach.discards;
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
  }
  return {
    reach : reach
  }
})();
