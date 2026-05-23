import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MusicProvider } from './app/context/MusicContext';
import App from './app/App';
import './styles/index.css';
import './styles/globals.css';
import './styles/theme.css';
import './styles/shadcn-theme.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <MusicProvider>
      <App />
    </MusicProvider>
  </StrictMode>
);
