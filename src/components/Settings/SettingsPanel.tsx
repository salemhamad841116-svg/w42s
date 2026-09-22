import React, { useContext } from 'react';
import './SettingsPanel.css';
import { AppContext } from '../../contexts/AppContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export const SettingsPanel: React.FC = () => {
  const { appView, setAppView } = useContext(AppContext) as any;
  const { theme, toggleTheme } = useContext(ThemeContext) as any;
  const { lang, setLang, t, isRTL } = useContext(LanguageContext) as any;

  if (appView !== 'settings') return null;

  return (
    <div className={`settings-overlay ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="settings-panel">
        <div className="settings-header">
          <h2>{t('settings') || 'Settings'}</h2>
          <Button variant="ghost" onClick={() => setAppView('map')}>
            <Icon name="close" size={24} />
          </Button>
        </div>
        
        <div className="settings-content">
          <div className="settings-item">
            <span className="settings-label">{t('theme') || 'Theme'}</span>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </Button>
          </div>
          
          <div className="settings-item">
            <span className="settings-label">{t('language') || 'Language'}</span>
            <div className="lang-toggle">
              <Button 
                variant={lang === 'en' ? 'primary' : 'ghost'} 
                onClick={() => setLang('en')}
              >
                English
              </Button>
              <Button 
                variant={lang === 'ar' ? 'primary' : 'ghost'} 
                onClick={() => setLang('ar')}
              >
                العربية
              </Button>
            </div>
          </div>
          
          <div className="settings-about">
            <h3>Kharita Maps</h3>
            <p>Version 1.0.0</p>
            <p className="credits">Map data &copy; OpenStreetMap contributors</p>
          </div>
        </div>
      </div>
    </div>
  );
};
