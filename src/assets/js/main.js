window.googletag = window.googletag || {cmd: []};
const gptEventsWatcher = [];
console.log(`%cdebug ::`, `color:tomato;font-weight:bold;`, gptEventsWatcher);
let previousTiming = 0;
const updateEventTimingGraph = (eventType, event) => {
  console.log(`%cdebug ::`, `color:crimson;font-weight:bold;`, eventType);
  const timing = new Date();
  const currentTiming = timing.getSeconds()*1000+timing.getMilliseconds();
  const diff = currentTiming - previousTiming;
  previousTiming = currentTiming;
  gptEventsWatcher.push({
    eventType: eventType,
    event: event,
    timing: timing
  });
  const timeline = document.querySelector('.timeline');
  console.log(`%cdebug ::`, `color:crimson;font-weight:bold;`, currentTiming);
  timeline.insertAdjacentHTML('beforeEnd', `
    <div class="ff-${eventType.toLowerCase()}">
      <p>${eventType} | ${event.slot.getSlotElementId()} | ${timing.getSeconds()*1000+timing.getMilliseconds()} | ${timing.getSeconds()}-${timing.getMilliseconds()} | ${diff}</p>
    </div>
  `);
};

googletag.cmd.push(function() {
  googletag.defineSlot('/567914328/test/desktop', [[300,250]], 'div-gpt-ad-9405734-1').addService(googletag.pubads());
  googletag.defineSlot('/567914328/test/desktop', [728, 90], 'div-gpt-ad-1596659457894-0').addService(googletag.pubads());
  // googletag.pubads().enableSingleRequest();

  // googletag.pubads().enableLazyLoad({
  //   fetchMarginPercent: 0,
  //   renderMarginPercent: 0,
  // }); 

  googletag.pubads().addEventListener('impressionViewable', (event) => {
    updateEventTimingGraph('impressionViewable', event);
  });
  googletag.pubads().addEventListener('slotOnload', (event) => {
    updateEventTimingGraph('slotOnload', event);
  });
  googletag.pubads().addEventListener('slotRenderEnded', (event) => {
    updateEventTimingGraph('slotRenderEnded', event);
  });
  googletag.pubads().addEventListener('slotRequested', (event) => {
    updateEventTimingGraph('slotRequested', event);
  });
  googletag.pubads().addEventListener('slotResponseReceived', (event) => {
    updateEventTimingGraph('slotResponseReceived', event);
  });
  googletag.pubads().addEventListener('slotVisibilityChanged', (event) => {
    // updateEventTimingGraph('slotVisibilityChanged', event);
  });


  googletag.enableServices();
});