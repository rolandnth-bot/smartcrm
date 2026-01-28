import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/common/Card';

const SmartChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Üdvözöllek a SmartChat-ben! Itt tudsz kommunikálni a vendégekkel.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Köszönöm az üzenetedet! A vendég kommunikáció funkció hamarosan teljes funkcionalitással rendelkezik.'
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

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-12rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden rounded-xl" bodyClassName="p-0 flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Fejléc – külön ablak jelleg */}
        <div className="shrink-0 flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800 text-white rounded-t-xl border-b border-white/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>💬</span>
            <div>
              <h1 className="text-xl font-bold">SmartChat</h1>
              <p className="text-sm text-white/80">Vendégkommunikáció – külön ablak</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
            aria-label="Bezárás és vissza"
          >
            Bezárás
          </button>
        </div>

        {/* Üzenetek */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar min-h-0">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-rose-500"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 rounded-b-xl">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Írj üzenetet..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              disabled={isTyping}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              Küldés
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SmartChatPage;
