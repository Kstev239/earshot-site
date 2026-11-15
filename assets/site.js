// Earshot website. Everything works without this file: links are plain
// links, the demo shows its final state, all sections are visible.
// No tracking, no cookies, no storage.
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Download for the visitor's system ---------------------------------

  /** "mac", "windows" or null. */
  function detectSystem() {
    var data = navigator.userAgentData;
    var platform = (data && data.platform) || navigator.platform || "";
    var agent = navigator.userAgent || "";
    if (/mac/i.test(platform) || /Macintosh/.test(agent)) {
      // iPads report "Mac" in desktop mode; touch tells them apart.
      return navigator.maxTouchPoints > 1 ? null : "mac";
    }
    if (/win/i.test(platform) || /Windows/.test(agent)) {
      return "windows";
    }
    return null;
  }

  var system = detectSystem();
  if (system !== null) {
    var card = document.querySelector('[data-platform="' + system + '"]');
    if (card) {
      card.classList.add("current");
    }
    document.querySelectorAll("[data-label-" + system + "]").forEach(function (el) {
      var target = el.querySelector("span") || el;
      target.textContent = el.getAttribute("data-label-" + system);
    });
  }

  // --- Reveal sections on scroll -------------------------------------------

  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");
    var revealer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("shown");
            revealer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealer.observe(el);
    });
  }

  // --- Demo ----------------------------------------------------------------
  // Steps: 0 captions on the meeting screen, 1 cursor moves to the work
  // screen, 2 captions follow, 3 the name is said, 4 recap open.

  var stage = document.querySelector("[data-demo]");
  var key = document.querySelector("[data-demo-key]");
  var replay = document.querySelector("[data-demo-replay]");
  if (stage && key) {
    var timers = [];
    var setStep = function (step) {
      stage.setAttribute("data-step", String(step));
      key.disabled = step < 3;
      key.classList.toggle("pulse", step === 3);
    };
    var clear = function () {
      timers.forEach(clearTimeout);
      timers = [];
    };
    var play = function () {
      clear();
      setStep(0);
      timers.push(setTimeout(setStep, 1600, 1));
      timers.push(setTimeout(setStep, 2100, 2));
      timers.push(setTimeout(setStep, 3900, 3));
      // Opens by itself if nobody clicks.
      timers.push(setTimeout(setStep, 9000, 4));
    };
    var openRecap = function () {
      if (Number(stage.getAttribute("data-step")) >= 3) {
        clear();
        setStep(4);
      }
    };

    key.addEventListener("click", openRecap);
    // The real shortcut works too: ⌥⌘R on a Mac, Ctrl+Alt+R on Windows.
    document.addEventListener("keydown", function (event) {
      if (event.altKey && (event.metaKey || event.ctrlKey) && event.code === "KeyR") {
        event.preventDefault();
        openRecap();
      }
    });

    if (reducedMotion) {
      // Final state only.
      setStep(4);
      if (replay) {
        replay.hidden = true;
      }
    } else {
      if (replay) {
        replay.addEventListener("click", play);
      }
      if ("IntersectionObserver" in window) {
        var started = false;
        var starter = new IntersectionObserver(
          function (entries) {
            if (!started && entries[0] && entries[0].isIntersecting) {
              started = true;
              starter.disconnect();
              play();
            }
          },
          { threshold: 0.4 },
        );
        starter.observe(stage);
      } else {
        play();
      }
    }
  }

  // --- Copy the terminal command -------------------------------------------

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var source = document.getElementById(button.getAttribute("data-copy") || "");
      if (!source) {
        return;
      }
      var text = source.textContent || "";
      var done = button.getAttribute("data-done") || "✓";
      var label = button.textContent;
      var show = function () {
        button.textContent = done;
        setTimeout(function () {
          button.textContent = label;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(show, function () {
          window.getSelection().selectAllChildren(source);
        });
      } else {
        window.getSelection().selectAllChildren(source);
      }
    });
  });
})();
