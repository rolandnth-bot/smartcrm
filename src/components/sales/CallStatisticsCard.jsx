import { useMemo } from 'react';
import Button from '../common/Button';

/**
 * Hívás statisztika kártya - összesítő a script időzítésekről
 */
const CallStatisticsCard = ({ scriptTimings, scriptSections, onFinishCall }) => {
  // Számítások
  const stats = useMemo(() => {
    const timings = Object.values(scriptTimings).filter(t => t > 0);

    if (timings.length === 0) {
      return {
        totalTime: 0,
        averageTime: 0,
        longestSection: null,
        shortestSection: null,
        sectionsWithTime: []
      };
    }

    const totalTime = timings.reduce((sum, t) => sum + t, 0);
    const averageTime = Math.floor(totalTime / timings.length);

    // Szakaszok rendezése idő szerint
    const sectionsWithTime = Object.entries(scriptTimings)
      .filter(([_, time]) => time > 0)
      .map(([sectionId, time]) => ({
        id: sectionId,
        name: scriptSections[sectionId] || `${sectionId}. pont`,
        time: time
      }))
      .sort((a, b) => b.time - a.time);

    const longestSection = sectionsWithTime[0] || null;
    const shortestSection = sectionsWithTime[sectionsWithTime.length - 1] || null;

    return {
      totalTime,
      averageTime,
      longestSection,
      shortestSection,
      sectionsWithTime
    };
  }, [scriptTimings, scriptSections]);

  // Időformázás: MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Színkódolás az időtartam alapján
  const getTimeColor = (seconds) => {
    if (seconds < 60) return 'text-green-600 dark:text-green-400';
    if (seconds < 120) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBarColor = (seconds) => {
    if (seconds < 60) return 'bg-green-500 dark:bg-green-600';
    if (seconds < 120) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  // Maximális idő a progress bar-hoz
  const maxTime = stats.sectionsWithTime.length > 0
    ? Math.max(...stats.sectionsWithTime.map(s => s.time))
    : 1;

  if (stats.totalTime === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 shadow-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
          📊 Hívás statisztika
        </h3>
        <Button
          onClick={onFinishCall}
          variant="primary"
          size="sm"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          ✅ Hívás befejezése
        </Button>
      </div>

      {/* Összesítő metrikák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Összes időtartam</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {formatTime(stats.totalTime)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Átlagos időtartam</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {formatTime(stats.averageTime)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Pontok száma</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.sectionsWithTime.length} / {Object.keys(scriptSections).length}
          </div>
        </div>
      </div>

      {/* Leghosszabb/legrövidebb */}
      {stats.longestSection && stats.shortestSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
            <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">⏱️ Leghosszabb pont</div>
            <div className="text-sm font-semibold text-red-800 dark:text-red-300">
              {stats.longestSection.name}
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              {formatTime(stats.longestSection.time)}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">⚡ Legrövidebb pont</div>
            <div className="text-sm font-semibold text-green-800 dark:text-green-300">
              {stats.shortestSection.name}
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
              {formatTime(stats.shortestSection.time)}
            </div>
          </div>
        </div>
      )}

      {/* Részletes időzítések - progress bar-okkal */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">
          Pontok részletesen:
        </h4>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
          {stats.sectionsWithTime.map((section) => {
            const percentage = (section.time / maxTime) * 100;
            return (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {section.name}
                  </span>
                  <span className={`text-xs font-bold font-mono ${getTimeColor(section.time)}`}>
                    {formatTime(section.time)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getBarColor(section.time)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Színkódolás magyarázat */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-indigo-200 dark:border-indigo-700">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          &lt; 1 perc
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          1-2 perc
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          &gt; 2 perc
        </span>
      </div>
    </div>
  );
};

export default CallStatisticsCard;
