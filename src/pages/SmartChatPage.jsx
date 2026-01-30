import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SmartChat - Kétpaneles inbox layout (mint Smartness.com)
 * Bal: Beszélgetések listája
 * Jobb: Chat terület
 * Funkció: Üzenetek automatikus fordítása magyarra
 */
const SmartChatPage = () => {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('relevans');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Egyszer fordítási függvény (Google Translate API helyett mock)
  const translateText = async (text, targetLang = 'hu') => {
    if (targetLang === 'hu' && isEnglish(text)) {
      try {
        // Google Translate API meghívása
        const response = await fetch('https://translate.googleapis.com/element.js', {
          method: 'POST'
        });
        // Egyszersített verzió: alapvet angol-magyar fordítások
        const translations = {
          'hello': 'halló',
          'thank you': 'köszönöm',
          'check-in': 'bejelentkezés',
          'check-out': 'kijelentkezés',
          'how are you': 'hogy vagy',
          'good morning': 'jó reggelt',
          'good evening': 'jó estét',
          'goodbye': 'viszlát',
          'yes': 'igen',
          'no': 'nem',
          'okay': 'rendben',
          'thanks': 'köszönöm',
          'sorry': 'elnézést',
          'please': 'kérem',
          'help': 'segítség',
          'question': 'kérdés',
          'time': 'id',
          'early': 'korai',
          'availability': 'szabad',
          'message': 'üzenet',
          'contact': 'kapcsolat',
          'wifi password': 'wifi jelszó',
          'key': 'kulcs',
          'door': 'ajtó',
          'problem': 'probléma',
          'issue': 'probléma',
          'need': 'szükség',
          'call': 'hívás',
          'phone': 'telefon'
        };
        
        let translated = text.toLowerCase();
        Object.entries(translations).forEach(([en, hu]) => {
          translated = translated.replace(new RegExp(en, 'gi'), hu);
        });
        return translated;
      } catch (error) {
        console.error('Fordítási hiba:', error);
        return text;
      }
    }
    return text;
  };

  // Angol nyelvdetektálás
  const isEnglish = (text) => {
    const englishWords = /hello|thank|check|time|yes|no|okay|please|help|question|contact|problem|need|call|key|door|wifi|password|message/i;
    return englishWords.test(text);
  };

  // Demo beszélgetések
  const [conversations] = useState([
    {
      id: 1,
      propertyName: 'Rottenbiller Gardens 2 - H22',
      guestName: 'Fernando Xavier Cabral Vazquez',
      lastMessage: 'Thank you so much for staying with us and for...',
      lastMessageTime: 'Today',
      unread: true,
      hasError: false,
      channel: 'airbnb',
      avatarColor: '#3b82f6'
    },
    {
      id: 2,
      propertyName: 'Akác 57 - Studio',
      guestName: 'Horváth Károly',
      lastMessage: 'Open chat to view',
      lastMessageTime: 'Today',
      unread: true,
      hasError: false,
      channel: 'booking',
      avatarColor: '#ef4444'
    },
    {
      id: 3,
      propertyName: 'Angel 36 - Deluxe',
      guestName: 'Mónika',
      lastMessage: 'Open chat to view',
      lastMessageTime: 'Yesterday',
      unread: true,
      hasError: false,
      channel: 'airbnb',
      avatarColor: '#f97316'
    },
    {
      id: 4,
      propertyName: 'Baross 20 - Keleti',
      guestName: 'Rachel',
      lastMessage: 'Open chat to view',
      lastMessageTime: 'Yesterday',
      unread: true,
      hasError: false,
      channel: 'direct',
      avatarColor: '#ef4444'
    },
    {
      id: 5,
      propertyName: 'D16 Deluxe',
      guestName: 'Marczal Krisztián',
      lastMessage: 'Error while processing message: Cannot r...',
      lastMessageTime: 'Yesterday',
      unread: false,
      hasError: true,
      channel: 'airbnb',
      avatarColor: '#3b82f6'
    },
    {
      id: 6,
      propertyName: 'Bogdáni Studio',
      guestName: 'Josh',
      lastMessage: 'Open chat to view',
      lastMessageTime: 'Yesterday',
      unread: true,
      hasError: false,
      channel: 'booking',
      avatarColor: '#f97316'
    },
    {
      id: 7,
      propertyName: 'D3 Apartment',
      guestName: 'Vojtech Podhorsky',
      lastMessage: 'Error while processing message: Cannot r...',
      lastMessageTime: 'Yesterday',
      unread: false,
      hasError: true,
      channel: 'airbnb',
      avatarColor: '#3b82f6'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (selectedConversation) {
      inputRef.current?.focus();
    }
  }, [messages, selectedConversation]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Demo üzenetek betöltése
    setMessages([
      {
        id: 1,
        role: 'asszisztens',
        content: `Beszélgetés: ${conv.guestName} - ${conv.propertyName}`,
        time: '10:30',
        original: `Beszélgetés: ${conv.guestName} - ${conv.propertyName}`
      },
      {
        id: 2,
        role: 'vendég',
        content: 'Halló, van egy kérdésem a bejelentkezés idpontjáról.',
        time: '10:32',
        original: 'Hello, I have a question about the check-in time.',
        translated: true
      },
      {
        id: 3,
        role: 'asszisztens',
        content: 'Szia! A bejelentkezés délután 3 órától lehetséges. Szeretnél korai bejelentkezést? Meg tudom nézni a szabad helyeket.',
        time: '10:33',
        original: 'Hi! Check-in is from 3 PM. Would you like early check-in? I can check availability.',
        translated: true
      }
    ]);
    // Mobil nézeten zárjuk a sidebbart
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'vendég',
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMessage = {
        id: Date.now() + 1,
        role: 'asszisztens',
        content: 'Köszönöm az üzenetet! A válasz hamarosan érkezik.',
        time: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-12rem)]">
      {/* F konténer - kétpaneles layout */}
      <div className="flex-1 flex overflow-hidden rounded-2xl bg-[#0f172a] shadow-2xl border border-[#334155]">
        
        {/* Bal oldal - Beszélgetések lista */}
        <div className={`w-80 min-w-[320px] bg-[#1e293b] border-r border-[#334155] flex flex-col ${!sidebarVisible ? 'hidden md:flex' : 'flex'}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#334155]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Beszélgetések</h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-[#334155] text-[#94a3b8] transition-colors" title="Frissítés">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors" title="Új beszélgetés">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Channel Selector */}
            <select className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-[#e2e8f0] text-sm mb-3 focus:outline-none focus:border-[#3b82f6]">
              <option># Csatornák kiválasztása</option>
              <option>Airbnb</option>
              <option>Booking.com</option>
              <option>Direkt</option>
            </select>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Beszélgetés keresése..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-[#e2e8f0] text-sm placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-[#334155]">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterTab('relevans')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTab === 'relevans' 
                    ? 'bg-[#3b82f6] text-white' 
                    : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
                }`}
              >
                Releváns
              </button>
              <button
                onClick={() => setFilterTab('nem-relevans')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterTab === 'nem-relevans' 
                    ? 'bg-[#3b82f6] text-white' 
                    : 'bg-[#0f172a] text-[#94a3b8] hover:bg-[#334155]'
                }`}
              >
                Nem releváns
              </button>
            </div>
          </div>

          {/* Filters Dropdown */}
          <div className="px-4 py-2 border-b border-[#334155]">
            <button className="flex items-center gap-2 text-[#94a3b8] text-sm hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Szrk
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-start gap-3 p-4 cursor-pointer border-b border-[#334155] transition-colors ${
                  selectedConversation?.id === conv.id 
                    ? 'bg-[#3b82f6]' 
                    : 'hover:bg-[#334155]'
                }`}
              >
                {/* Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                  style={{ backgroundColor: conv.avatarColor }}
                >
                  {getInitials(conv.guestName)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#60a5fa] truncate mb-0.5">
                    {conv.propertyName}
                  </div>
                  <div className={`font-medium truncate ${selectedConversation?.id === conv.id ? 'text-white' : 'text-[#f8fafc]'}`}>
                    {conv.guestName}
                  </div>
                  <div className={`text-sm truncate ${selectedConversation?.id === conv.id ? 'text-blue-100' : 'text-[#94a3b8]'}`}>
                    {conv.lastMessage}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs ${selectedConversation?.id === conv.id ? 'text-blue-100' : 'text-[#64748b]'}`}>
                    {conv.lastMessageTime}
                  </span>
                  {(conv.unread || conv.hasError) && (
                    <span className={`w-2.5 h-2.5 rounded-full ${conv.hasError ? 'bg-[#f97316]' : 'bg-[#3b82f6]'}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobb oldal - Chat terület */}
        <div className="flex-1 flex flex-col bg-[#0f172a] min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#334155] bg-[#1e293b]">
                {/* Mobile sidebar toggle */}
                <button 
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  className="md:hidden p-2 rounded-lg hover:bg-[#334155] text-[#94a3b8] mr-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: selectedConversation.avatarColor }}
                  >
                    {getInitials(selectedConversation.guestName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{selectedConversation.guestName}</h3>
                    <p className="text-sm text-[#94a3b8] truncate">{selectedConversation.propertyName}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-[#e2e8f0] text-sm transition-colors"
                >
                  Bezárás
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'vendég' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === 'vendég'
                            ? 'bg-[#3b82f6] text-white'
                            : 'bg-[#1e293b] text-[#e2e8f0] border border-[#334155]'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.translated && (
                          <p className="text-xs mt-1 opacity-60">(fordítva)</p>
                        )}
                        <p className={`text-xs mt-1 ${msg.role === 'vendég' ? 'text-blue-200' : 'text-[#64748b]'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#3b82f6]"
                            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#334155] bg-[#1e293b]">
                <div className="flex gap-2 mb-2 items-center">
                  <label className="flex items-center gap-2 text-sm text-[#94a3b8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => setAutoTranslate(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Automatikus fordítás</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Írj üzenetet..."
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] transition-colors"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-6 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                  >
                    Küldés
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8]">
              {/* Mobile sidebar toggle */}
              <button 
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="md:hidden absolute top-4 left-4 p-2 rounded-lg hover:bg-[#334155] text-[#94a3b8]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">Válassz egy beszélgetést</h3>
              <p className="text-center max-w-xs">
                Választ egy beszélgetést a listából vagy hozz létre egy újat a csevegéshez
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartChatPage;
