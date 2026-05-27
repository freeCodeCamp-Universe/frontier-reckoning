import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@app/App';
import { saveGameToStorage, isSaveableState } from '@game/systems/saveSystem';
import { getStoredSettings } from '@game/systems/settingsSystem';
import { useExpeditionStore } from '@stores/expeditionStore';
import './styles.css';

useExpeditionStore.subscribe((state) => {
  if (getStoredSettings(window.localStorage).autosaveEnabled && isSaveableState(state)) {
    saveGameToStorage(window.localStorage, state);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
