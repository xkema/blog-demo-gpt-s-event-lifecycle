document.addEventListener('DOMContentLoaded', () => {
  // form controls
  const settingsFormElement = document.querySelector('form.page-settings');

  // get form inputs manually
  const inputEnableSingleRequest = settingsFormElement.querySelector('#enableSingleRequest');
  const inputEnableLazyLoad = settingsFormElement.querySelector('#enableLazyLoad');
  const inputFetchMarginPercent = settingsFormElement.querySelector('#fetchMarginPercent');
  const inputRenderMarginPercent = settingsFormElement.querySelector('#renderMarginPercent');

  /**
   * Updates "enableSingleRequest" option by an input event or setting from demotag object
   * @param {*} event 
   * @param {*} setting 
   */
  const updateEnableSingleRequest = (event, setting) => {
    let updatedValue = null;
    if(null !== event) {
      updatedValue = inputEnableSingleRequest.checked;
    } else {
      updatedValue = setting;
      inputEnableSingleRequest.checked = setting;
    }
    inputEnableSingleRequest.parentElement.nextElementSibling.firstElementChild.textContent = updatedValue ? 'enabled' : 'disabled';
  };
  
  /**
   * Updates "enableLazyLoad" option by an input event or setting from demotag object
   * @param {*} event 
   * @param {*} setting 
   */
  const updateEnableLazyLoad = (event, setting) => {
    let updatedValue = null;
    if(null !== event) {
      updatedValue = inputEnableLazyLoad.checked;
    } else {
      updatedValue = setting;
      inputEnableLazyLoad.checked = setting;
    }
    inputEnableLazyLoad.parentElement.nextElementSibling.firstElementChild.textContent = updatedValue ? 'enabled' : 'disabled';
    // update sub options availability and wrapper styles
    if(updatedValue !== true) {
      inputFetchMarginPercent.disabled = true;
      inputRenderMarginPercent.disabled = true;
      inputFetchMarginPercent.closest('.option').classList.add('sub-option-disabled');
      inputRenderMarginPercent.closest('.option').classList.add('sub-option-disabled');
    } else {
      inputFetchMarginPercent.disabled = false;
      inputRenderMarginPercent.disabled = false;
      inputFetchMarginPercent.closest('.option').classList.remove('sub-option-disabled');
      inputRenderMarginPercent.closest('.option').classList.remove('sub-option-disabled');
    }
  };
  
  /**
   * Updates "fetchMarginPercent" option by an input event or setting from demotag object
   * @param {*} event 
   * @param {*} setting 
   */
  const updateFetchMarginPercent = (event, setting) => {
    let updatedValue = null;
    if(null !== event) {
      updatedValue = inputFetchMarginPercent.value;
    } else {
      updatedValue = setting;
      inputFetchMarginPercent.value = setting;
    }
    inputFetchMarginPercent.parentElement.nextElementSibling.firstElementChild.textContent = `${inputFetchMarginPercent.value}`;
  };
  
  /**
   * Updates "renderMarginPercent" option by an input event or setting from demotag object
   * @param {*} event 
   * @param {*} setting 
   */
  const updateRenderMarginPercent = (event, setting) => {
    let updatedValue = null;
    if(null !== event) {
      updatedValue = renderMarginPercent.value;
    } else {
      updatedValue = setting;
      renderMarginPercent.value = setting;
    }
    renderMarginPercent.parentElement.nextElementSibling.firstElementChild.textContent = `${renderMarginPercent.value}`;
  };

  /**
   * Updates form with denitag settings collected from URL parameters on page load 
   * @param {*} settings 
   */
  const updateForm = (settings) => {
    updateEnableSingleRequest(null, settings.enableSingleRequest);
    updateEnableLazyLoad(null, settings.enableLazyLoad);
    updateFetchMarginPercent(null, settings.fetchMarginPercent);
    updateRenderMarginPercent(null, settings.renderMarginPercent);
  };

  // add change listeners
  inputEnableSingleRequest.addEventListener('change', updateEnableSingleRequest);
  inputEnableLazyLoad.addEventListener('change', updateEnableLazyLoad);
  inputFetchMarginPercent.addEventListener('input', updateFetchMarginPercent);
  inputRenderMarginPercent.addEventListener('input', updateRenderMarginPercent);

  // reset form with current url parameters on page load
  updateForm(demotag.settings);

  // set pin buttons
  document.querySelector('.pin-button.pin-timelines').addEventListener('click', (event) => {
    document.querySelector('.grid-graph').classList.toggle('pinned');
  });

  // set gpt library status checker
  let numLibraryAvailableCheckes = 0;
  const gridEntranceElement = document.querySelector('.grid-entrance');
  let libraryAvailableInfoElement = gridEntranceElement.querySelector('.library-available-info');
  const libraryAvailableTimerId = window.setInterval(() => {
    // stop checking if everything is good to go
    if('undefined' !== typeof googletag && googletag && googletag.apiReady) {
      window.clearInterval(libraryAvailableTimerId);
    } else {
      // else start timer checks
      numLibraryAvailableCheckes++;
      if(numLibraryAvailableCheckes > 25) {
        libraryAvailableInfoElement.textContent = `Nearly half a minute has passed and there is no googletag api activity. Stopping availability checker. You should disable ad/tracker blockers temporarily!`;
        window.clearInterval(libraryAvailableTimerId);
      } else if(0 === numLibraryAvailableCheckes % 5) {
        if('undefined' === typeof googletag || (googletag && !googletag.apiReady)) {
          if(null === libraryAvailableInfoElement) {
            libraryAvailableInfoElement = document.createElement('p');
            libraryAvailableInfoElement.classList.add('error-box');
            gridEntranceElement.insertAdjacentElement('afterBegin', libraryAvailableInfoElement);
          }
          libraryAvailableInfoElement.textContent = `${numLibraryAvailableCheckes} seconds passed and there is no googletag api activity. Disable ad/tracker blockers temporarily to see the demo.`;
        }
      }
    }
  }, 1000);
});