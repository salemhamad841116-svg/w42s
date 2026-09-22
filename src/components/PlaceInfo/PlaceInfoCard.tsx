import React, { useContext } from 'react';
import './PlaceInfoCard.css';
import { AppContext } from '../../contexts/AppContext';
import { useDirections } from '../../hooks/useDirections';
import { useFavorites } from '../../hooks/useFavorites';
import { useLocation } from '../../hooks/useLocation';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export const PlaceInfoCard: React.FC = () => {
  const { selectedPlace, setSelectedPlace, userLocation } = useContext(AppContext) as any;
  const { getRoute } = useDirections() as any;
  const { isFavorite, addFavorite, removeFavorite } = useFavorites() as any;
  const { locateUser } = useLocation() as any;

  if (!selectedPlace) return null;

  const handleDirections = async () => {
    let origin = userLocation;
    if (!origin) {
      origin = await locateUser();
    }
    if (origin) {
      getRoute(origin, selectedPlace);
    }
  };

  const isFav = isFavorite(selectedPlace.id);
  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(selectedPlace.id);
    } else {
      addFavorite(selectedPlace);
    }
  };

  return (
    <div className="place-info-card">
      <div className="card-header">
        <h2 className="place-name">{selectedPlace.name || selectedPlace.displayName}</h2>
        <Button variant="ghost" className="close-btn" onClick={() => setSelectedPlace(null)}>
          <Icon name="close" size={20} />
        </Button>
      </div>
      <p className="place-address">{selectedPlace.address}</p>
      
      <div className="card-actions">
        <Button variant="primary" className="action-btn" onClick={handleDirections}>
          <Icon name="directions" size={18} color="white" />
          Directions
        </Button>
        <Button variant="secondary" className="action-btn fav-btn" onClick={toggleFavorite}>
          <Icon name={isFav ? "starFilled" : "star"} size={18} color={isFav ? "#f4b400" : "currentColor"} />
          {isFav ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
