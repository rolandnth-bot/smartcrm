import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { chatWithAI, searchKnowledge, startAgent, getAgentStatus, sendVoiceInput, initiateCall } from '../services/api';
import useToastStore from '../stores/toastStore';
import { loadN8nConfig, saveN8nConfig, testN8nConnection } from '../services/n8nService';
import { Plus, RefreshCw } from '../components/common/Icons';

const AIAssistantPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('base'); // 'base', 'agent', 'voice'
  
  // BÁZIS tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Folyamatrendszer state
  const [processCategories, setProcessCategories] = useState([
    { id: 'onboarding', name: 'Onboarding', icon: '', processes: [] },
    { id: 'operations', name: 'Mveletek', icon: '', processes: [] },
    { id: 'sales', name: 'Értékesítés', icon: '', processes: [] },
    { id: 'maintenance', name: 'Karbantartás', icon: '', processes: [] },
    { id: 'cleaning', name: 'Takarítás', icon: '', processes: [] }
  ]);
  const [selectedProcessCategory, setSelectedProcessCategory] = useState(null);
  const [aiGeneratedTopics, setAiGeneratedTopics] = useState([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  
  // AGENT tab state
  const [agentInstruction, setAgentInstruction] = useState('');
  const [agentStatus, setAgentStatus] = useState('IDLE'); // IDLE, WORKING, DONE, ERROR
  const [agentLogs, setAgentLogs] = useState([]);
  const [browserPreview, setBrowserPreview] = useState(null);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  
  // VOICE tab state
  const [isListening, setIsListening] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  
  // n8n settings state
  const [n8nSettings, setN8nSettings] = useState({
    url: '',
    apiKey: '',
    apiVersion: 'v1',
    enabled: false
  });
  const [isLoadingN8n, setIsLoadingN8n] = useState(false);
  const [isSavingN8n, setIsSavingN8n] = useState(false);
  const [isTestingN8n, setIsTestingN8n] = useState(false);
  const [n8nTestResult, setN8nTestResult] = useState(null);
  
  const categories = [
    { id: 'inventory', label: 'Leltár', icon: '' },
    { id: 'contracts', label: 'Szerzdések', icon: '' },
    { id: 'processes', label: 'Folyamatok', icon: '' },
    { id: 'pricing', label: 'Árazás', icon: '' },
    { id: 'partner', label: 'Partneri infók', icon: '' }
  ];

  // n8n beállítások betöltése
  useEffect(() => {
    const n8nConfig = loadN8nConfig();
    setN8nSettings(n8nConfig);
  }, []);

  // AI Topic generálás a tanulásból
  const generateTopicsFromLearning = async () => {
    setIsGeneratingTopics(true);
    try {
      // AI agent topicokat generál a tudásbázisból
      const response = await chatWithAI({ 
        message: 'Generálj 5-10 releváns topicot a SmartCRM rendszer folyamataihoz a tudásbázis alapján. Válaszolj JSON formátumban: {topics: [{name: string, category: string, description: string}]}'
      });
      
      // Parse AI válasz
      let topics = [];
      try {
        const parsed = JSON.parse(response.response || response.message || '{}');
        topics = parsed.topics || [];
      } catch {
        // Ha nem JSON, próbáljuk kinyerni
        const text = response.response || response.message || '';
        topics = text.split('\n').filter(line => line.trim()).map((line, idx) => ({
          id: `topic-${idx}`,
          name: line.replace(/^[-*]\s*/, '').trim(),
          category: 'general',
          description: ''
        }));
      }
      
      setAiGeneratedTopics(topics);
    } catch (error) {
      // Mock topics fejlesztésben
      if (import.meta.env.DEV) {
        setAiGeneratedTopics([
          { id: '1', name: 'Partner regisztráció', category: 'onboarding', description: 'Új partner felvétele a rendszerbe' },
          { id: '2', name: 'Lakás aktiválás', category: 'operations', description: 'Új lakás hozzáadása és aktiválása' },
          { id: '3', name: 'Foglalás kezelés', category: 'operations', description: 'Foglalások létrehozása és módosítása' },
          { id: '4', name: 'Takarítás ütemezés', category: 'cleaning', description: 'Takarítási feladatok létrehozása' },
          { id: '5', name: 'Lead konverzió', category: 'sales', description: 'Lead megnyerése és szerzdéskötés' }
        ]);
      } else {
        useToastStore.getState().error('Hiba a topic generálása során');
      }
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  // Folyamat létrehozása topic alapján
  const createProcessFromTopic = async (topic) => {
    try {
      const response = await chatWithAI({
        message: `Hozz létre egy részletes folyamatot a következ témakörhöz: ${topic.name}. ${topic.description || ''} A folyamat tartalmazza a lépéseket, felelsöket és határidket.`
      });
      
      const process = {
        id: `process-${Date.now()}`,
        name: topic.name,
        category: topic.category || selectedProcessCategory,
        description: response.response || response.message || '',
        steps: [],
        createdAt: new Date().toISOString()
      };
      
      // Hozzáadás a kategóriához
      setProcessCategories(prev => prev.map(cat => 
        cat.id === process.category
          ? { ...cat, processes: [...cat.processes, process] }
          : cat
      ));
      
      useToastStore.getState().success(`Folyamat létrehozva: ${process.name}`);
    } catch (error) {
      useToastStore.getState().error('Hiba a folyamat létrehozása során');
    }
  };

  // Page title
  useEffect(() => {
    document.title = 'AI Asszisztens - SmartCRM';
  }, []);

  // Agent status polling
  useEffect(() => {
    if (agentStatus === 'WORKING') {
      const interval = setInterval(async () => {
        try {
          const status = await getAgentStatus();
          setAgentStatus(status.status || 'IDLE');
          if (status.logs) {
            setAgentLogs(status.logs);
          }
          if (status.browserPreview) {
            setBrowserPreview(status.browserPreview);
            setIframeError(false);
            setIframeLoading(true);
            
            // Timeout ellenrzés - ha 5 másodperc után sem tölt be, akkor hiba
            setTimeout(() => {
              setIframeLoading(false);
              // Ha még mindig loading, akkor valószínleg nem tölt be
              const iframe = document.querySelector('iframe[title="Agent Browser Preview"]');
              if (iframe) {
                try {
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (!doc || !doc.body || doc.body.innerHTML.trim() === '' || doc.body.innerHTML === '<html><head></head><body></body></html>') {
                    setIframeError(true);
                  }
                } catch (e) {
                  // CORS hiba - valószínleg nem tölt be
                  setIframeError(true);
                }
              }
            }, 5000);
          }
        } catch (error) {
          console.error('Agent status check error:', error);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [agentStatus]);

  // BÁZIS tab - Keresés
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchKnowledge({
        query: searchQuery,
        category: selectedCategory
      });
      setSearchResults(results.documents || results || []);
    } catch (error) {
      useToastStore.getState().error('Hiba a keresés során');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // AGENT tab - Utasítás küldése
  const handleAgentStart = async () => {
    if (!agentInstruction.trim()) return;
    
    setAgentStatus('WORKING');
    setAgentLogs([]);
    setBrowserPreview(null);
    setIframeError(false);
    setIframeLoading(true);
    
    try {
      const result = await startAgent({ instruction: agentInstruction });
      setAgentLogs(prev => [...prev, { type: 'info', message: 'Agent elindítva...' }]);
      
      // Status polling automatikusan frissül
    } catch (error) {
      setAgentStatus('ERROR');
      useToastStore.getState().error('Hiba az agent indításakor');
      console.error('Agent start error:', error);
    }
  };

  // VOICE tab - Hang input
  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setIsProcessingVoice(false);
      return;
    }

    setIsListening(true);
    setIsProcessingVoice(true);
    
    try {
      // Itt valóságban a mikrofon audio stream-et kellene elküldeni
      // Az API service már kezeli a mock választ, ha az API nem elérhet
      const response = await sendVoiceInput({ audio: 'mock-audio-data' });
      
      setVoiceResponse(response.text || response.message || 'Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában.');
      setIsLive(true);
      
      // Csendes mködés, nem kell toast üzenet (az API service már kezeli a mock választ)
    } catch (error) {
      // Csak akkor jelenítünk meg hibát, ha valódi hiba történt
      // (pl. 4xx hibák - rossz kérés, nem network/API hiány)
      if (error.status && error.status >= 400 && error.status < 500 && !error.isNetworkError) {
        useToastStore.getState().error('Hiba a hangfeldolgozás során. Kérjük, próbálja újra.');
        console.error('Voice input error:', error);
      } else {
        // Network hiba vagy API hiány esetén csendes mock válasz (fejlesztésben)
        // Élesben az API service már kezeli ezt
        if (import.meta.env.DEV) {
          setVoiceResponse('Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában.');
          setIsLive(true);
        } else {
          // Éles környezetben csak akkor jelenítünk hibát, ha valódi probléma van
          useToastStore.getState().error('A hangfeldolgozás jelenleg nem elérhet. Kérjük, próbálja késbb.');
        }
      }
    } finally {
      setIsListening(false);
      setIsProcessingVoice(false);
    }
  };

  // VOICE tab - Hívás indítás
  const handleCall = async (phoneNumber) => {
    try {
      await initiateCall({ phoneNumber });
      useToastStore.getState().success('Hívás indítva');
    } catch (error) {
      // Csak akkor jelenítünk hibát, ha valódi hiba történt
      if (error.status && error.status >= 400 && error.status < 500) {
        useToastStore.getState().error('Hiba a hívás indításakor. Kérjük, ellenrizze a telefonszámot.');
      } else if (import.meta.env.DEV && (error.isNetworkError || error.status === 0)) {
        // Fejlesztési környezetben csendes mködés, ha az API nem elérhet
        console.log('Call API not available in development');
      } else {
        useToastStore.getState().error('A hívás jelenleg nem elérhet. Kérjük, próbálja késbb.');
      }
      console.error('Call error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          SmartProperties AI Asszisztens
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('base')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'base'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            BÁZIS
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'agent'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            AGENT
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'voice'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            VOICE
          </button>
        </div>

        {/* BÁZIS Tab - Új struktúra: Agentek és Tudástár */}
        {activeTab === 'base' && (
          <div className="space-y-6">
            {/* Agentek szekció */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agentek</h2>
                  <Button
                    onClick={() => {
                      useToastStore.getState().info('Új agent hozzáadása hamarosan elérhet lesz');
                    }}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus /> Új hozzáadása
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI Roli */}
                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Roli</h3>
                        <Button 
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('openAIRoli'));
                          }}
                          variant="outline" 
                          size="sm"
                        >
                          Megnyitás
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SmartCRM asszisztens
                      </p>
                      
                      {/* Tudástár AI Roli-nak */}
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tudástár</h4>
                        
                        {/* Keresés */}
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Keresés..."
                            className="flex-1 px-3 py-1.5 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            loading={isSearching}
                            variant="primary"
                            size="sm"
                          >
                            Keresés
                          </Button>
                        </div>

                        {/* Kategóriák */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                                if (searchQuery) handleSearch();
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedCategory === cat.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Eredmények */}
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {searchResults.length > 0 ? (
                            searchResults.map((doc, idx) => (
                              <div
                                key={idx}
                                onClick={() => setSelectedDocument(doc)}
                                className="p-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-xs"
                              >
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                  {doc.title || doc.name || 'Dokumentum'}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {doc.snippet || doc.content?.substring(0, 100) || 'Nincs leírás'}
                                </p>
                              </div>
                            ))
                          ) : searchQuery && !isSearching ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-xs">
                              Nincs találat
                            </p>
                          ) : null}
                        </div>

                        {/* Dokumentum megjelenítés */}
                        {selectedDocument && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-gray-800 dark:text-gray-200">
                                {selectedDocument.title || selectedDocument.name}
                              </h5>
                              <button
                                onClick={() => setSelectedDocument(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                              {selectedDocument.content || selectedDocument.text || 'Nincs tartalom'}
                            </pre>
                            {selectedDocument.source && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <strong>Honnan tudod?</strong> {selectedDocument.source}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                  
                  {/* SmartChat */}
                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">SmartChat</h3>
                        <Button 
                          onClick={() => navigate('/smart-chat')}
                          variant="outline" 
                          size="sm"
                        >
                          Megnyitás
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Guest Communication
                      </p>
                      
                      {/* Tudástár SmartChat-nek */}
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tudástár</h4>
                        
                        {/* Keresés */}
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Keresés..."
                            className="flex-1 px-3 py-1.5 text-sm border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            loading={isSearching}
                            variant="primary"
                            size="sm"
                          >
                            Keresés
                          </Button>
                        </div>

                        {/* Kategóriák */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                                if (searchQuery) handleSearch();
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedCategory === cat.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Eredmények */}
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {searchResults.length > 0 ? (
                            searchResults.map((doc, idx) => (
                              <div
                                key={idx}
                                onClick={() => setSelectedDocument(doc)}
                                className="p-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-xs"
                              >
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                  {doc.title || doc.name || 'Dokumentum'}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {doc.snippet || doc.content?.substring(0, 100) || 'Nincs leírás'}
                                </p>
                              </div>
                            ))
                          ) : searchQuery && !isSearching ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-xs">
                              Nincs találat
                            </p>
                          ) : null}
                        </div>

                        {/* Dokumentum megjelenítés */}
                        {selectedDocument && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-gray-800 dark:text-gray-200">
                                {selectedDocument.title || selectedDocument.name}
                              </h5>
                              <button
                                onClick={() => setSelectedDocument(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                              {selectedDocument.content || selectedDocument.text || 'Nincs tartalom'}
                            </pre>
                            {selectedDocument.source && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <strong>Honnan tudod?</strong> {selectedDocument.source}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
            </div>
          </Card>

          {/* Folyamatrendszer */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Folyamatrendszer
                </h2>
                <Button
                  onClick={generateTopicsFromLearning}
                  disabled={isGeneratingTopics}
                  loading={isGeneratingTopics}
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingTopics ? 'Generálás...' : 'AI Topic generálás'}
                </Button>
              </div>

              {/* Folyamat kategóriák */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Folyamat kategóriák
                </h3>
                <div className="flex flex-wrap gap-2">
                  {processCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedProcessCategory(selectedProcessCategory === cat.id ? null : cat.id)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedProcessCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.processes.length > 0 && (
                        <span className="text-xs opacity-75">({cat.processes.length})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI generált topicok */}
              {aiGeneratedTopics.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    AI generált topicok
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiGeneratedTopics.map((topic) => (
                      <div
                        key={topic.id || topic.name}
                        className="p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                              {topic.name}
                            </h4>
                            {topic.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => createProcessFromTopic(topic)}
                            variant="outline"
                            size="sm"
                            className="ml-2"
                          >
                            Folyamat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folyamatok listája */}
              {selectedProcessCategory && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Folyamatok - {processCategories.find(c => c.id === selectedProcessCategory)?.name}
                  </h3>
                  <div className="space-y-2">
                    {processCategories
                      .find(c => c.id === selectedProcessCategory)
                      ?.processes.map((process) => (
                        <div
                          key={process.id}
                          className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {process.name}
                              </h4>
                              {process.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {process.description}
                                </p>
                              )}
                              {process.createdAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  Létrehozva: {new Date(process.createdAt).toLocaleDateString('hu-HU')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {processCategories.find(c => c.id === selectedProcessCategory)?.processes.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Még nincsenek folyamatok ebben a kategóriában
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* n8n beállítások */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">n8n API kapcsolat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                n8n workflow automation platform API integráció beállítása
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    n8n URL *
                  </label>
                  <input
                    type="url"
                    value={n8nSettings.url}
                    onChange={(e) => setN8nSettings({ ...n8nSettings, url: e.target.value })}
                    placeholder="https://n8n.example.com vagy http://localhost:5678"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Az n8n instance URL-je (pl. https://n8n.example.com vagy http://localhost:5678)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={n8nSettings.apiKey}
                    onChange={(e) => setN8nSettings({ ...n8nSettings, apiKey: e.target.value })}
                    placeholder="n8n API Key"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Az n8n API Key (Settings  n8n API  Create an API key)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API verzió
                  </label>
                  <select
                    value={n8nSettings.apiVersion}
                    onChange={(e) => setN8nSettings({ ...n8nSettings, apiVersion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="v1">v1</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    n8n API verzió (általában v1)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="n8n-enabled"
                    checked={n8nSettings.enabled}
                    onChange={(e) => setN8nSettings({ ...n8nSettings, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="n8n-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    n8n integráció engedélyezése
                  </label>
                </div>

                {/* Tesztelés eredménye */}
                {n8nTestResult && (
                  <div
                    className={`p-3 rounded-lg border ${
                      n8nTestResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                    }`}
                    role="alert"
                  >
                    <p className="text-sm font-medium">{n8nTestResult.message}</p>
                    {n8nTestResult.data && n8nTestResult.data.email && (
                      <p className="text-xs mt-1 opacity-80">
                        Felhasználó: {n8nTestResult.data.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={async () => {
                      if (!n8nSettings.url || !n8nSettings.apiKey) {
                        useToastStore.getState().error('n8n URL és API Key megadása kötelez a teszteléshez');
                        return;
                      }
                      setIsTestingN8n(true);
                      setN8nTestResult(null);
                      try {
                        const result = await testN8nConnection(
                          n8nSettings.url,
                          n8nSettings.apiKey,
                          n8nSettings.apiVersion
                        );
                        setN8nTestResult(result);
                        if (result.success) {
                          useToastStore.getState().success('n8n kapcsolat sikeres!');
                        } else {
                          useToastStore.getState().error(result.message);
                        }
                      } catch (err) {
                        setN8nTestResult({
                          success: false,
                          message: err.message || 'Ismeretlen hiba a kapcsolat tesztelésekor'
                        });
                        useToastStore.getState().error(err.message || 'Ismeretlen hiba a kapcsolat tesztelésekor');
                      } finally {
                        setIsTestingN8n(false);
                      }
                    }}
                    variant="outline"
                    disabled={isTestingN8n || !n8nSettings.url || !n8nSettings.apiKey}
                    loading={isTestingN8n}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw /> Kapcsolat tesztelése
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!n8nSettings.url || !n8nSettings.apiKey) {
                        useToastStore.getState().error('n8n URL és API Key megadása kötelez');
                        return;
                      }
                      setIsSavingN8n(true);
                      try {
                        const saved = saveN8nConfig(n8nSettings);
                        if (saved) {
                          useToastStore.getState().success('n8n beállítások sikeresen mentve!');
                        } else {
                          useToastStore.getState().error('Hiba az n8n beállítások mentésekor');
                        }
                      } catch (err) {
                        useToastStore.getState().error(err.message || 'Hiba az n8n beállítások mentésekor');
                      } finally {
                        setIsSavingN8n(false);
                      }
                    }}
                    variant="primary"
                    disabled={isSavingN8n || !n8nSettings.url || !n8nSettings.apiKey}
                    loading={isSavingN8n}
                  >
                    n8n beállítások mentése
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* AGENT Tab */}
        {activeTab === 'agent' && (
          <div className="space-y-4">
            {/* Agent Console Header */}
            <Card className="ai-fade-in-scale">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  AGENT CONSOLE
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    agentStatus === 'IDLE' ? 'bg-gray-400' :
                    agentStatus === 'WORKING' ? 'bg-yellow-500 ai-status-blink' :
                    agentStatus === 'DONE' ? 'bg-green-500' :
                    'bg-red-500'
                  }`} />
                  <span className="font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    {agentStatus}
                  </span>
                </div>
              </div>
            </Card>

            {/* Böngész elnézet */}
            <Card 
              title="Böngész elnézet"
              className="ai-fade-in-scale"
            >
              {browserPreview?.url ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-4">
                      {browserPreview.url}
                    </span>
                    <button
                      onClick={() => window.open(browserPreview.url, '_blank', 'width=1200,height=800')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs whitespace-nowrap"
                    >
                      Megnyitás új ablakban
                    </button>
                  </div>
                  <div className="h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 relative">
                    {!iframeError ? (
                      <>
                        <iframe
                          key={`iframe-${browserPreview.url}`}
                          src={browserPreview.url}
                          className="w-full h-full border-0 bg-white"
                          title="Agent Browser Preview"
                          allowFullScreen
                          onLoad={() => {
                            setTimeout(() => {
                              setIframeLoading(false);
                              // Ellenrizzük, hogy tényleg betöltdött-e
                              const iframe = document.querySelector('iframe[title="Agent Browser Preview"]');
                              if (iframe) {
                                try {
                                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                                  if (doc && doc.body && doc.body.innerHTML.trim() !== '' && doc.body.innerHTML !== '<html><head></head><body></body></html>') {
                                    setIframeError(false);
                                  } else {
                                    // Üres vagy fehér - valószínleg nem tölt be
                                    setTimeout(() => setIframeError(true), 2000);
                                  }
                                } catch (e) {
                                  // CORS - lehet, hogy betöltdött, de nem tudjuk ellenrizni
                                  // Várunk egy kicsit, aztán ha még mindig loading, akkor hiba
                                }
                              }
                            }, 2000);
                          }}
                        />
                        {iframeLoading && (
                          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center z-20">
                            <div className="text-center">
                              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Betöltés...</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center p-6 max-w-md">
                          <div className="text-5xl mb-4"></div>
                          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2 text-lg">
                            Böngész elnézet
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Az oldal nem tölthet be közvetlenül az iframe-ben biztonsági korlátozások miatt.
                          </p>
                          <div className="space-y-2">
                            <button
                              onClick={() => window.open(browserPreview.url, '_blank', 'width=1200,height=800')}
                              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                            >
                              Megnyitás új ablakban
                            </button>
                            <button
                              onClick={() => {
                                setIframeError(false);
                                setIframeLoading(true);
                                const iframe = document.querySelector('iframe[title="Agent Browser Preview"]');
                                if (iframe) {
                                  iframe.src = iframe.src + (iframe.src.includes('?') ? '&' : '?') + '_t=' + Date.now();
                                }
                              }}
                              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                            >
                              Újrapróbálás
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className={`w-16 h-16 mb-4 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto transition-all ${
                      agentStatus === 'WORKING' ? 'ai-globe-rotate ai-pulse-glow' : 'opacity-60'
                    }`}>
                      <span className="text-2xl"></span>
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Böngész elnézet
                    </p>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                      Az agent mveletei itt jelennek meg
                    </p>
                    {agentStatus === 'WORKING' && (
                      <div className="mt-4 flex justify-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full ai-pulse-glow" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full ai-pulse-glow" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-blue-500 rounded-full ai-pulse-glow" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Utasítás input */}
            <Card className="ai-slide-up">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={agentInstruction}
                  onChange={(e) => setAgentInstruction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAgentStart()}
                  placeholder="Utasítás küldése... (pl. 'Lépj be a Booking.com-ra és ellenrizd a mai foglalásokat')"
                  className="flex-1 px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  disabled={agentStatus === 'WORKING'}
                />
                <Button
                  onClick={handleAgentStart}
                  disabled={!agentInstruction.trim() || agentStatus === 'WORKING'}
                  loading={agentStatus === 'WORKING'}
                  variant="primary"
                  className="transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  Indítás
                </Button>
              </div>
            </Card>

            {/* Logs */}
            {agentLogs.length > 0 && (
              <Card className="ai-slide-up">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Mvelet logok</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {agentLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`text-sm p-2 rounded ai-slide-up transition-all duration-200 ${
                        log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                        log.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {log.message || log}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* VOICE Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            {/* Live Status */}
            <Card className="ai-fade-in-scale">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
                  isLive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 scale-105' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isLive ? 'bg-green-500 ai-status-blink' : 'bg-gray-400'
                  }`} />
                  <span className="font-semibold">
                    {isLive ? 'LIVE KAPCSOLAT' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Voice Interface */}
            <Card className="ai-fade-in-scale">
              <div className="text-center py-8 relative">
                {/* Sound waves animation */}
                {isListening && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-32 rounded-full border-2 border-blue-400 ai-sound-wave" style={{ animationDelay: '0s' }} />
                      <div className="w-32 h-32 rounded-full border-2 border-blue-400 ai-sound-wave" style={{ animationDelay: '0.5s' }} />
                      <div className="w-32 h-32 rounded-full border-2 border-blue-400 ai-sound-wave" style={{ animationDelay: '1s' }} />
                    </div>
                  </>
                )}
                
                <div className="mb-6 relative z-10">
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                    isListening
                      ? 'bg-blue-500 ai-listening-pulse shadow-2xl shadow-blue-500/50'
                      : isLive
                      ? 'bg-green-500 ai-voice-pulse shadow-lg shadow-green-500/30'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}>
                    <span className="text-4xl"></span>
                  </div>
                </div>
                <p className={`text-lg font-semibold text-gray-700 dark:text-gray-300 mb-8 transition-all duration-300 ${
                  isListening ? 'text-blue-600 dark:text-blue-400' : ''
                }`}>
                  {isListening ? 'Hallgatlak...' : isLive ? 'ASSZISZTENS A VONALBAN' : 'A hangvezérlés a BÁZIS tab-ban érhet el'}
                </p>
              </div>
            </Card>

            {/* Voice Response */}
            {voiceResponse && (
              <Card className="ai-slide-up">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Válasz</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ai-fade-in-scale">
                  <p className="text-gray-700 dark:text-gray-300">{voiceResponse}</p>
                </div>
              </Card>
            )}

            {/* Incoming Call Popup */}
            {incomingCall && (
              <Card className="border-2 border-blue-500 ai-fade-in-scale animate-pulse">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Bejöv hívás
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {incomingCall.phoneNumber}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        // Accept call
                        setIncomingCall(null);
                        setIsLive(true);
                      }}
                      variant="primary"
                      className="transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                      Felvétel
                    </Button>
                    <Button
                      onClick={() => setIncomingCall(null)}
                      variant="outline"
                      className="transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                      Elutasítás
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;
