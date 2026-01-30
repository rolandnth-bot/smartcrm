import { useState, useEffect } from 'react';
import useSettlementsStore from '../stores/settlementsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Upload, Download } from '../components/common/Icons';
import { formatCurrencyEUR, formatNumber } from '../utils/numberUtils';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import SettlementImportModal from '../components/finance/SettlementImportModal';

const SettlementsPage = () => {
  const {
    settlements,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    getFiltered,
    getStats
  } = useSettlementsStore();

  const { apartments } = useApartmentsStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  useEffect(() => {
    document.title = 'Elszámolások - SmartCRM';
  }, []);

  const filteredSettlements = getFiltered();
  const stats = getStats();

  const handleExportCSV = () => {
    const columns = [
      { key: 'period', label: 'Időszak' },
      { key: 'partnerName', label: 'Partner' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'totalPayout', label: 'Összpayout (EUR)' },
      { key: 'totalManagement', label: 'Management (EUR)' },
      { key: 'coHostPayout', label: 'Co-host Payout (EUR)' },
      { key: 'status', label: 'Státusz' }
    ];

    const data = filteredSettlements.map(s => ({
      period: s.period,
      partnerName: s.partnerName,
      apartmentName: s.apartmentName,
      totalPayout: s.summary?.totalPayout || 0,
      totalManagement: s.summary?.totalManagementCommission || 0,
      coHostPayout: s.summary?.coHostPayout || 0,
      status: s.status
    }));

    exportToCSV(data, columns, `elszamolasok_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    const columns = [
      { key: 'period', label: 'Időszak' },
      { key: 'partnerName', label: 'Partner' },
      { key: 'apartmentName', label: 'Lakás' },
      { key: 'totalPayout', label: 'Összpayout (EUR)' },
      { key: 'totalManagement', label: 'Management (EUR)' },
      { key: 'coHostPayout', label: 'Co-host Payout (EUR)' },
      { key: 'status', label: 'Státusz' }
    ];

    const data = filteredSettlements.map(s => ({
      period: s.period,
      partnerName: s.partnerName,
      apartmentName: s.apartmentName,
      totalPayout: s.summary?.totalPayout || 0,
      totalManagement: s.summary?.totalManagementCommission || 0,
      coHostPayout: s.summary?.coHostPayout || 0,
      status: s.status
    }));

    exportToExcel(data, columns, `elszamolasok_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Piszkozat', className: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
      confirmed: { label: 'Visszaigazolt', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      paid: { label: 'Kifizetve', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Partner Elszámolások</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Összesen: {stats.count} elszámolás |
            Piszkozat: {stats.draftCount} |
            Visszaigazolt: {stats.confirmedCount} |
            Kifizetve: {stats.paidCount}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download /> Excel
          </Button>
          <Button variant="primary" onClick={() => setShowImportModal(true)}>
            <Upload /> Import Elszámolás
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Apartment filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lakás
            </label>
            <select
              value={filter.apartmentId}
              onChange={(e) => setFilter({ apartmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
            >
              <option value="">Összes lakás</option>
              {apartments.map(apt => (
                <option key={apt.id} value={apt.id}>{apt.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Státusz
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
            >
              <option value="">Összes státusz</option>
              <option value="draft">Piszkozat</option>
              <option value="confirmed">Visszaigazolt</option>
              <option value="paid">Kifizetve</option>
            </select>
          </div>

          {/* Period filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Időszak
            </label>
            <input
              type="month"
              value={filter.period}
              onChange={(e) => setFilter({ period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Keresés
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Partner, lakás..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Clear filters button */}
        {(filter.apartmentId || filter.status || filter.period || searchQuery) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter({ apartmentId: '', status: '', period: '' });
                setSearchQuery('');
              }}
            >
              Szűrők törlése
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Időszak</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Partner</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Lakás</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Összpayout</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Management</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Co-host</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Foglalások</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Státusz</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery || filter.apartmentId || filter.status || filter.period
                      ? 'Nincs találat a szűrőknek megfelelő elszámolás'
                      : 'Még nincsenek elszámolások. Importálj egyet!'}
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((settlement) => (
                  <tr
                    key={settlement.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {settlement.period}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {settlement.partnerName}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {settlement.apartmentName}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrencyEUR(settlement.summary?.totalPayout || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {formatCurrencyEUR(settlement.summary?.totalManagementCommission || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                      {formatCurrencyEUR(settlement.summary?.coHostPayout || 0)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {(settlement.airbnbReservations?.length || 0) + (settlement.bookingReservations?.length || 0)} db
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(settlement.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSettlement(settlement)}
                      >
                        Részletek
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Import Modal */}
      <SettlementImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(settlement) => {
          console.log('Settlement imported:', settlement);
          setShowImportModal(false);
        }}
        apartments={apartments}
      />

      {/* TODO: Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Elszámolás részletei - {selectedSettlement.period}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Partner: {selectedSettlement.partnerName} | Lakás: {selectedSettlement.apartmentName}
            </p>
            <Button onClick={() => setSelectedSettlement(null)}>Bezárás</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementsPage;
