import { translateReadMore } from "./functions.js";

function init() {
  translateReadMore();
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM READY");
  init();
});

// const isProduction = location.host === 'floatplane.io' ? true : false;
// const environment = isProduction ? 'production' : 'development';

// Fire page view to Google Analytics
// if (ga) {
//   ga('create', 'UA-34474019-10', 'auto');
//   ga('set', {
//     dimension1: environment
//   });
//   ga('send', 'pageview');
// }
