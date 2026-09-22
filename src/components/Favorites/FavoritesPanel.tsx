import React, { useContext } from 'react';
import './FavoritesPanel.css';
import { useFavorites } from '../../hooks/useFavorites';
import { AppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';

export const FavoritesPanel: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites() as any;
  const { setSelectedPlace } = useContext(AppContext) as any;

  if (!favorites || favorites.length === 0) {
    return <div className="favorites-empty">No favorites yet.</div>;
  }

  return (
    <div className="favorites-list">
      {favorites.map((fav: any) => (
        <div key={fav.id} className="favorite-item">
          <div className="favorite-content" onClick={() => setSelectedPlace(fav)}>
            <Icon name="starFilled" size={20} color="#f4b400" />
            <div className="favorite-info">
              <div className="favorite-name">{fav.name}</div>
              <div className="favorite-address">{fav.address}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeFavorite(fav.id)}>
            <Icon name="delete" size={18} color="#e74c3c" />
          </Button>
        </div>
      ))}
    </div>
  );
};
