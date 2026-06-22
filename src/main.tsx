import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@dls/tokens.css';
import '@dls/components.css';
import 'leaflet/dist/leaflet.css';
import './app.css';
import './grab-theme.css';
import './quote-theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
