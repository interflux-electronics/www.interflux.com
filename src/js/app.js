import { renderBanners, renderDocumentLinks } from "./functions.js";

function init() {
  renderBanners();
  renderDocumentLinks();
}

document.addEventListener("DOMContentLoaded", function() {
  init();
});
