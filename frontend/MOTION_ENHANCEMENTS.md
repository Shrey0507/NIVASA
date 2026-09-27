/* Motion Enhancements - Add to theme.css for Phase 2 */
/* These are subtle, purposeful transitions inspired by Awwwards principles */

/* Page Load Animation */
@keyframes pageEnter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.admin-content {
  animation: pageEnter 0.3s ease-out;
}

/* Enhanced Button Interactions */
.btn {
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  pointer-events: none;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

/* Card Elevation on Hover */
.card {
  /* Already has transform in hover, but can add perspective */
}

/* Sidebar Item Slide Animation */
.admin-sidebar-nav-item:hover {
  /* Already has translateX(4px), keeping this */
}

/* Form Input Focus Glow */
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  /* Already has box-shadow, enhanced visually */
}

/* Table Row Hover Smooth */
.table tbody tr:hover {
  /* Already smooth with transition */
}

/* Dialog Smooth Entry */
.dialog-overlay {
  /* Already has fadeIn animation */
}

.dialog-content {
  /* Already has slideUp animation */
}

/* Loading Spinner Enhancement */
.spinner {
  /* Already animating with spin keyframe */
  box-shadow: 0 0 10px hsl(var(--primary) / 0.2);
}

/* Tooltip/Hover Text (if needed) */
[title] {
  transition: all 0.2s ease;
}

/* Badge Pulse on Status Change (optional) */
@keyframes subtle-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 hsl(var(--primary) / 0.7);
  }
  50% {
    box-shadow: 0 0 0 4px hsl(var(--primary) / 0);
  }
}

/* Reduced Motion: Disable all animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
