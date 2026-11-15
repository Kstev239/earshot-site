// Earshot website: highlights the download for the visitor's system.
// Works without it: every link is a plain link. No tracking, no storage.
(function () {
  "use strict";

  /** "mac", "windows" or null. */
  function detectSystem() {
    var data = navigator.userAgentData;
    var platform = (data && data.platform) || navigator.platform || "";
    var agent = navigator.userAgent || "";
    if (/mac/i.test(platform) || /Macintosh/.test(agent)) {
      // iPhone and iPad report "Mac" too in desktop mode; touch tells them apart.
      return navigator.maxTouchPoints > 1 ? null : "mac";
    }
    if (/win/i.test(platform) || /Windows/.test(agent)) {
      return "windows";
    }
    return null;
  }

  var system = detectSystem();
  if (system === null) {
    return;
  }
  var card = document.querySelector('[data-platform="' + system + '"]');
  if (card) {
    card.classList.add("current");
  }
  var hero = document.querySelector("[data-hero-download]");
  var label = hero && hero.getAttribute("data-label-" + system);
  if (hero && label) {
    hero.querySelector("span").textContent = label;
  }
})();
