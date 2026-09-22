import React, { useContext } from 'react';
import './MapControls.css';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { useLocation } from '../../hooks/useLocation';

export const MapControls: React.FC = () => {
  const { locateUser, isLocating } = useLocation() as any;

  return (
    <div className="map-controls">
      <div className="control-group">
        <Button variant="icon" aria-label="Zoom In">
          <Icon name="zoomIn" size={20} />
        </Button>
        <Button variant="icon" aria-label="Zoom Out">
          <Icon name="zoomOut" size={20} />
        </Button>
      </div>
      <Button variant="icon" onClick={locateUser} disabled={isLocating} className="locate-btn">
        <Icon name="location" size={20} color={isLocating ? '#999' : '#4285f4'} />
      </Button>
    </div>
  );
};
