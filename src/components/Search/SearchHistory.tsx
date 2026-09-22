import React, { useContext } from 'react';
import './SearchHistory.css';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { AppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

export const SearchHistory: React.FC = () => {
  const { history, clearHistory } = useSearchHistory() as any;
  const { setSelectedPlace } = useContext(AppContext) as any;

  if (!history || history.length === 0) return null;

  return (
    <div className="search-dropdown history-dropdown">
      <div className="history-header">
        <span>Recent Searches</span>
        <Button variant="ghost" size="sm" onClick={clearHistory}>Clear</Button>
      </div>
      {history.map((item: any, idx: number) => (
        <div key={idx} className="result-item" onMouseDown={() => setSelectedPlace(item)}>
          <Icon name="history" size={18} color="#666" />
          <div className="result-info">
            <div className="result-name">{item.resultName || item.query}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
