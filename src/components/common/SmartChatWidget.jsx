import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * SmartChat gomb: a külön SmartChat oldalra navigál (/smart-chat).
 * A SmartChat-nek saját ablaka/oldala van.
 */
const SmartChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSmartChatPage = location.pathname === '/smart-chat';

  useEffect(() => {
    const handleOpen = () => {
      navigate('/smart-chat');
    };
    window.addEventListener('openSmartChat', handleOpen);
    return () => window.removeEventListener('openSmartChat', handleOpen);
  }, [navigate]);

  return (
    <motion.button
      onClick={() => navigate('/smart-chat')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative bg-blue-700 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900 text-white border-0 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg"
      aria-label="SmartChat megnyitása (külön ablak)"
      aria-current={isSmartChatPage ? 'page' : undefined}
    >
      <span className="text-lg" aria-hidden>💬</span>
      <span className="font-semibold">SmartChat</span>
    </motion.button>
  );
};

export default SmartChatWidget;
