const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === "production";
const isDevelopment = NODE_ENV === "development";
const cdnHost = isDevelopment
  ? "http://localhost:9000"
  : "https://cdn.interflux.com";

// Extract methods from Gulp
// https://gulpjs.com/docs/en/api/src
const { src, dest, series, parallel, watch } = require("gulp");

// Import plugins
// https://gulpjs.com/docs/en/getting-started/using-plugins
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const connect = require("gulp-connect");
const del = require("del");
const eslint = require("gulp-eslint");
const normalize = require("node-normalize-scss");
const nunjucksRender = require("gulp-nunjucks-render");
const prettify = require("gulp-jsbeautifier");
const rename = require("gulp-rename");
const sass = require("gulp-dart-sass");
const size = require("gulp-size");
const webpack = require("webpack-stream");

// Removes the dist folder
function clean() {
  return del(["dist"]);
}

// Copies over all files from `src/public` as they are to `dist/`
function assets() {
  return src("src/public/**/*").pipe(dest("dist/"));
}

// Compiles all the HTML
function html() {
  return src("src/html/pages/**/*.+(html|njk)")
    .pipe(
      nunjucksRender({
        path: ["src/html"],
        data: {
          cdnHost,
          isProduction,
          isDevelopment
        }
      })
    )
    .pipe(
      prettify({
        html: {
          indent_inner_html: true,
          indent_size: 2,
          max_preserve_newlines: 0
        }
      })
    )
    .pipe(dest("dist"));
}

// Compiles all the CSS
function css() {
  return src("src/css/app.scss")
    .pipe(
      sass({
        outputStyle: "compressed",
        includePaths: normalize.includePaths
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(rename("app.min.css"))
    .pipe(dest("dist/assets/css"));
}

// Check your JS syntax against ES Lint
function lintJs() {
  return src("src/js/app.js")
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Build the main JS file
// https://webpack.js.org/guides/integrations/#gulp
function buildJs() {
  return src("src/js/app.js")
    .pipe(
      webpack({
        mode: "development"
      })
    )
    .pipe(rename("app.min.js"))
    .pipe(dest("dist/assets/js"));
}

// Concatenate all vendor JS
function concatVendorJs() {
  return src([
    "src/js/vendor/google-analytics.js"
    // "src/js/vendor/jquery.js",
    // "src/js/vendor/jquery.easing.js",
    // "src/js/vendor/jquery.imagesloaded.js",
    // "src/js/vendor/jquery.once.js"
  ])
    .pipe(concat("vendor.min.js"))
    .pipe(dest("dist/assets/js"));
}

// Reports an overview of the `dist/` folder
function report() {
  return src(["dist/**/*"]).pipe(
    size({
      showFiles: true,
      showTotal: false
    })
  );
}

// Spins up a localhost server on http://localhost:9000
function localhost() {
  connect.server({
    root: "dist",
    port: 9100
  });
}

// Watches the `src/` folder for file changes and fires tasks accordingly
// https://gulpjs.com/docs/en/getting-started/watching-files
function watchers() {
  watch("src/public/**/*", assets);
  watch("src/html/**/*.njk", html);
  watch("src/css/**/*.scss", css);
  watch("src/js/**/*.js", js);
}

// Create Gulp commands
// https://gulpjs.com/docs/en/getting-started/creating-tasks
const js = parallel(concatVendorJs, series(lintJs, buildJs));
const build = series(clean, parallel(assets, html, css, js), report);
const serve = series(build, parallel(localhost, watchers));

// Finally make those tasks available in Gulp CLI
exports.build = build;
exports.serve = serve;
