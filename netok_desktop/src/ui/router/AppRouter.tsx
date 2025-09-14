import React, { useState } from 'react';
import { MainPage } from '../pages/MainPage';
import { SettingsPage } from '../pages/SettingsPage';

export type AppRoute = 'main' | 'settings';

export const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('main');

  const handleSettingsClick = () => {
    setCurrentRoute('settings');
  };

  const handleCloseSettings = () => {
    setCurrentRoute('main');
  };

  switch (currentRoute) {
    case 'settings':
      return <SettingsPage onClose={handleCloseSettings} />;
    case 'main':
    default:
      return <MainPage onSettingsClick={handleSettingsClick} />;
  }
};
