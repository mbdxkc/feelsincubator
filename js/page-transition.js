/* =========================================================
   page-transition.js
   Glitch/RGB split page transitions
   =========================================================
   Author:   Valdez Campos (dez@mediabrilliance.io)
   Studio:   mediaBrilliance designxtudio
   Date:     2026-01-17
   Version:  1.0

   Description:
   ------------
   Handles page transitions with a cyberpunk glitch effect.
   Creates visual disruption through clip-path animations,
   RGB channel splitting, and scan line interference.

   Features:
   - Glitch entrance animation on page load
   - Glitch exit animation on internal navigation
   - Dynamically generated interference lines
   - Respects prefers-reduced-motion accessibility setting

   Dependencies:
   - Requires #page-transition element in HTML
   - Requires corresponding CSS animations in style.css
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIGURATION & STATE
     ---------------------------------------------------------
     Cache DOM elements and check user motion preferences.
     --------------------------------------------------------- */

  // Main transition overlay element
  var transition = document.getElementById('page-transition');

  // Check if user prefers reduced motion (accessibility)
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------------------------------------------------------
     GLITCH LINES GENERATION
     ---------------------------------------------------------
     Creates random horizontal interference lines that appear
     during the glitch transition. Lines are positioned randomly
     with varying heights and opacities for organic feel.
     --------------------------------------------------------- */
  function createGlitchLines() {
    // Exit if transition element doesn't exist
    if (!transition) return;

    // Create container for interference lines
    var container = document.createElement('div');
    container.className = 'glitch-lines';

    // Generate 20 random horizontal lines
    for (var i = 0; i < 20; i++) {
      var line = document.createElement('span');

      // Random vertical position (0-100% of screen height)
      line.style.top = (Math.random() * 100) + '%';

      // Random line height (1-4px)
      line.style.height = (Math.random() * 3 + 1) + 'px';

      // Random opacity (0-0.5) for varied intensity
      line.style.opacity = Math.random() * 0.5;

      container.appendChild(line);
    }

    // Append lines container to transition overlay
    transition.appendChild(container);
  }


  /* ---------------------------------------------------------
     PAGE LOAD INITIALIZATION
     ---------------------------------------------------------
     Triggers the glitch entrance animation when the page
     first loads. The animation sequence:
     1. Add glitching class to body
     2. Activate glitch overlay
     3. After animation, remove overlay
     4. Clean up classes
     --------------------------------------------------------- */
  function init() {
    // Generate interference lines on init
    createGlitchLines();

    // Skip animations if user prefers reduced motion
    if (!prefersReducedMotion) {
      // Add glitching state to body (triggers content animation)
      document.body.classList.add('is-glitching');

      // Small delay before starting overlay animation
      // Allows content to begin its glitch-in effect
      setTimeout(function () {
        if (transition) {
          transition.classList.add('glitch-active');
        }
      }, 50);

      // After entrance animation completes, start exit
      setTimeout(function () {
        if (transition) {
          // Remove entrance class
          transition.classList.remove('glitch-active');
          // Add exit class to fade out overlay
          transition.classList.add('glitch-exit');
        }

        // After exit animation, clean up all classes
        setTimeout(function () {
          document.body.classList.remove('is-glitching');
          if (transition) {
            transition.classList.remove('glitch-exit');
          }
        }, 400); // Exit animation duration

      }, 500); // Entrance animation duration
    }
  }


  /* ---------------------------------------------------------
     INTERNAL LINK CLICK HANDLER
     ---------------------------------------------------------
     Intercepts clicks on internal links to add transition
     effect before navigation. Filters out:
     - External links (different hostname)
     - Download links
     - Target="_blank" links
     - Anchor links on same page
     - Clicks with modifier keys (Ctrl, Cmd, etc.)
     --------------------------------------------------------- */
  function handleNavigation() {
    document.addEventListener('click', function (e) {
      // Find the closest anchor element (handles nested elements)
      var link = e.target.closest('a');

      // Exit if not a link
      if (!link) return;

      // Exit if external link (different domain)
      if (link.hostname !== window.location.hostname) return;

      // Exit if download link
      if (link.hasAttribute('download')) return;

      // Exit if opens in new tab
      if (link.getAttribute('target') === '_blank') return;

      // Exit if anchor link on same page (e.g., #section)
      if (link.hash && link.pathname === window.location.pathname) return;

      // Exit if modifier keys pressed (allow browser default behavior)
      // Ctrl+click, Cmd+click open in new tab; Shift+click opens in new window
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // Prevent default navigation
      e.preventDefault();

      // Trigger transition then navigate
      navigateTo(link.href);
    });
  }


  /* ---------------------------------------------------------
     NAVIGATE WITH GLITCH TRANSITION
     ---------------------------------------------------------
     Triggers the exit glitch animation before navigating
     to a new page. For users who prefer reduced motion,
     navigates immediately without animation.

     @param {string} url - The URL to navigate to
     --------------------------------------------------------- */
  function navigateTo(url) {
    // Skip animation for reduced motion preference
    if (prefersReducedMotion) {
      window.location.href = url;
      return;
    }

    // Add leaving state to body (triggers content exit animation)
    document.body.classList.add('is-leaving');

    // Show glitch overlay
    if (transition) {
      transition.classList.add('glitch-active');
    }

    // Navigate after glitch animation completes
    // Timing matches CSS animation duration
    setTimeout(function () {
      window.location.href = url;
    }, 450);
  }


  /* ---------------------------------------------------------
     BROWSER HISTORY HANDLER
     ---------------------------------------------------------
     Handles browser back/forward button navigation.
     Triggers glitch effect when user navigates through
     browser history.
     --------------------------------------------------------- */
  function handlePopState() {
    window.addEventListener('popstate', function () {
      // Add glitching state
      document.body.classList.add('is-glitching');

      // Show glitch overlay
      if (transition) {
        transition.classList.add('glitch-active');
      }
    });
  }


  /* ---------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------
     Wait for DOM to be ready, then initialize all handlers.
     Uses DOMContentLoaded if document is still loading,
     otherwise initializes immediately.
     --------------------------------------------------------- */
  if (document.readyState === 'loading') {
    // DOM not ready yet, wait for it
    document.addEventListener('DOMContentLoaded', function () {
      init();
      handleNavigation();
      handlePopState();
    });
  } else {
    // DOM already ready, initialize now
    init();
    handleNavigation();
    handlePopState();
  }

})();
