// a global object to enclose page data
const demotag = ((window, document, googletag) => {
  /**
   * Slot events memory
   */
  const slots = {};
  
  /**
   * Configuration options for page initialization
   */
  const defaults = {
    enableSingleRequest: false,
    enableLazyLoad: false,
    fetchMarginPercent: 0,
    renderMarginPercent: 0,
  };

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
        <span class="timeline-label" title="${currentEvent.type}">${currentEvent.type}</span>
      `);
      // add iddle timing indicator
      timelineIddle = document.createElement('div');
      timelineIddle.classList.add('timeline-iddle', `${currentEvent.type}`);
      // add a color visualizer to timeline iddle item
      let iddleTiming = currentEvent.timingDiff;
      if(iddleTiming < 1000) {
        iddleTiming = `${iddleTiming}ms`;
      } else {
        iddleTiming = `${(iddleTiming/1000).toFixed(2)}s`;
      }
      timelineIddle.insertAdjacentHTML('afterBegin', `
        <div class="timeline-iddle-timing">
          <span title="${iddleTiming}">${iddleTiming}</span>
          <abbr title="${iddleTiming}">d</abbr>
        </div>`);
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
    if(null !== timelineItemsElement.lastElementChild) {
      if('impressionViewable' === currentEvent.type || ('slotRenderEnded' === currentEvent.type && !currentEvent.filled)) {
        timelineItemsElement.lastElementChild.firstElementChild.firstElementChild.textContent = 'finish';
        timelineItemsElement.lastElementChild.firstElementChild.lastElementChild.textContent = 'f';
        timelineItemsElement.lastElementChild.firstElementChild.lastElementChild.title = 'finish';
      }
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
          <div class="timeline-iddle-timing">
            <span>start</span>
            <abbr title="start">s</abbr>
          </div>
        </div>
        <div class="timeline-iddle finish">
          <div class="timeline-iddle-timing">
            <span>waiting-next-event</span>
            <abbr title="waiting-next-event">wne</abbr>
          </div>
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
    // get current internal slot object
    const currentSlot = slots[gptEvent.slot.getSlotElementId()];
    // grab an event object and develop it with custom values
    const currentEvent = {
      type: gptEventName,
      timing: now,
      timingDiff: (currentSlot.events.length > 0) ? now - currentSlot.events[0].timing : now - currentSlot.initialTiming
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

  /**
   * Initialize and save each defined gpt slot to internal slots object with it's unique id "opt_div".
   * This method also creates the timeline HTML element for target slot. That means timeline graph will be ready to inserted into DOM right after slot definition if DOM is ready.
   * @todo Move `initialTiming` to "demotag.display" method
   * @param {*} adUnitPath 
   * @param {*} size 
   * @param {*} opt_div 
   * @returns {googletag.Slot} GPT's original "Slot" object
   */
  const defineSlot = (adUnitPath, size, opt_div) => {
    slots[opt_div] = slots[opt_div] || {
      impressionViewableEventFired: false,
      events: [],
      initialTiming: Date.now(),
      timelineElement: createTimelineElement(opt_div)
    };
    // @todo Move timelines querySelector string to demotag
    document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', slots[opt_div].timelineElement);
    return googletag.defineSlot(adUnitPath, size, opt_div);
  };

  /**
   * Destorys page slots and artifacts for reinitialization with different options
   */
  const destroyPage = () => {
    googletag.destroySlots();
    for(slotElementId in slots) {
      const slot = slots[slotElementId];
      slot.timelineElement.remove();
      // document.getElementById(slotElementId).remove();
      delete slots[slotElementId];
    }
  };

  /**
   * Initializes demotag object
   */
  const init = () => {
    // collect search params
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      if(key === 'enableSingleRequest' || key === 'enableLazyLoad') {
        demotag.settings[key] = (value === 'on') ? true : false;
      } else if(key === 'fetchMarginPercent' || key === 'renderMarginPercent') {
        demotag.settings[key] = parseInt(value);
      }
    });
  };
  
  // demotag object exports
  return {
    slots: slots,
    settings: Object.assign({}, defaults),
    destroyPage: destroyPage,
    defineSlot: defineSlot,
    update: update,
    init: init
  };
})(window, document, googletag);

// initialize demotag
demotag.init();

// print demotag object to the console
console.log(`%cdemotag object ::`, `color:tomato;font-weight:bold;`, demotag);