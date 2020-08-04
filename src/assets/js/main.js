window.googletag = window.googletag || { cmd: [] };
googletag.cmd.push(function() {
  googletag.defineSlot('/567914328/test/desktop', [[300,250]], 'div-gpt-ad-9405734-1')
           .addService(googletag.pubads());
  googletag.pubads().enableSingleRequest();

  googletag.pubads().enableLazyLoad({
    fetchMarginPercent: 50,   // fetch slots within n viewports
    renderMarginPercent: 25,  // render slots within n viewports
  });

  googletag.pubads().addEventListener('impressionViewable', function(event) {
    console.log(`%cobject debugger ::`, `color:green;font-weight:bold;`, event.type, event);
  });

  googletag.pubads().addEventListener('slotVisibilityChanged', function(event) {
    console.log(`%cobject debugger ::`, `color:tomato;font-weight:bold;`, event.type, event);
  });


  googletag.enableServices();
});