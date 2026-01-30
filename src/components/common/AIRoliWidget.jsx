import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '../../services/api';
import useToastStore from '../../stores/toastStore';
import './AIRoliWidget.css';

const AIRoliWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null }); // null = default bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: 350, height: 450 });
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const widgetRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  
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
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized, messages]);

  // Listen for custom event to open widget
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
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

  // Draggable functionality
  const handleDragStart = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x ?? (window.innerWidth - size.width - 20),
      posY: position.y ?? (window.innerHeight - size.height - 20)
    };
  }, [position, size]);

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size]);

  // Touch support for dragging
  const handleDragStartTouch = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x ?? (window.innerWidth - size.width - 20),
      posY: position.y ?? (window.innerHeight - size.height - 20)
    };
  }, [position, size]);

  useEffect(() => {
    if (!isDragging) return;
    
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };
    
    const handleTouchEnd = () => setIsDragging(false);
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, size]);

  // Resize functionality
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  }, [size]);

  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - resizeStartRef.current.x;
      const dy = e.clientY - resizeStartRef.current.y;
      const newWidth = Math.max(300, Math.min(500, resizeStartRef.current.width + dx));
      const newHeight = Math.max(350, Math.min(600, resizeStartRef.current.height + dy));
      setSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Calculate position - default bottom-right if not set
  const getPosition = () => {
    if (position.x !== null && position.y !== null) {
      return { left: `${position.x}px`, top: `${position.y}px` };
    }
    return { right: '20px', bottom: '20px' };
  };

  return (
    <>
      {/* Header Button OR Minimized FAB Button */}
      {!isOpen ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 hover:from-pink-600 hover:via-pink-700 hover:to-rose-600 text-white rounded-lg font-medium transition-all"
          style={{ boxShadow: '0 0 20px rgba(255, 0, 110, 0.4), 0 10px 25px rgba(0, 0, 0, 0.3)' }}
          aria-label="AI Roli megnyitása"
          title="AI Roli - Asszisztens"
        >
          <span className="text-lg"></span>
          <span className="hidden sm:inline text-sm">AI Roli</span>
        </motion.button>
      ) : null}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="airoli-chat-window"
            style={{
              ...getPosition(),
              width: `${size.width}px`,
              height: `${size.height}px`,
              position: 'fixed',
              zIndex: 9999
            }}
          >
            {/* Header - draggable */}
            <div
              className="airoli-header"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStartTouch}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div className="airoli-avatar">
                <span className="text-xl"></span>
                <span className="online-dot" />
              </div>
              <div className="airoli-info">
                <h4>AI Roli</h4>
                <span>SmartCRM Asszisztens</span>
              </div>
              <div className="airoli-controls">
                <button
                  onClick={toggleMinimize}
                  aria-label={isMinimized ? 'Maximalizálás' : 'Minimalizálás'}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isMinimized ? '+' : ''}
                </button>
                <button
                  onClick={handleClose}
                  aria-label="Bezárás"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="airoli-messages">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                      >
                        <p className="message-text">{msg.content}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="message assistant"
                    >
                      <div className="typing-indicator">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="typing-dot"
                            animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="airoli-input-area">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Írj üzenetet..."
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="send-button"
                  >
                    Küldés
                  </button>
                </div>

                {/* Resize Handle */}
                <div
                  className="resize-handle"
                  onMouseDown={handleResizeStart}
                  style={{ cursor: 'nwse-resize' }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIRoliWidget;
