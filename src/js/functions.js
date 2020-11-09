export async function documents() {
  const isProductPage = document.body.classList.contains("page-products");

  if (!isProductPage) {
    return;
  }

  console.log("documents() fetching...");

  const host =
    location.host === "interflux.com"
      ? "https://api.interflux.com"
      : "http://localhost:3000";

  const url = `${host}/v1/public/documents/?include=cdn_files`;
  const options = {
    headers: {
      "Content-Type": "application/vnd.api+json"
    }
  };

  const response = await fetch(url, options);
  const json = await response.json();
  const { data, included } = json;

  const TDs = data.filter(TD => {
    return TD.relationships["document-category"].data.id === "TD";
  });
  const names = TDs.map(TD => {
    return TD.attributes.name;
  });
  const uniques = [...new Set(names)];
  const sorted = uniques.sort();

  console.log(sorted);

  const productRows = document.querySelectorAll(".product-row");

  productRows.forEach(productRow => {
    const name = productRow.querySelector(".product-name h3").innerText;
    const kebabName = name.replace(/\s/g, "-").replace("µ", "micro");
    const matches = TDs.filter(TD => {
      return TD.id.startsWith(`documents/products/${kebabName}/`);
    });
    console.log("documents()", name, matches);
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
