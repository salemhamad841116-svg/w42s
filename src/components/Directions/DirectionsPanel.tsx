import React, { useContext } from 'react';
import './DirectionsPanel.css';
import { AppContext } from '../../contexts/AppContext';
import { distance as distanceUtils } from '../../utils/distance';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export const DirectionsPanel: React.FC = () => {
  const { activeRoute, setActiveRoute } = useContext(AppContext) as any;

  if (!activeRoute) return null;

  return (
    <div className="directions-panel">
      <div className="route-info">
        <div className="route-metric">
          <span className="metric-value">{distanceUtils.formatDistance(activeRoute.distance)}</span>
          <span className="metric-label">distance</span>
        </div>
        <div className="route-metric">
          <span className="metric-value">{distanceUtils.formatDuration(activeRoute.duration)}</span>
          <span className="metric-label">duration</span>
        </div>
      </div>
      <Button variant="ghost" className="close-route-btn" onClick={() => setActiveRoute(null)}>
        <Icon name="close" size={20} />
      </Button>
    </div>
  );
};
