import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const RouteTransitionLoader = ({ minDurationMs = 500, fadeOutMs = 250 }) => {
  const location = useLocation();
  const hasMountedRef = useRef(false);
  const fadeTimeoutRef = useRef(null);
  const unmountTimeoutRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Skip showing on first mount
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Start overlay
    setIsActive(true);
    setIsFadingOut(false);

    // Begin fade-out after minimum duration
    fadeTimeoutRef.current = setTimeout(() => {
      setIsFadingOut(true);
      // Unmount after fade-out finishes
      unmountTimeoutRef.current = setTimeout(() => {
        setIsActive(false);
        setIsFadingOut(false);
      }, fadeOutMs);
    }, minDurationMs);

    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (unmountTimeoutRef.current) clearTimeout(unmountTimeoutRef.current);
    };
  }, [location.pathname, minDurationMs, fadeOutMs]);

  if (!isActive) return null;

  return (
    <div className={`route-loader-overlay ${isFadingOut ? 'route-loader-overlay--fade-out' : ''}`}>
      <div className="medical-symbol" aria-label="Loading">
        <svg viewBox="0 0 100 100" width="84" height="84" role="img" aria-hidden="true">
          {/* Soft glow circle */}
          <circle cx="50" cy="50" r="36" className="symbol-glow" />
          {/* Medical cross */}
          <g className="symbol-cross">
            <rect x="44" y="28" width="12" height="44" rx="3" ry="3" />
            <rect x="28" y="44" width="44" height="12" rx="3" ry="3" />
          </g>
          {/* Heartbeat line */}
          <polyline
            className="symbol-pulse-line"
            points="18,62 32,62 38,56 44,68 50,50 56,66 62,62 82,62"
          />
        </svg>
      </div>
    </div>
  );
};

export default RouteTransitionLoader; 