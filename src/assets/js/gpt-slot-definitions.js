// gpt definitions
googletag.cmd.push(function() {
  demotag.defineSlot('/567914328/test/desktop', [[300,250]], 'sidebar-top-slot').addService(googletag.pubads());
  demotag.defineSlot('/567914328/test/desktop', [300, 250], 'sidebar-bottom-slot').addService(googletag.pubads());
  if(demotag.settings.enableSingleRequest) {
    googletag.pubads().enableSingleRequest();    
  }
  if(demotag.settings.enableLazyLoad) {
    googletag.pubads().enableLazyLoad({
      fetchMarginPercent: demotag.settings.fetchMarginPercent,
      renderMarginPercent: demotag.settings.renderMarginPercent
    });
  }
  googletag.pubads().setCentering(true);
  // listen to pubads events
  googletag.pubads().addEventListener('impressionViewable', (event) => { demotag.update('impressionViewable', event); });
  googletag.pubads().addEventListener('slotOnload', (event) => { demotag.update('slotOnload', event); });
  googletag.pubads().addEventListener('slotRenderEnded', (event) => { demotag.update('slotRenderEnded', event); });
  googletag.pubads().addEventListener('slotRequested', (event) => { demotag.update('slotRequested', event); });
  googletag.pubads().addEventListener('slotResponseReceived', (event) => { demotag.update('slotResponseReceived', event); });
  googletag.pubads().addEventListener('slotVisibilityChanged', (event) => {
    // update only if impression is not viewable for current slot
    const targetSlot = demotag.slots[event.slot.getSlotElementId()];
    // "googletag.pubads()" events are not removable
    if(targetSlot && !targetSlot.impressionViewableEventFired) {
      demotag.update('slotVisibilityChanged', event);
    }
  });
  googletag.enableServices();
});