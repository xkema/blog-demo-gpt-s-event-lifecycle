document.addEventListener('DOMContentLoaded', () => {
  // timelines
  googletag.cmd.push(() => {
    // document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-9405734-0'].timelineElement);
    // document.querySelector('.grid-graph .timelines').insertAdjacentElement('beforeEnd', demotag.slots['div-gpt-ad-9405734-1'].timelineElement);
  });
  // form controls
  const settingsFormElement = document.querySelector('form.page-settings');
  const inputEnableSingleRequest = settingsFormElement.querySelector('#enableSingleRequest');
  const inputEnableLazyLoad = settingsFormElement.querySelector('#enableLazyLoad');
  const inputFetchMarginPercent = settingsFormElement.querySelector('#fetchMarginPercent');
  const inputRenderMarginPercent = settingsFormElement.querySelector('#renderMarginPercent');
  // reset lazyload sub options
  inputEnableLazyLoad.addEventListener('change', (event) => {
    if(!inputEnableLazyLoad.checked) {
      inputFetchMarginPercent.value = 0;
      inputRenderMarginPercent.value = 0;
    }
  });  
  // reset form with current url parameters
  inputEnableSingleRequest.checked = demotag.settings.enableSingleRequest;
  inputEnableLazyLoad.checked = demotag.settings.enableLazyLoad;
  inputFetchMarginPercent.value = demotag.settings.fetchMarginPercent;
  inputRenderMarginPercent.value = demotag.settings.renderMarginPercent;
  // settingsFormElement.addEventListener('submit', (event) => {});
});