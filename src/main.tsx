import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { NODE_ENV: import.meta.env.MODE } };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
