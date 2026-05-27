import { useCallback, useEffect, useState } from 'react';
import {
  defaultSettings,
  getStoredSettings,
  SETTINGS_CHANGED_EVENT,
  updateStoredSettings,
  type FrontierSettings,
} from '@game/systems/settingsSystem';

export function useSettings() {
  const [settings, setSettings] = useState<FrontierSettings>(() =>
    typeof window === 'undefined'
      ? defaultSettings
      : getStoredSettings(window.localStorage),
  );

  useEffect(() => {
    const handleSettingsChanged = () => {
      setSettings(getStoredSettings(window.localStorage));
    };

    window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    window.addEventListener('storage', handleSettingsChanged);

    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
      window.removeEventListener('storage', handleSettingsChanged);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<FrontierSettings>) => {
    setSettings(updateStoredSettings(window.localStorage, updates));
  }, []);

  return [settings, updateSettings] as const;
}
