import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Override fetch to always include credentials (HttpOnly cookies) by default
const originalFetch = window.fetch;
window.fetch = async function (resource, config = {}) {
  if (config.credentials === undefined) {
    config.credentials = 'include';
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
