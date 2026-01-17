/* =========================================================
   page-transition.js
   smooth page transitions + navigation handling
   ========================================================= */

(function () {
  'use strict';

  const transition = document.getElementById('page-transition');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     initial page load
     --------------------------------------------------------- */
  function init() {
    document.body.classList.add('is-loading');

    window.addEventListener('load', function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('is-loading');
        if (transition) {
          transition.classList.add('exit');
        }
      });
    });
  }

  /* ---------------------------------------------------------
     handle internal link clicks
     --------------------------------------------------------- */
  function handleNavigation() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');

      if (!link) return;
      if (link.hostname !== window.location.hostname) return;
      if (link.hasAttribute('download')) return;
      if (link.getAttribute('target') === '_blank') return;
      if (link.hash && link.pathname === window.location.pathname) return;

      // skip if modifier keys pressed
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      navigateTo(link.href);
    });
  }

  /* ---------------------------------------------------------
     navigate with transition
     --------------------------------------------------------- */
  function navigateTo(url) {
    if (prefersReducedMotion) {
      window.location.href = url;
      return;
    }

    document.body.classList.add('is-leaving');

    if (transition) {
      transition.classList.remove('exit');
    }

    var duration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--t-slow')
    ) * 1000 || 600;

    setTimeout(function () {
      window.location.href = url;
    }, duration);
  }

  /* ---------------------------------------------------------
     handle browser back/forward
     --------------------------------------------------------- */
  function handlePopState() {
    window.addEventListener('popstate', function () {
      document.body.classList.add('is-loading');
      if (transition) {
        transition.classList.remove('exit');
      }
    });
  }

  /* ---------------------------------------------------------
     initialize
     --------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      handleNavigation();
      handlePopState();
    });
  } else {
    init();
    handleNavigation();
    handlePopState();
  }

})();
