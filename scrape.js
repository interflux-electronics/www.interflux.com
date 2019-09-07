const rp = require("request-promise");
const fs = require("fs");
const HTMLParser = require("node-html-parser");
const prettier = require("prettier");
const prettydiff = require("prettydiff");
const mkdirp = require("mkdirp");

const domain = "http://www.interflux.com";
const locales = ["/en", "/de"];
const paths = [
  "",
  "/soldering-fluxes",
  // "/solder-pastes",
  // "/solder-wires",
  // "/flux-sprayer",
  // "/auxiliaries",
  // "/wave-soldering",
  // "/selective-soldering",
  // "/reflow-soldering",
  // "/rework-and-repair",
  // "/pre-tinning",
  // "/company",
  // "/documents",
  "/contact"
];

const template = `
{% extends "layout.html.njk" %}

{% block meta %}
  <title>{{pageTitle}}</title>
  {# <meta name="description" content=""> #}
{% endblock %}

{% block bodyId %}{{bodyId}}{% endblock %}
{% block bodyClass %}{{bodyClass}}{% endblock %}

{% block main %}
  {{pageHtml}}
{% endblock %}
`;

function generateUrls() {
  const arr = [];
  for (let i = 0; i < locales.length; i++) {
    for (let ii = 0; ii < paths.length; ii++) {
      const url = `${domain}${locales[i]}${paths[ii]}`;
      const uri = `${locales[i]}${paths[ii]}`;
      arr.push({ url, uri });
    }
  }
  return arr;
}

function fetch(urls) {
  for (let i = 0; i < urls.length; i++) {
    scrape(urls[i]);
  }
}

function scrape(obj) {
  const { url, uri } = obj;
  console.log(`Scraping ${url}`);
  rp(url)
    .then(function(html) {
      const dom = HTMLParser.parse(html);

      const bodyId = uri.replace(/^\//g, "").replace("/", "-");
      const bodyClass = dom.querySelector("body").classNames.join(" ");
      const pageTitle = dom.querySelector("head title").rawText;
      const pageHtml = dom.querySelector(".region.region-corpus").innerHTML;

      const cleanHtml = prettier.format(pageHtml, { parser: "html" });

      prettydiff.options.source = cleanHtml;
      prettydiff.options.language = "nunjucks";
      prettydiff.options.mode = "beautify";
      prettydiff.options.indent_size = 2;

      const cleanNunjucks = prettydiff();

      const njk = template
        .replace("{{bodyId}}", bodyId)
        .replace("{{bodyClass}}", bodyClass)
        .replace("{{pageTitle}}", pageTitle)
        .replace("{{pageHtml}}", cleanNunjucks);

      const dir = `src/html/pages${uri}`;
      const dest = `src/html/pages${uri}/index.njk`;

      mkdirp(dir, function(err) {
        if (err) console.error(err);

        console.log(`Created directory ${dir}`);

        fs.writeFile(dest, njk, function(err) {
          if (err) console.log(err);
          console.log(`Created ${dest}`);
        });
      });
    })
    .catch(function(err) {
      if (err) console.log(err);
    });
}

const urls = generateUrls();

fetch(urls);
