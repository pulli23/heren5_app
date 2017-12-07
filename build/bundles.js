module.exports = {
  "bundles": {
    "static/dist/rel/app-build": {
      "includes": [
        "[rel/*.js]",
        "rel/*.html!text",
        "rel/*.css!text",
        "hash-set"
      ],
      "options": {
        "inject": true,
        "minify": false,
        "depCache": false,
        "rev": false
      }
    },
    "static/dist/rel/aurelia": {
      "includes": [
        "aurelia-framework",
        "aurelia-bootstrapper",
        "aurelia-fetch-client",
        "aurelia-router",
        "aurelia-animator-css",
        "aurelia-templating-binding",
        "aurelia-polyfills",
        "aurelia-templating-resources",
        "aurelia-templating-router",
        "aurelia-loader-default",
        "aurelia-history-browser",
        "aurelia-logging-console",
        "bootstrap",
        "bootstrap/css/bootstrap.css!text",
        "fetch",
        "jquery"
      ],
      "options": {
        "inject": true,
        "minify": true,
        "depCache": false,
        "rev": false
      }
    }
  }
};
