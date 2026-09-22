import React, { useContext, useState } from 'react';
import './SearchBar.css';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { useSearch } from '../../hooks/useSearch';
import { LanguageContext } from '../../contexts/LanguageContext';
import { AppContext } from '../../contexts/AppContext';
import { SearchResults } from './SearchResults';
import { SearchHistory } from './SearchHistory';

export const SearchBar: React.FC = () => {
  const { query, setQuery, results, isSearching, clearSearch } = useSearch() as any;
  const { t, isRTL } = useContext(LanguageContext) as any;
  const { setAppView } = useContext(AppContext) as any;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`search-container ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="search-bar">
        <Icon name="search" className="search-icon" color="#666" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={t('searchPlaceholder') || 'Search places...'}
          className="search-input"
        />
        {query && (
          <Button variant="ghost" className="clear-btn" onClick={clearSearch}>
            <Icon name="close" size={18} />
          </Button>
        )}
        <div className="divider"></div>
        <Button variant="ghost" className="settings-btn" onClick={() => setAppView('settings')}>
          <Icon name="settings" size={20} />
        </Button>
      </div>

      {isFocused && query && <SearchResults results={results} loading={isSearching} />}
      {isFocused && !query && <SearchHistory />}
    </div>
  );
};
