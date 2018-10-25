App.Main = (function(){
  var start = function(){
    console.log('Application Start');
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
