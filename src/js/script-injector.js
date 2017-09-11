function injectScripts() {
  let script = document.createElement("script");
  script.src = "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert";
  document.body.appendChild(script);
}