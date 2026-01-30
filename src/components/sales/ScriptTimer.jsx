import { useState, useEffect } from 'react';

/**
 * Időmérő komponens - megjeleníti az eltelt időt és óra ikont
 */
const ScriptTimer = ({ isActive, startTime, onTimeUpdate }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isActive || !startTime) {
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // másodpercben
      setElapsedTime(elapsed);

      // Pulse animáció trigger
      setPulse(true);
      setTimeout(() => setPulse(false), 300);

      // Callback az időfrissítéshez
      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, startTime, onTimeUpdate]);

  // Időformázás: MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isActive && elapsedTime === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 rounded-full shadow-sm border border-blue-500 dark:border-blue-600 transition-all duration-300 ${
        pulse ? 'scale-105 shadow-md' : 'scale-100'
      }`}
      style={{ width: '70px', minWidth: '70px' }}
    >
      {/* Óra ikon - animált (kisebb) */}
      <svg
        className={`w-3 h-3 text-white transition-transform duration-500 ${isActive ? 'animate-spin-slow' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
      </svg>

      {/* Időkijelzés (kisebb font) */}
      <span className="text-xs font-mono font-bold text-white tracking-tight">
        {formatTime(elapsedTime)}
      </span>
    </div>
  );
};

export default ScriptTimer;
