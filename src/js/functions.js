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

  const response = await fetch(`${host}/v1/public/documents`, {
    headers: {
      "Content-Type": "application/vnd.api+json"
    }
  });
  const json = await response.json();
  const data = json.data;
  const TDs = data.filter(TD => {
    return TD.relationships["document-category"].data.id === "TD";
  });

  // console.log("documents() data", data);
  // console.log("documents() TDs", TDs);

  const names = TDs.map(TD => {
    return TD.attributes.name;
  });
  const uniques = [...new Set(names)];
  const sorted = uniques.sort();

  console.log(sorted);

  const products = document.querySelectorAll(".product-row");
  products.forEach(product => {
    const name = product.querySelector(".product-name h3").innerText;
    const matches = TDs.filter(TD => {
      return TD.attributes.name.toUpperCase() === `TD ${name.toUpperCase()}`;
    });
    console.log("documents()", name, matches);
    const details = product.querySelector(".product-details");
    const documents = product.querySelectorAll(".product-document-link");
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
      const locale = TD.relationships.language.data.id;
      const language = {
        en: "English",
        fr: "Français",
        de: "Deutsch"
      }[locale];
      const html = `
        <div class="product-document-link ${locale}">
          <span class="file">
            <img class="file-icon" alt="" title="application/pdf" src="/assets/images/application-pdf.png">
            <a
              href="https://cdn.interflux.com/${TD.attributes.path}"
              target="_blank"
              rel="noopener noreferrer"
            >${TD.attributes.name} (${language})</a>
          </span>
        </div>
      `;
      details.insertAdjacentHTML("afterend", html);
    });
  });
}
