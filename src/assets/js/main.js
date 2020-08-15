window.addEventListener('load', () => {
  document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-9405734-1'].timelineElement);
  document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-1596659457894-0'].timelineElement);
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
    // first child of "timelineItemsElement" is ".timeline-iddle.start" element, last is ".timeline-iddle.end" element
    const timelineItemsElement = timelineElement.firstElementChild;
    let timelineItem = timelineItemsElement.querySelector(`.timeline-item.${currentEvent.type}`);
    let timelineIddle = timelineItemsElement.querySelector(`.timeline-iddle.${currentEvent.type}`);
    if(null === timelineItem) {
      // create timeline item for current event
      timelineItem = document.createElement('div');
      timelineItem.classList.add('timeline-item', `${currentEvent.type}`);
      // add a color visualizer and header to timeline item
      timelineItem.insertAdjacentHTML('afterBegin', `
        <span class="timeline-timing">&nbsp;</span>
        <span class="timeline-label">${currentEvent.type}</span>
      `);
      // add iddle timing indicator
      timelineIddle = document.createElement('div');
      timelineIddle.classList.add('timeline-iddle', `${currentEvent.type}`);
      // add a color visualizer to timeline iddle item
      timelineIddle.insertAdjacentHTML('afterBegin', `
        <span class="timeline-iddle-timing">${currentEvent.timingDiff}ms</span>
      `);
      // insert timeline iddle item to the timeline element
      timelineItemsElement.lastElementChild.insertAdjacentElement('beforeBegin', timelineIddle);
      // insert timeline item to the timeline element
      timelineItemsElement.lastElementChild.insertAdjacentElement('beforeBegin', timelineItem);
    }
    // update percentages if event is visibility change event
    if('slotVisibilityChanged' === currentEvent.type) {
      const timelineDetailsElement = timelineItemsElement.querySelector('.timeline-details')
      if(null === timelineDetailsElement) {
        timelineItem.insertAdjacentHTML('beforeEnd', `
          <span class="timeline-details">${currentEvent.inViewPercentage}%</span>`);
      } else {
        timelineDetailsElement.textContent = `${currentEvent.inViewPercentage}%`;
      }
    }
    // set min/max for timing margin
    let previousIddleMargin = 0;
    if(timelineIddle.previousElementSibling && timelineIddle.previousElementSibling.previousElementSibling) {
      previousIddleMargin = parseInt(timelineIddle.previousElementSibling.previousElementSibling.style.flexGrow);
    }
    // restrict max iddle time duration 2s and set max flexGrow to double of previous margin for durations longer than 2s
    // restrict min iddle time margin to 200
    let iddleMargin = currentEvent.timingDiff;
    if(iddleMargin > 2000) {
      iddleMargin = previousIddleMargin * 2;
    }
    if(iddleMargin < 200) {
      iddleMargin = 200;
    }
    // ensure single time updates for "slotVisibilityChanged" events
    if(timelineIddle.style.flexGrow === '') {
      timelineIddle.style.flexGrow = `${iddleMargin}`;
    }
    // seal timeline element with finish string
    if(null !== timelineItemsElement.lastElementChild && 'impressionViewable' === currentEvent.type) {
      timelineItemsElement.lastElementChild.firstElementChild.innerHTML = 'finish';
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
    element.insertAdjacentHTML('afterBegin', `
      <div class="timeline-items">
        <div class="timeline-iddle start">
          <span class="timeline-iddle-timing">start</span>
        </div>
        <div class="timeline-iddle finish">
          <span class="timeline-iddle-timing">waiting-next-event</span>
        </div>
      </div>`);
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

// console.log(`%cdebug ::`, `color:crimson;font-weight:bold;`, demotag);

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