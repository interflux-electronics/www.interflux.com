const request = require("request-promise");
const HTMLParser = require("node-html-parser");
const prettydiff = require("prettydiff");
const mkdir = require("mkdirp");
const fs = require("fs");

const init = async () => {
  console.log(`------`);
  console.log(`Scraping interflux.com`);

  const arr = [];

  prepare(arr);

  await scrape(arr);

  build(arr);
  clean(arr);
  write(arr);

  console.log(`------`);
  console.log(`Done!`);
  console.log(`------`);
};

const prepare = arr => {
  const host = "http://www.interflux.com";
  const locales = ["/en", "/de"];
  const paths = [
    "",
    "/soldering-fluxes",
    "/solder-pastes",
    "/solder-wires",
    "/spray-fluxers",
    "/auxiliaries",
    "/wave-soldering",
    "/selective-soldering",
    "/reflow-soldering",
    "/rework-and-repair",
    "/pre-tinning",
    "/company",
    "/documents",
    "/contact"
  ];

  locales.forEach(locale => {
    paths.forEach(path => {
      const url = `${host}${locale}${path}`;
      const uri = `${locale}${path}`;
      arr.push({ url, uri });
    });
  });

  console.log(`------`);
  console.log(`URLs to scrape: ${arr.length}`);
  console.log(`------`);
};

async function scrape(arr) {
  const promises = [];
  arr.forEach(page => {
    promises.push(fetch(page));
  });
  return Promise.all(promises);
}

async function fetch(page) {
  console.log(`Scraping ${page.url}`);

  const success = html => {
    console.log("COMPLETED", page.url);
    page.dom = HTMLParser.parse(html);
    page.id = page.uri.replace(/^\//g, "").replace("/", "-");
    page.class = page.dom.querySelector("body").classNames.join(" ");
    page.title = page.dom.querySelector("head title").rawText;
    page.corpus = page.dom.querySelector(".region.region-corpus").innerHTML;
    page.hasHighlight = page.dom.querySelector(".region.region-highlight")
      ? true
      : false;
    page.hasFooter = page.dom.querySelector(".region.region-footer2")
      ? true
      : false;
  };

  const fail = () => {
    console.error("FAILED", page.url);
  };

  return request(page.url)
    .then(success)
    .catch(fail);
}

const build = arr => {
  console.log(`------`);
  console.log(`Building Nunjuck templates (HTML) with scraped data`);

  arr.forEach(page => {
    page.html = `{% extends "layout.html.njk" %}

    {% block meta %}
      <title>${page.title}</title>
      {# <meta name="description" content=""> #}
    {% endblock %}

    {% block bodyId %}${page.id}{% endblock %}
    {% block bodyClass %}${page.class}{% endblock %}

    {% block page %}
      ${page.hasHighlight ? '{% include "partials/highlight.njk" %}' : ""}

      <div class="region region-corpus">
        <div class="inner-region">
          ${page.corpus}
        </div>
      </div>

      ${page.hasFooter ? '{% include "partials/footer.njk" %}' : ""}
    {% endblock %}`;
  });
};

const clean = arr => {
  console.log(`------`);
  console.log(`Cleaning up the HTML`);

  prettydiff.options.mode = "beautify";
  prettydiff.options.language = "nunjucks";
  prettydiff.options.indent_size = 2;

  arr.forEach(page => {
    prettydiff.options.source = page.html;
    page.clean = prettydiff();
  });
};

const write = arr => {
  console.log(`------`);
  console.log(`Writing files`);

  arr.forEach(page => {
    const dir = `src/html/pages${page.uri}`;
    const dest = `src/html/pages${page.uri}/index.njk`;

    mkdir(dir, err => {
      if (err) console.error(err);

      console.log(`Created directory: ${dir}`);

      fs.writeFile(dest, page.clean, err => {
        if (err) console.log(err);

        console.log(`Created file: ${dest}`);
      });
    });
  });
};

init();
