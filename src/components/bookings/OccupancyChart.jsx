import { useMemo } from 'react';
import Card from '../common/Card';

/**
 * Foglaltságjelz diagram
 * Mutatja az egyes lakások lezártsági százalékát
 */
const OccupancyChart = ({ bookings, apartments }) => {
  const occupancyData = useMemo(() => {
    if (!apartments.length) return [];

    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return apartments
      .map((apt) => {
        const bookedDays = bookings
          .filter((b) => {
            if (b.apartmentId !== apt.id) return false;
            if (b.status !== 'confirmed' && b.status !== 'checked_out') return false;
            const checkIn = new Date(b.dateFrom || b.checkIn);
            const checkOut = new Date(b.dateTo || b.checkOut);
            return checkIn < thirtyDaysLater && checkOut > today;
          })
          .reduce((days, b) => {
            const checkIn = new Date(b.dateFrom || b.checkIn);
            const checkOut = new Date(b.dateTo || b.checkOut);
            const start = checkIn > today ? checkIn : today;
            const end = checkOut < thirtyDaysLater ? checkOut : thirtyDaysLater;
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return days + Math.max(0, diff);
          }, 0);

        const occupancy = Math.round((bookedDays / 30) * 100);
        return {
          id: apt.id,
          name: apt.name,
          occupancy: Math.min(100, occupancy),
          bookedDays
        };
      })
      .sort((a, b) => b.occupancy - a.occupancy);
  }, [bookings, apartments]);

  if (!occupancyData.length) {
    return null;
  }

  const avgOccupancy = Math.round(
    occupancyData.reduce((sum, item) => sum + item.occupancy, 0) / occupancyData.length
  );

  const getOccupancyColor = (occupancy) => {
    if (occupancy >= 80) return 'bg-green-500';
    if (occupancy >= 60) return 'bg-blue-500';
    if (occupancy >= 40) return 'bg-yellow-500';
    if (occupancy >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOccupancyTextColor = (occupancy) => {
    if (occupancy >= 80) return 'text-green-600 dark:text-green-400';
    if (occupancy >= 60) return 'text-blue-600 dark:text-blue-400';
    if (occupancy >= 40) return 'text-yellow-600 dark:text-yellow-400';
    if (occupancy >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Foglaltság a következ 30 napban
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgOccupancy}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Átlagos lezártsági ráta</div>
        </div>
      </div>

      {/* Lakások foglaltsági sávja */}
      <div className="space-y-3">
        {occupancyData.map((apt) => (
          <div key={apt.id} className="flex items-center gap-3">
            {/* Lakás név */}
            <div className="w-32 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
              {apt.name}
            </div>

            {/* Foglaltság sáv */}
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getOccupancyColor(apt.occupancy)} transition-all duration-300 flex items-center justify-center text-white text-xs font-semibold`}
                  style={{ width: `${apt.occupancy}%` }}
                >
                  {apt.occupancy > 15 && `${apt.occupancy}%`}
                </div>
              </div>
            </div>

            {/* Százalék */}
            <div className={`w-12 text-right text-sm font-semibold ${getOccupancyTextColor(apt.occupancy)}`}>
              {apt.occupancy}%
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>0-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>20-40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>80%+</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OccupancyChart;
