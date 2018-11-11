App.Main = (function(){
  var start = function(){
    //Logger('Application Start','Info');
    var svg    = SvgView.create();
    var dealer = App.Dealer.create({
      svg : svg
    });
    dealer.execute();
  }
  return {
    start : start
  }
})();
