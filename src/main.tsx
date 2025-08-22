import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWithAPI from './AppWithAPI.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithAPI />
  </StrictMode>
);
