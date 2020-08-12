window.addEventListener('load', () => {
  document.body.insertAdjacentElement('afterBegin', demotag.slots['div-gpt-ad-9405734-1'].timelineElement);
  document.body.insertAdjacentElement('afterBegin', demotag.slots['div-gpt-ad-1596659457894-0'].timelineElement);
});

// a global object to enclose page data
const demotag = ((window, document, googletag) => {
  /**
   * Slot events memory
   */
  const slots = {};

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
    let timelineItem = timelineElement.querySelector(`.demotag-tl-${currentEvent.type}`);
    let timelineItemHeader = timelineElement.querySelector(`.demotag-tl-${currentEvent.type} .demotag-tl-header`);;
    if(null === timelineItem) {
      // create timeline item for current event
      timelineItem = document.createElement('div');
      timelineItem.classList.add('demotag-tl-item', `demotag-tl-${currentEvent.type}`);
      // add a header to timeline item
      if(null === timelineItemHeader) {
        timelineItemHeader = document.createElement('span');
        timelineItemHeader.classList.add('demotag-tl-header');
        timelineItemHeader.textContent = currentEvent.type;
        timelineItem.insertAdjacentElement('afterBegin', timelineItemHeader);
      }
      // insert timeline item to the timeline element
      timelineElement.insertAdjacentElement('beforeEnd', timelineItem);
    }
    // add percentages if event is visibility change event
    if('slotVisibilityChanged' === currentEvent.type) {
      // restrict percentages to max 5 items (6 = 1 header and 5 percentages)
      while(timelineItem.querySelectorAll('.demotag-tl-text').length > 6) {
        timelineItem.firstElementChild.nextElementSibling.remove();
      }
      const percentageItem = document.createElement('span');
      percentageItem.classList.add('demotag-tl-text');
      percentageItem.textContent = `${currentEvent.inViewPercentage}%`;
      timelineItem.insertAdjacentElement('beforeEnd', percentageItem);
    }
    // translate headers to visualize event timings
    let timingMargin = Math.floor(currentEvent.timingDiff / 5);
    if(currentEvent.timingDiff > 1000) {
      const previousItemEndPosition = timelineItem.previousElementSibling.lastElementChild.getBoundingClientRect().right;
      timingMargin = previousItemEndPosition;
    }
    // update left margins with preventing multiple updates for visibility change events
    if(timelineItem.style.paddingLeft === "") {
      timelineItem.style.paddingLeft = `${timingMargin}px`;
    }
  };

  /**
   * Creates an HTML element for the slot timeline
   * @param {*} currentSlotId 
   * @returns {*} A container for slot events timeline
   */
  const createTimelineElement = (currentSlotId='unknown-slot-id') => {
    const element = document.createElement('div');
    element.classList.add('demotag-tl-container', `demotag-${currentSlotId}`);
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
      timingDiff: (currentSlot.events.length > 0) ? now - currentSlot.events[0].timing : 0
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
    update: update
  };
})(window, document, googletag);

console.log(`%cdebug ::`, `color:crimson;font-weight:bold;`, demotag);

// gpt definitions
googletag.cmd.push(function() {
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