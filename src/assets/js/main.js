window.addEventListener('load', () => {
  document.querySelector('.grid-graph').insertAdjacentElement('afterBegin', demotag.slots['div-gpt-ad-1596659457894-0'].timelineElement);
  document.querySelector('.grid-graph').insertAdjacentElement('afterBegin', demotag.slots['div-gpt-ad-9405734-1'].timelineElement);
});

// a global object to enclose page data
const demotag = ((window, document, googletag) => {
  /**
   * Slot events memory
   */
  const slots = {};
  
  /**
   * Initial slot definition timing info
   */
  let initialTiming = 0;

  /**
   * Responds to triggered GPT events with updating demotag object and timelines
   * @param {*} gptEventName 
   * @param {*} gptEvent 
   */
  const update = (gptEventName, gptEvent) => {
    const {currentEvent, currentSlot} = saveSlotEvent(gptEventName, gptEvent);
    updateTimelineElement(currentEvent, currentSlot.timelineElement);
  };

  /**
   * Updates timeline container with incoming event data
   * @param {*} currentEvent 
   * @param {*} timelineElement 
   */
  const updateTimelineElement = (currentEvent, timelineElement) => {
    // create timeline item and item header for each event if it is not created before
    let timelineItem = timelineElement.querySelector(`.${currentEvent.type}`);
    if(null === timelineItem) {
      // create timeline item for current event
      timelineItem = document.createElement('div');
      timelineItem.classList.add('timeline-item', `${currentEvent.type}`);
      // add a color visualizer and header to timeline item
      timelineItem.insertAdjacentHTML('afterBegin', `
        <span class="timeline-timing">&nbsp;</span>
        <span class="timeline-separator">&laquo;</span>
        <span class="timeline-label">${currentEvent.type}</span>
      `);
      // insert timeline item to the timeline element
      timelineElement.insertAdjacentElement('beforeEnd', timelineItem);
    }
    // update percentages if event is visibility change event
    if('slotVisibilityChanged' === currentEvent.type) {
      const timelineDetailsElement = timelineElement.querySelector('.timeline-details')
      if(null === timelineDetailsElement) {
        timelineItem.insertAdjacentHTML('beforeEnd', `
          <span class="timeline-separator">|</span>
          <span class="timeline-details">${currentEvent.inViewPercentage}%</span>`);
      } else {
        timelineDetailsElement.textContent = `${currentEvent.inViewPercentage}%`;
      }
    }
    // translate headers to visualize event timings
    let timingMargin = Math.floor(currentEvent.timingDiff / 2);
    if(timingMargin > 100) {
      timelineItem.classList.add('timeline-iddle');
      const previousItemPadding = parseInt(timelineItem.previousElementSibling.style.marginLeft);
      timingMargin = previousItemPadding + 100;
    }
    // update left margins with preventing multiple updates for visibility change events
    if(timelineItem.style.marginLeft === "") {
      timelineItem.style.marginLeft = `${timingMargin}px`;
    }
  };

  /**
   * Creates an HTML element for the slot timeline
   * @param {*} currentSlotId 
   * @returns {*} A container for slot events timeline
   */
  const createTimelineElement = (currentSlotId='unknown-slot-id') => {
    const element = document.createElement('div');
    element.classList.add('timeline-container', `demotag-${currentSlotId}`);
    return element;
  };

  /**
   * Constructs a custom internal slot object and saves every incoming gpt event to events memory
   * @param {*} gptEventName 
   * @param {*} gptEvent 
   * @returns {*} Generated slot data
   */
  const saveSlotEvent =  (gptEventName, gptEvent) => {
    // grab current time
    const now = Date.now();
    // save each gpt slot to internal slots object with it's unique id
    const currentSlotId = gptEvent.slot.getSlotElementId();
    slots[currentSlotId] = slots[currentSlotId] || {
      impressionViewableEventFired: false,
      events: [],
      timelineElement: createTimelineElement(currentSlotId)
    };
    // get current internal slot object
    const currentSlot = slots[currentSlotId];
    // grab an event object and develop it with custom values
    const currentEvent = {
      type: gptEventName,
      timing: now,
      timingDiff: (currentSlot.events.length > 0) ? now - currentSlot.events[0].timing : now - demotag.initialTiming
    };
    // customize slot and saved slot event with event details
    if('slotVisibilityChanged' === gptEventName) {
      currentEvent.inViewPercentage = gptEvent.inViewPercentage;
    } else if('slotRenderEnded' === gptEventName) {
      currentEvent.size = gptEvent.size;
      currentEvent.filled = !gptEvent.isEmpty;
      currentEvent.responseInformation = gptEvent.slot.getResponseInformation();
    } else if('impressionViewable' === gptEventName) {
      currentSlot.impressionViewableEventFired = true;
    }
    // save incoming event
    currentSlot.events.push(currentEvent);
    // return updated event
    return {currentEvent, currentSlot};
  };
  
  // demotag object exports
  return {
    slots: slots,
    initialTiming: initialTiming,
    update: update
  };
})(window, document, googletag);

console.log(`%cdebug ::`, `color:crimson;font-weight:bold;`, demotag);

// gpt definitions
googletag.cmd.push(function() {
  demotag.initialTiming = Date.now();
  googletag.defineSlot('/567914328/test/desktop', [[300,250]], 'div-gpt-ad-9405734-1').addService(googletag.pubads());
  googletag.defineSlot('/567914328/test/desktop', [728, 90], 'div-gpt-ad-1596659457894-0').addService(googletag.pubads());
  // googletag.pubads().enableSingleRequest();
  // googletag.pubads().enableLazyLoad({
  //   fetchMarginPercent: 0,
  //   renderMarginPercent: 0,
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