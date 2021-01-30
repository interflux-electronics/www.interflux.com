const apiHost =
  location.host === "interflux.com"
    ? "https://api.interflux.com"
    : "http://localhost:3000";

const renderBanners = async () => {
  const classList = document.body.classList;
  const isContactPage = classList.contains("page-contact");

  if (isContactPage) {
    return document.querySelector(".region-highlight").classList.add("hidden");
  }

  console.debug("renderBanners()");
  const cache = sessionStorage.getItem("webinars");
  console.debug({ cache });
  const webinars = cache
    ? JSON.parse(cache)
    : await fetchWebinars().catch(() => {
        console.warn("could not fetch webinars");
        return [];
      });

  console.debug({ webinars });

  const loadBanner = document.querySelector(".region-highlight #loading");
  const lmpaBanner = document.querySelector(".region-highlight #lmpa");
  const webinarBanner = document.querySelector(".region-highlight #webinars");

  if (webinars.length < 1) {
    lmpaBanner.classList.remove("hidden");
  } else {
    webinarBanner.classList.remove("hidden");
    populateWebinarModal(webinars);
    bindModalEvents();
  }

  loadBanner.classList.add("hidden");
};

async function fetchWebinars() {
  console.debug("fetchWebinars()");

  const url = `${apiHost}/v1/public/webinars`;
  const options = {
    headers: {
      "Content-Type": "application/vnd.api+json"
    }
  };
  const response = await fetch(url, options);
  const json = await response.json();

  console.debug({ json });

  const webinars = json.data.map(obj => {
    const id = obj.id;
    const attr = obj.attributes;
    const title = attr.title || "TBC";
    const topic =
      attr.topic.replace(/\*([^*]+)\*/g, "<mark>$1</mark>") || "TBC";
    const audience = attr.audience || "TBC";
    const duration = attr.duration ? `~${attr.duration}min + Q&A` : "TBC";
    const url = attr.url ? attr.url : "https://gotowebinar.com/";
    const startTime = attr["start-time"];
    const startTimeFormatted = new Date(startTime).toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      hour12: false,
      minute: "numeric",
      timeZoneName: "short"
    });

    return {
      id,
      title,
      topic,
      audience,
      duration,
      url,
      startTime,
      startTimeFormatted
    };
  });

  const now = Date.now();
  const soonBeforeLater = (a, b) => {
    if (a.startTime < b.startTime) {
      return -1;
    }
    if (a.startTime > b.startTime) {
      return 1;
    }
    return 0;
  };

  // Return only the webinars in the future and sort them soon before later.
  const arr = webinars.filter(w => w.startTime > now).sort(soonBeforeLater);

  // Cache the results so we don't have to fetch them later in this session.
  // sessionStorage.setItem("webinars", JSON.stringify(arr));

  return arr;
}

function populateWebinarModal(webinars) {
  const modal = document.querySelector("#modal .content section");

  webinars.forEach((webinar, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <hr>
      <h2><span>${i + 1}. ${webinar.title}</span></h2>
      <p>Who should attend: ${webinar.audience}</p>
      <p>Topic: ${webinar.topic}</p>
      <p>When:
        <time>${webinar.startTimeFormatted}</time>
      </p>
      <p>Duration: ${webinar.duration}</p>
      <a href="${
        webinar.url
      }" target="_blank" rel="nofollow noreferrer" class="button">
        Register
      </a>
    `;
    modal.append(div);
  });
}

function bindModalEvents() {
  console.debug("bindModalEvents()");

  const webinars = document.querySelector("#webinars");
  const links = document.querySelectorAll("#webinars a");
  const overlay = document.querySelector("#modal .overlay");

  if (!webinars) {
    return;
  }

  links.forEach(link => {
    link.onclick = event => {
      event.preventDefault();
    };
  });

  webinars.onclick = () => {
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

async function renderDocumentLinks() {
  console.debug("renderDocumentLinks()");

  const isProductPage = document.body.classList.contains("page-products");

  if (!isProductPage) {
    return;
  }

  const cache = sessionStorage.getItem("documents");

  console.debug({ cache });

  const json = cache ? JSON.parse(cache) : await fetchDocuments();
  const { data, included } = json;

  const TDs = data.filter(TD => {
    return TD.relationships["document-category"].data.id === "TD";
  });

  // const names = TDs.map(TD => {
  //   return TD.attributes.name;
  // });
  // const uniques = [...new Set(names)];
  // const sorted = uniques.sort();

  console.debug({ TDs });

  const productRows = document.querySelectorAll(".product-row");

  productRows.forEach(productRow => {
    const name = productRow.querySelector(".product-name h3").innerText;
    const kebabName = name.replace(/\s/g, "-").replace("µ", "micro");
    const matches = TDs.filter(TD => {
      return TD.id.startsWith(`documents/products/${kebabName}/`);
    });
    console.debug(name, { matches });
    const details = productRow.querySelector(".product-details");
    const documents = productRow.querySelectorAll(".product-document-link");

    // If the payload contains docs for the productrow, then remove all existing TD links.
    if (matches.length) {
      documents.forEach(doc => {
        const str = doc.innerText.trim();
        const isTD =
          str.startsWith("Technical Data Sheet") ||
          str.startsWith("Technisches Datenblatt") ||
          str.startsWith("Fiche technique");
        if (isTD) {
          doc.parentNode.removeChild(doc);
        }
      });
    }
    matches.forEach(TD => {
      let html = "";

      const files = included
        .filter(x => x.attributes.path.startsWith(TD.id))
        .map(x => x.attributes.path);

      files.forEach(file => {
        const locale = file.slice(-6, -4).toLowerCase();

        const language = {
          en: "English",
          fr: "Français",
          de: "Deutsch"
        }[locale];

        html += `
           <div class="product-document-link ${locale}">
             <span class="file">
               <img class="file-icon" alt="" title="application/pdf" src="/assets/images/application-pdf.png">
               <a
                 href="https://cdn.interflux.com/${file}"
                 target="_blank"
                 rel="noopener noreferrer"
               >${TD.attributes.name} (${language})</a>
             </span>
           </div>
         `;
      });

      details.insertAdjacentHTML("afterend", html);
    });
  });
}

async function fetchDocuments() {
  console.debug("fetchDocuments() fetching...");

  const url = `${apiHost}/v1/public/documents/?include=cdn_files`;
  const options = {
    headers: {
      "Content-Type": "application/vnd.api+json"
    }
  };

  const response = await fetch(url, options);
  const json = await response.json();

  // Cache the results so we don't have to fetch them later in this session.
  sessionStorage.setItem("documents", JSON.stringify(json));

  return json;
}

export { renderBanners, renderDocumentLinks };
