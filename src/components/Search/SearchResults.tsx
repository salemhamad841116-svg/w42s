import React, { useContext } from 'react';
import './SearchResults.css';
import { AppContext } from '../../contexts/AppContext';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { Icon } from '../common/Icon';

export const SearchResults: React.FC<{ results: any[], loading: boolean }> = ({ results, loading }) => {
  const { setSelectedPlace } = useContext(AppContext) as any;
  const { addToHistory } = useSearchHistory() as any;

  const handleSelect = (place: any) => {
    setSelectedPlace(place);
    addToHistory(place);
  };

  if (loading) {
    return <div className="search-dropdown"><div className="loading">Loading...</div></div>;
  }

  if (results.length === 0) {
    return <div className="search-dropdown"><div className="no-results">No results found</div></div>;
  }

  return (
    <div className="search-dropdown">
      {results.map((result, idx) => (
        <div key={idx} className="result-item" onClick={() => handleSelect(result)}>
          <Icon name="location" size={18} color="#666" />
          <div className="result-info">
            <div className="result-name">{result.name}</div>
            <div className="result-address">{result.address}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
