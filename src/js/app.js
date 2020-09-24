import { documents } from "./functions.js";

function hideHighlight() {
  const el = document.querySelector(".region-highlight.hidden");
  el.parentNode.removeChild(el);
}

function init() {
  documents();
  hideHighlight();
}

document.addEventListener("DOMContentLoaded", function() {
  init();
});
