import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Plus, Download, Upload, FileText, Folder, Search } from '../components/common/Icons';

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    document.title = 'Dokumentumok - SmartCRM';
  }, []);

  const categories = [
    { id: 'all', label: 'Összes', icon: '📁' },
    { id: 'contracts', label: 'Szerződések', icon: '📝' },
    { id: 'invoices', label: 'Számlák', icon: '🧾' },
    { id: 'reports', label: 'Jelentések', icon: '📊' },
    { id: 'legal', label: 'Jogi dokumentumok', icon: '⚖️' },
    { id: 'other', label: 'Egyéb', icon: '📄' }
  ];

  // Mock dokumentumok (később API-ból jönnek)
  const documents = [
    { id: 1, name: 'Bérleti szerződés - Bogdáni 3', category: 'contracts', date: '2025-01-15', size: '2.3 MB', type: 'pdf' },
    { id: 2, name: 'Számla 2025-01', category: 'invoices', date: '2025-01-20', size: '456 KB', type: 'pdf' },
    { id: 3, name: 'Havi jelentés - Január', category: 'reports', date: '2025-01-31', size: '1.2 MB', type: 'xlsx' },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Dokumentumok</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fájlok, szerződések, archívum</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload /> Feltöltés
          </Button>
          <Button variant="primary" className="flex items-center gap-2">
            <Plus /> Új mappa
          </Button>
        </div>
      </div>

      {/* Keresés és szűrés */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keresés dokumentumok között..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Dokumentumok lista */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Dokumentumok ({filteredDocuments.length})
        </h2>
        {filteredDocuments.length > 0 ? (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">
                    {doc.type === 'pdf' ? '📄' : doc.type === 'xlsx' ? '📊' : '📁'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{doc.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.date} • {doc.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Download /> Letöltés
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 w-16 h-16 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Nincs találat' : 'Még nincsenek dokumentumok'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DocumentsPage;
