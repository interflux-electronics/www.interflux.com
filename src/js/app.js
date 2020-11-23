import { documents } from "./functions.js";

function modals() {
  const webinars = document.querySelector("#webinars");
  const links = document.querySelectorAll("#webinars a");
  const overlay = document.querySelector("#modal .overlay");

  if (!webinars) {
    return;
  }

  links.forEach(link => {
    link.onclick = event => {
      event.preventDefault();
      openModal();
    };
  });

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

function banners() {
  // const classList = document.body.classList;
  // const isFluxPage = classList.contains("page-soldering-fluxes");
  // const isWavePage = classList.contains("page-wave-soldering");
  // const isPastePage = classList.contains("page-solder-pastes");
  // const isReflowPage = classList.contains("page-reflow-soldering");

  const smta = document.querySelector(".region-highlight #smta");
  // const lmpa = document.querySelector(".region-highlight #lmpa");
  const webinars = document.querySelector(".region-highlight #webinars");

  // if (isFluxPage || isWavePage) {
  //   // Show webinars banner on flux and wave pages
  //   smta.parentNode.removeChild(smta);
  //   lmpa.parentNode.removeChild(lmpa);
  // } else if (isPastePage || isReflowPage) {
  //   // Show SMTA banner on paste and reflow pages
  //   webinars.parentNode.removeChild(webinars);
  //   lmpa.parentNode.removeChild(lmpa);
  // } else {
  //   // In all other cases, show the LMPA banner
  //   webinars.parentNode.removeChild(webinars);
  //   smta.parentNode.removeChild(smta);
  // }

  webinars.parentNode.removeChild(webinars);
  smta.parentNode.removeChild(smta);
}

function init() {
  documents();
  banners();
  modals();
}

document.addEventListener("DOMContentLoaded", function() {
  init();
});
