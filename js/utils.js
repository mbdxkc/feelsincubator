/* =========================================================
   utils.js
   Common UI interactions
   =========================================================
   Author:   Valdez Campos (dez@mediabrilliance.io)
   Studio:   mediaBrilliance designxtudio
   Date:     2026-01-17
   Version:  1.0

   Description:
   ------------
   Provides common UI interaction handlers used across
   the site. Includes mobile navigation, modal dialogs,
   and smooth scrolling for anchor links.

   Features:
   - Mobile hamburger menu toggle
   - Modal open/close with overlay
   - Smooth scroll to anchor targets
   - Keyboard accessibility (Escape to close)

   Dependencies:
   - Requires .nav-toggle and .mobile-menu elements for mobile nav
   - Requires .modal and .overlay elements for modals
   - Requires .site-header for scroll offset calculation
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     MOBILE NAVIGATION
     ---------------------------------------------------------
     Handles the hamburger menu toggle for mobile viewports.

     Behavior:
     - Clicking toggle button opens/closes menu
     - Escape key closes menu
     - Clicking a link inside menu closes it
     - Body scroll is locked when menu is open
     --------------------------------------------------------- */
  function initMobileNav() {
    // Get required elements
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');

    // Exit if elements don't exist (not all pages may have mobile nav)
    if (!toggle || !menu) return;

    /**
     * Toggle menu visibility on button click
     * Updates ARIA attribute for screen readers
     * Locks body scroll when menu is open
     */
    toggle.addEventListener('click', function () {
      // Check current state
      var isOpen = menu.classList.contains('is-active');

      // Toggle the active class
      menu.classList.toggle('is-active');

      // Update ARIA expanded state for accessibility
      toggle.setAttribute('aria-expanded', !isOpen);

      // Prevent body scrolling when menu is open
      // Empty string removes the property
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    /**
     * Close menu when Escape key is pressed
     * Standard accessibility pattern for dismissible overlays
     */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-active')) {
        menu.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    /**
     * Close menu when a link inside is clicked
     * Allows navigation to proceed after menu closes
     */
    menu.addEventListener('click', function (e) {
      if (e.target.matches('a')) {
        menu.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }


  /* ---------------------------------------------------------
     MODAL HANDLING
     ---------------------------------------------------------
     Generic modal dialog system using data attributes.

     Usage:
     - Add data-modal-open="modalId" to trigger buttons
     - Add data-modal-close to close buttons
     - Clicking overlay also closes modal

     Example HTML:
     <button data-modal-open="myModal">Open</button>
     <div class="modal" id="myModal">
       <button data-modal-close>Close</button>
     </div>
     <div class="overlay"></div>
     --------------------------------------------------------- */
  function initModals() {
    /**
     * Handle all modal-related clicks via event delegation
     * More efficient than attaching listeners to each button
     */
    document.addEventListener('click', function (e) {
      // Check if click was on a modal open trigger
      var trigger = e.target.closest('[data-modal-open]');

      if (trigger) {
        // Get the modal ID from data attribute
        var modalId = trigger.getAttribute('data-modal-open');
        var modal = document.getElementById(modalId);
        var overlay = document.querySelector('.overlay');

        if (modal) {
          // Show modal and overlay
          modal.classList.add('is-active');
          if (overlay) overlay.classList.add('is-active');

          // Lock body scroll
          document.body.style.overflow = 'hidden';
        }
        return;
      }

      // Check if click was on a modal close trigger
      var closer = e.target.closest('[data-modal-close]');

      // Also close if clicking directly on overlay
      if (closer || e.target.matches('.overlay')) {
        closeAllModals();
      }
    });

    /**
     * Close modals on Escape key
     * Standard accessibility pattern
     */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  /**
   * Close all open modals and overlay
   * Resets body scroll lock
   */
  function closeAllModals() {
    // Find all active modals
    var modals = document.querySelectorAll('.modal.is-active');
    var overlay = document.querySelector('.overlay.is-active');

    // Remove active class from each modal
    modals.forEach(function (modal) {
      modal.classList.remove('is-active');
    });

    // Hide overlay
    if (overlay) overlay.classList.remove('is-active');

    // Restore body scroll
    document.body.style.overflow = '';
  }


  /* ---------------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     ---------------------------------------------------------
     Provides smooth scrolling behavior for same-page anchor
     links (e.g., href="#section").

     Features:
     - Accounts for sticky header height
     - Updates URL without triggering scroll
     - Uses native smooth scroll behavior
     --------------------------------------------------------- */
  function initSmoothScroll() {
    /**
     * Handle clicks on anchor links via event delegation
     */
    document.addEventListener('click', function (e) {
      // Find anchor link with hash href
      var link = e.target.closest('a[href^="#"]');

      // Exit if not an anchor link
      if (!link) return;

      // Get the target ID
      var targetId = link.getAttribute('href');

      // Exit if href is just "#" (often used as placeholder)
      if (targetId === '#') return;

      // Find the target element
      var target = document.querySelector(targetId);

      // Exit if target doesn't exist
      if (!target) return;

      // Prevent default jump behavior
      e.preventDefault();

      // Calculate scroll position accounting for sticky header
      // Optional chaining fallback for browsers without header
      var headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;

      // Get target's position relative to document top
      var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      // Perform smooth scroll
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL hash without triggering scroll
      // Uses pushState to avoid the default hash jump
      history.pushState(null, '', targetId);
    });
  }


  /* ---------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------
     Initialize all utility functions when DOM is ready.
     --------------------------------------------------------- */
  function init() {
    initMobileNav();
    initModals();
    initSmoothScroll();
  }

  // Wait for DOM if still loading, otherwise init immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
