// gpt definitions
googletag.cmd.push(function() {
  demotag.defineSlot('/567914328/test/desktop', [[300,250]], 'div-gpt-ad-9405734-1').addService(googletag.pubads());
  demotag.defineSlot('/567914328/test/desktop', [728, 90], 'div-gpt-ad-1596659457894-0').addService(googletag.pubads());
  // googletag.pubads().enableSingleRequest();
  // googletag.pubads().enableLazyLoad({
  //   fetchMarginPercent: 0,
  //   renderMarginPercent: 0
  // });
  // "googletag.pubads()" events are not removable
  googletag.pubads().addEventListener('impressionViewable', (event) => { demotag.update('impressionViewable', event); });
  googletag.pubads().addEventListener('slotOnload', (event) => { demotag.update('slotOnload', event); });
  googletag.pubads().addEventListener('slotRenderEnded', (event) => { demotag.update('slotRenderEnded', event); });
  googletag.pubads().addEventListener('slotRequested', (event) => { demotag.update('slotRequested', event); });
  googletag.pubads().addEventListener('slotResponseReceived', (event) => { demotag.update('slotResponseReceived', event); });
  googletag.pubads().addEventListener('slotVisibilityChanged', (event) => {
    // update only if impression is not viewable for current slot
    const targetSlot = demotag.slots[event.slot.getSlotElementId()];
    if(targetSlot && !targetSlot.impressionViewableEventFired) {
      demotag.update('slotVisibilityChanged', event);
    }
  });
  googletag.enableServices();
});

// insert timelines to DOM
document.addEventListener('DOMContentLoaded', () => {
  googletag.cmd.push(() => {
    document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-9405734-1'].timelineElement);
    document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-1596659457894-0'].timelineElement);
  });
});