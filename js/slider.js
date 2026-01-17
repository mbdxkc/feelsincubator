/* =========================================================
   slider.js
   Horizontal portfolio slider with drag + touch support
   =========================================================
   Author:   Valdez Campos (dez@mediabrilliance.io)
   Studio:   mediaBrilliance designxtudio
   Date:     2026-01-17
   Version:  1.0

   Description:
   ------------
   A vanilla JavaScript horizontal slider/carousel for the
   portfolio section. Supports multiple input methods for
   broad device compatibility.

   Features:
   - Button navigation (prev/next)
   - Mouse drag support
   - Touch swipe support
   - Keyboard navigation (arrow keys)
   - Responsive card sizing
   - Smooth CSS transitions

   Dependencies:
   - Requires .slider-track element with .project-card children
   - Requires [data-slider="prev"] and [data-slider="next"] buttons
   - Requires corresponding CSS in style.css
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     DOM ELEMENT REFERENCES
     ---------------------------------------------------------
     Cache DOM queries for performance.
     --------------------------------------------------------- */

  // The scrollable track containing all cards
  var track = document.querySelector('.slider-track');

  // Navigation buttons
  var prevBtn = document.querySelector('[data-slider="prev"]');
  var nextBtn = document.querySelector('[data-slider="next"]');

  // Exit early if slider doesn't exist on this page
  if (!track) return;

  // Get all project cards
  var cards = track.querySelectorAll('.project-card');


  /* ---------------------------------------------------------
     STATE VARIABLES
     ---------------------------------------------------------
     Track slider dimensions and current position.
     --------------------------------------------------------- */

  var cardWidth = 0;      // Width of a single card (pixels)
  var gap = 24;           // Gap between cards (pixels, matches CSS)
  var currentIndex = 0;   // Current slide position (0-based)
  var maxIndex = 0;       // Maximum slide index

  // Drag interaction state
  var isDragging = false; // Is user currently dragging?
  var startX = 0;         // X position where drag started
  var currentX = 0;       // Current X position during drag
  var translateX = 0;     // Current transform offset


  /* ---------------------------------------------------------
     DIMENSION CALCULATIONS
     ---------------------------------------------------------
     Calculate card dimensions and determine how many cards
     fit in the viewport. Called on init and window resize.
     --------------------------------------------------------- */
  function calculateDimensions() {
    // Exit if no cards exist
    if (cards.length === 0) return;

    // Get dimensions from first card
    var card = cards[0];
    var style = getComputedStyle(track);

    // Get actual card width from DOM
    cardWidth = card.offsetWidth;

    // Parse gap from CSS (fallback to 24px)
    gap = parseInt(style.gap) || 24;

    // Calculate how many cards fit in the container
    var containerWidth = track.parentElement.offsetWidth;
    var visibleCards = Math.floor(containerWidth / (cardWidth + gap));

    // Max index is total cards minus visible cards
    // Ensures last slide shows remaining cards
    maxIndex = Math.max(0, cards.length - visibleCards);

    // Clamp current index if window was resized smaller
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
      updatePosition(false); // Update without animation
    }
  }


  /* ---------------------------------------------------------
     POSITION UPDATE
     ---------------------------------------------------------
     Updates the slider track's transform position.
     Optionally animates the transition.

     @param {boolean} animate - Whether to use CSS transition
     --------------------------------------------------------- */
  function updatePosition(animate) {
    // Default to animated transition
    if (animate === undefined) animate = true;

    // Calculate new X offset based on current index
    // Negative because we move track left to show later cards
    translateX = -currentIndex * (cardWidth + gap);

    // Toggle transition class for animation control
    if (animate) {
      track.classList.remove('is-dragging');
    } else {
      track.classList.add('is-dragging');
    }

    // Apply the transform
    track.style.transform = 'translateX(' + translateX + 'px)';
  }


  /* ---------------------------------------------------------
     NAVIGATION FUNCTIONS
     ---------------------------------------------------------
     Move to previous or next slide.
     Bounds-checked to prevent scrolling past edges.
     --------------------------------------------------------- */

  /**
   * Navigate to previous slide
   * Only moves if not already at first slide
   */
  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updatePosition();
    }
  }

  /**
   * Navigate to next slide
   * Only moves if not already at last slide
   */
  function goToNext() {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updatePosition();
    }
  }


  /* ---------------------------------------------------------
     BUTTON EVENT HANDLERS
     ---------------------------------------------------------
     Attach click handlers to navigation buttons.
     --------------------------------------------------------- */
  if (prevBtn) {
    prevBtn.addEventListener('click', goToPrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', goToNext);
  }


  /* ---------------------------------------------------------
     KEYBOARD NAVIGATION
     ---------------------------------------------------------
     Allow arrow keys to navigate when slider is visible
     in viewport. Only activates when slider section is
     at least partially visible.
     --------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    // Find the portfolio section containing the slider
    var section = track.closest('.portfolio-section');
    if (!section) return;

    // Check if section is visible in viewport
    var rect = section.getBoundingClientRect();
    var isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    // Only respond to keys if slider is visible
    if (!isVisible) return;

    // Handle arrow keys
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  });


  /* ---------------------------------------------------------
     DRAG / TOUCH HANDLERS
     ---------------------------------------------------------
     Enable mouse drag and touch swipe interactions.
     Uses same handlers for both input types with
     event type detection.
     --------------------------------------------------------- */

  /**
   * Start drag interaction
   * Records starting position and enables dragging state
   *
   * @param {MouseEvent|TouchEvent} e - The input event
   */
  function onDragStart(e) {
    // Note: We don't prevent default here to allow links to work
    // Click prevention is handled in onDragEnd if drag occurred

    isDragging = true;

    // Get X position from mouse or touch event
    startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    currentX = startX;

    // Disable CSS transition for immediate feedback
    track.classList.add('is-dragging');
  }

  /**
   * Handle drag movement
   * Updates track position to follow cursor/finger
   *
   * @param {MouseEvent|TouchEvent} e - The input event
   */
  function onDragMove(e) {
    // Exit if not currently dragging
    if (!isDragging) return;

    // Prevent default to stop text selection and scrolling
    e.preventDefault();

    // Get current X position
    var x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;

    // Calculate distance dragged
    var diff = x - startX;

    // Update track position (base offset + drag distance)
    track.style.transform = 'translateX(' + (translateX + diff) + 'px)';

    // Store current position for end calculation
    currentX = x;
  }

  /**
   * End drag interaction
   * Determines if drag was enough to change slides,
   * then snaps to nearest slide position
   *
   * @param {MouseEvent|TouchEvent} e - The input event
   */
  function onDragEnd(e) {
    // Exit if not currently dragging
    if (!isDragging) return;

    isDragging = false;
    track.classList.remove('is-dragging');

    // Calculate total drag distance
    var diff = currentX - startX;

    // Threshold: must drag at least 1/4 of card width to change slides
    var threshold = cardWidth / 4;

    // Determine if drag was significant enough to navigate
    if (diff > threshold && currentIndex > 0) {
      // Dragged right (show previous) - only if not at start
      currentIndex--;
    } else if (diff < -threshold && currentIndex < maxIndex) {
      // Dragged left (show next) - only if not at end
      currentIndex++;
    }

    // Snap to calculated position with animation
    updatePosition();

    // Prevent accidental link clicks after dragging
    // If user dragged more than 10px, block the click
    if (Math.abs(diff) > 10) {
      var preventClick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        // Remove handler after it fires once
        track.removeEventListener('click', preventClick, true);
      };
      // Use capture phase to intercept before link handler
      track.addEventListener('click', preventClick, true);
    }
  }


  /* ---------------------------------------------------------
     EVENT LISTENER ATTACHMENT
     ---------------------------------------------------------
     Attach drag/touch handlers to appropriate elements.
     --------------------------------------------------------- */

  // Mouse events (desktop)
  track.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  // Touch events (mobile/tablet)
  // passive: true on touchstart for better scroll performance
  // passive: false on touchmove to allow preventDefault
  track.addEventListener('touchstart', onDragStart, { passive: true });
  track.addEventListener('touchmove', onDragMove, { passive: false });
  track.addEventListener('touchend', onDragEnd);


  /* ---------------------------------------------------------
     RESIZE HANDLER
     ---------------------------------------------------------
     Recalculate dimensions when window is resized.
     Debounced to prevent excessive calculations.
     --------------------------------------------------------- */
  var resizeTimer;

  window.addEventListener('resize', function () {
    // Clear any pending recalculation
    clearTimeout(resizeTimer);

    // Wait 100ms after resize stops before recalculating
    resizeTimer = setTimeout(calculateDimensions, 100);
  });


  /* ---------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------
     Calculate initial dimensions when DOM is ready.
     Also recalculate after images load (may affect card size).
     --------------------------------------------------------- */
  function init() {
    calculateDimensions();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Recalculate after all images load (affects card dimensions)
  window.addEventListener('load', calculateDimensions);

})();
