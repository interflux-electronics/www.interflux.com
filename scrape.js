const request = require("request-promise");
const HTMLParser = require("node-html-parser");
const prettydiff = require("prettydiff");
const mkdir = require("mkdirp");
const fs = require("fs");

const init = async () => {
  console.log(`------`);
  console.log(`Scraping interflux.com`);

  const pages = listPages();

  await fetchPages(pages);

  let success = 0;
  pages.forEach(page => {
    if (page.fetched) {
      success++;
    }
  });

  console.log(`------`);
  console.log(`Pages fetched: ${success} / ${pages.length}`);
  console.log(`------`);

  if (success !== pages.length) {
    console.log(`ABORTING`);
    console.log(`------`);
    return;
  }

  build(pages);
  prettify(pages);
  write(pages);

  console.log(`------`);

  const images = listImages(pages);

  await scrapeImages(images);

  let success2 = 0;
  images.forEach(image => {
    if (image.fetched) {
      success2++;
    }
  });

  console.log(`------`);
  console.log(`Images fetched: ${success2} / ${images.length}`);
  console.log(`------`);
  console.log(`Done!`);
  console.log(`------`);
};

const listPages = () => {
  const arr = [];
  const host = "http://www.interflux.com";
  const locales = [
    "/en",
    "/de",
    "/fr",
    "/zh-hans",
    "/cs",
    "/it",
    "/id",
    "/pt-pt",
    "/ro",
    "/ru",
    "/th",
    "/tr",
    "/pl",
    "/es"
  ];
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
      const fetched = false;
      arr.push({ url, uri, fetched });
    });
  });

  console.log(`------`);
  console.log(`URLs to scrape: ${arr.length}`);
  console.log(`------`);

  return arr;
};

async function fetchPages(pages) {
  const promises = [];
  const concurrency = 10;
  for (let i = 1; i <= concurrency; i++) {
    console.log(`Starting task runner ${i}`);
    const promise = fetchRemainingPage(pages, i);
    promises.push(promise);
  }
  console.log(`------`);
  return Promise.all(promises);
}

async function fetchRemainingPage(pages, i) {
  await setTimeout(() => {}, 1);
  const remainingPage = pages.find(page => {
    return !page.fetched && !page.fetching;
  });
  if (remainingPage) {
    await fetchPage(remainingPage, i);
    return fetchRemainingPage(pages, i);
  }
}

async function fetchPage(page, i) {
  page.fetching = true;
  console.log(`Runner ${i} - Fetching ${page.url}`);
  const success = html => {
    page.fetched = true;
    page.fetching = false;
    page.dom = HTMLParser.parse(html);
    page.id = page.uri.replace(/^\//g, "").replace("/", "-");
    page.class = page.dom.querySelector("body").classNames.join(" ");
    page.title = page.dom.querySelector("head title").rawText;
    page.html = page.dom
      .querySelector("#page")
      .innerHTML.replace(
        /src="http:\/\/www.interflux.com\/sites\/default\/files\//g,
        'src="/assets/images/'
      )
      .replace(
        /src="\/sites\/all\/themes\/zen_interflux\/images\//g,
        'src="/assets/images/'
      )
      .replace(
        /href="http:\/\/www.interflux.com\/sites\/default\/files\/documents\//g,
        'href="/assets/documents/'
      )
      .replace(/src="\/modules\/file\/icons\//g, 'src="/assets/images/')
      .replace(/%20/g, "-")
      .replace(/%C2%B5/g, "micro")
      .replace(/%E2%84%A2-/g, "")
      .replace(/%40/g, "@")
      .replace(/%28/g, "")
      .replace(/%29/g, "");
  };

  const fail = () => {
    page.fetching = false;
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
      ${page.html}
    {% endblock %}`;
  });
};

const prettify = arr => {
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

const listImages = pages => {
  const arr = [];

  pages.forEach(page => {
    const images = page.dom.querySelectorAll("img");
    Array.from(images).forEach(img => {
      const src = img.attributes.src;
      const url = src.replace(/^\//, "http://www.interflux.com/");
      arr.push(url);
    });
  });

  const set = new Set(arr);

  console.log(`------`);
  console.log(`Image URLs found: ${arr.length}`);
  console.log(`Unique image URLs: ${set.size}`);
  console.log(`------`);

  const list = [];
  set.forEach(url => {
    list.push({ url });
  });

  return list;
};

const scrapeImages = async images => {
  const promises = [];
  const concurrency = 5;
  for (let i = 1; i <= concurrency; i++) {
    console.log(`Starting task runner ${i}`);
    const promise = fetchRemainingImage(images, i);
    promises.push(promise);
  }
  console.log(`------`);
  return Promise.all(promises);
};

const fetchRemainingImage = async (images, i) => {
  await setTimeout(() => {}, 1);
  const remainingImage = images.find(image => {
    return !image.fetched && !image.fetching;
  });
  if (remainingImage) {
    await fetchImage(remainingImage, i);
    return fetchRemainingImage(images, i);
  }
};

const fetchImage = async image => {
  console.log(`Fetching ${image.url}`);

  const filename = image.url
    .split(/\//g)
    .pop()
    .replace(/%20/g, "-")
    .replace(/%C2%B5/g, "micro")
    .replace(/%E2%84%A2-/g, "")
    .replace(/%40/g, "@")
    .replace(/%28/g, "")
    .replace(/%29/g, "");
  const path = `src/public/assets/images/${filename}`;

  image.fetching = true;

  return new Promise((resolve, reject) => {
    const error = () => {
      console.log("ERROR");
      image.fetched = false;
      reject();
    };

    const finish = () => {
      console.log("FINISH");
      image.fetched = true;
      resolve();
    };

    const close = () => {
      image.fetching = false;
    };

    return request(image.url)
      .pipe(fs.createWriteStream(path))
      .on("error", error)
      .on("finish", finish)
      .on("close", close);
  });
};

init();
