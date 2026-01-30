import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import useToastStore from '../stores/toastStore';
import { parseCSV, parseExcel } from '../utils/importUtils';

const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.title = 'Partnerek - SmartCRM';
    loadPartners();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowImportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPartners = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load partners from localStorage or API
      const stored = localStorage.getItem('smartcrm_partners');
      if (stored) {
        setPartners(JSON.parse(stored));
      }
    } catch (error) {
      useToastStore.getState().error('Hiba a partnerek betöltésekor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePartners = useCallback((partnersData) => {
    try {
      localStorage.setItem('smartcrm_partners', JSON.stringify(partnersData));
      setPartners(partnersData);
    } catch (error) {
      useToastStore.getState().error('Hiba a mentés során');
    }
  }, []);

  const handleImportClick = (type) => {
    setShowImportDropdown(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'csv' ? '.csv' : '.xlsx,.xls';
      fileInputRef.current.dataset.importType = type;
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const importType = event.target.dataset.importType;
    setIsLoading(true);

    try {
      let importedData = [];

      if (importType === 'csv') {
        importedData = await parseCSV(file);
      } else if (importType === 'excel') {
        importedData = await parseExcel(file);
      }

      // Validate and transform data
      const newPartners = importedData.map((row, index) => ({
        id: Date.now() + index,
        name: row.name || row.Név || '',
        email: row.email || row.Email || '',
        phone: row.phone || row.Telefon || '',
        company: row.company || row.Cég || '',
        taxNumber: row.taxNumber || row.Adószám || '',
        address: row.address || row.Cím || '',
        status: 'active',
        createdAt: new Date().toISOString()
      })).filter(p => p.name && p.email); // Only import valid entries

      if (newPartners.length === 0) {
        useToastStore.getState().error('Nincs érvényes adat az importált fájlban');
        return;
      }

      // Merge with existing partners
      const updatedPartners = [...partners, ...newPartners];
      savePartners(updatedPartners);

      useToastStore.getState().success(`${newPartners.length} partner sikeresen importálva`);
    } catch (error) {
      useToastStore.getState().error(`Import hiba: ${error.message}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredPartners = partners.filter((partner) =>
    partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Partnerek</h1>
        <div className="flex gap-2">
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setShowImportDropdown(!showImportDropdown)}
              variant="outline"
              disabled={isLoading}
            >
              Import
            </Button>
            {showImportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  onClick={() => handleImportClick('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition"
                >
                  CSV Import
                </button>
                <button
                  onClick={() => handleImportClick('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition"
                >
                  Excel Import
                </button>
              </div>
            )}
          </div>
          <Link to="/partner-registration">
            <Button variant="primary">
              Új partner
            </Button>
          </Link>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Keresés név, email vagy cég alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Betöltés...
          </div>
        ) : filteredPartners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Név</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Telefon</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Cég</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Státusz</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{partner.name}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {partner.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {partner.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {partner.company || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        partner.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {partner.status === 'active' ? 'Aktív' : 'Inaktív'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Még nincsenek partnerek. Importálj vagy adj hozzá új partnert!
          </div>
        )}
      </Card>
    </div>
  );
};

export default PartnersPage;
