import { documents } from "./functions.js";

function hideHighlight() {
  const el = document.querySelector(".region-highlight.hidden");
  el.parentNode.removeChild(el);
}

function prepareBookModal() {
  const banner = document.querySelector("a#smta");
  const overlay = document.querySelector("#modal .overlay");

  banner.onclick = event => {
    event.preventDefault();
    openModal();
  };

  overlay.onclick = () => {
    closeModal();
  };
}

function openModal() {
  document.body.classList.add("show-modal");
  document.querySelector("#page").style.top = `-${window.scrollY}px`;
}

function closeModal() {
  document.body.classList.remove("show-modal");
  document.querySelector("#page").removeAttribute("style");
}

function init() {
  documents();
  hideHighlight();
  prepareBookModal();
}

document.addEventListener("DOMContentLoaded", function() {
  init();
});
