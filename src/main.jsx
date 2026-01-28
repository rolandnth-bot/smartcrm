import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Service Worker regisztráció (PWA offline támogatás)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('Service Worker regisztrálva:', registration.scope);
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('Service Worker regisztráció hiba:', error);
        }
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

