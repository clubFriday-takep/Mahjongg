App.Dealer = (function(){
  var view = null;
  var Dealer = function(obj){
    var obj  = obj || {};
		this.ba  = obj.ba;
		this.svg = obj.svg;
  }
  Dealer.prototype.set = function(obj){
		var keys = Object.keys(obj);
		for(var i=0;i<keys.length;i++){
			var key = keys[i];
			this[key] = obj[key];
		}
		return this;
	}
  // 継続するか終了するか返却する。継続がTrue。
  // Stackの状態による処理を場合によっては実施。
  Dealer.prototype.next = function(){
    var stack = this.ba.next();
    Logger.debug(stack);
    var rs = {
      isContinue : true,
      isUserInject : false,
      stack : stack
    }
    if(stack.mode === 'end'){
      rs.isContinue = false;
    //}else if(stack.mode === 'userInject'){
    }else if(stack.mode === 'manualDa' || stack.mode === 'mreachDa' || stack.mode === 'agari'){
      Logger.debug('ユーザによるマニュアル操作')
      rs.isContinue = false;
      rs.isUserInject = true;
    }else if(stack.mode === 'start'){
      this.svg.init();
    }
    return rs;
  }
  Dealer.prototype.execute = function(isRedo){
    var isRedo = isRedo || false;
    if(!isRedo){

      console.log('＿人人人人人人人人人人人人人＿')
      console.log('＞　　　Open deal !　　　　＜')
      console.log('￣Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^Y￣')

      this.set({ ba : App.Ba.create() });
      this.svg.ba = this.ba;
    }
    var that = this;
    var next = function(){
      var Continue = that.next();
      that.svg.rerender();
      if(Continue.isUserInject){
        that.ba.setUserInjectEvent(that,Continue.stack);
      }
      if(Continue.isContinue){
        setTimeout(next,0);
      }else{
        // 何か処理をいれないと落ちる（謎）
        //console.log('Finish Deal!');
      }
    }
    next();
  }
  var create = function(obj){
    var dealer = new Dealer(obj);
    App.Dealer.view = dealer;
    return dealer;
  }
  return {
    create : create,
    view   : view
  }
})();
