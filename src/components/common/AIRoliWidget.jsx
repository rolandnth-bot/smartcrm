import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '../../services/api';
import useToastStore from '../../stores/toastStore';

const AIRoliWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Szia! Én vagyok AI Roli, a SmartCRM asszisztense. Miben segíthetek?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  // Listen for custom event to open widget
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('openAIRoli', handleOpen);
    return () => {
      window.removeEventListener('openAIRoli', handleOpen);
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatWithAI({ message: userMessage.content });
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsTyping(false);
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response || response.message || response.text || 'Elnézést, nem tudtam válaszolni.'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      // Development módban mindig mock választ adunk
      if (import.meta.env.DEV || !error.status || error.status === 0 || error.isNetworkError || error.status >= 500) {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Köszönöm a kérdésedet! Jelenleg fejlesztési módban vagyunk, de hamarosan teljes funkcionalitással rendelkezem. Miben segíthetek még?'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Csak production-ban és konkrét 4xx hibák esetén mutatunk hibát
        useToastStore.getState().error('Hiba történt a válasz generálása során.');
        console.error('AI chat error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* AI Roli Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white border-0 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg"
        aria-label="AI Roli megnyitása"
        aria-expanded={isOpen}
      >
        <span className="font-semibold">AI Roli</span>
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-neon-cyan rounded-full"
            >
              <motion.span
                className="absolute inset-0 bg-neon-cyan rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Ultra-Modern Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Látható sötét háttér – kattintásra bezár */}
            <div className="absolute inset-0 bg-gray-900/80 dark:bg-black/75 backdrop-blur-sm" aria-hidden />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-4 top-20 w-96 max-h-[calc(100vh-6rem)] flex flex-col shadow-2xl rounded-3xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Neon Border */}
              <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-neon-pink via-neon-purple via-neon-cyan to-neon-pink bg-[length:200%_200%]" style={{ animation: 'border-spin-gradient 3s linear infinite' }}>
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-neon-pink/50 via-neon-purple/50 via-neon-cyan/50 to-neon-pink/50 blur-xl animate-pulse-glow" />
                
                {/* Card Content – teli opacitás, jobb láthatóság */}
                <div className="relative bg-gray-900 dark:bg-gray-950 rounded-3xl overflow-hidden flex flex-col h-full max-h-[calc(100vh-6rem)] border border-white/10">
                  {/* Header – erősebb színek */}
                  <div className="relative p-6 bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 dark:from-pink-500 dark:via-purple-600 dark:to-purple-700 border-b border-white/20 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-bold text-xl text-white flex items-center gap-2">
                            AI Roli
                            <motion.span
                              className="w-2 h-2 rounded-full bg-neon-cyan"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </h3>
                          <p className="text-xs text-white/70">SmartCRM Asszisztens</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* On/Off Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={true}
                            readOnly
                          />
                          <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 flex items-center px-1">
                            <span className="text-xs font-semibold text-white ml-1">ON</span>
                          </div>
                        </label>
                        <motion.button
                          onClick={() => setIsOpen(false)}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-white/70 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                          aria-label="Bezárás"
                        >
                          ✕
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area – sötét, jól olvasható */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/95 dark:bg-gray-900 custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <motion.div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-neon-pink/30 to-neon-purple/30 border border-neon-pink/60 text-white'
                                : 'bg-gray-700 dark:bg-gray-600 border border-gray-500/50 text-gray-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-700 dark:bg-gray-600 border border-gray-500/50 rounded-2xl px-4 py-3 text-gray-100">
                          <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-neon-cyan"
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area – erős háttér */}
                  <div className="p-4 border-t border-white/20 bg-gray-800 dark:bg-gray-900">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Írj üzenetet..."
                          className="w-full px-4 py-3 bg-gray-700 dark:bg-gray-800 border border-gray-500/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/50 transition-all"
                          disabled={isLoading}
                        />
                        {inputValue && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleSend}
                              disabled={!inputValue.trim() || isLoading}
                              className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-neon-pink/50 hover:shadow-neon-purple/50 transition-all"
                            >
                              ➤
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIRoliWidget;
