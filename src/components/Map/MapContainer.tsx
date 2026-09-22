import React, { useEffect, useRef, useContext } from 'react';
import './MapContainer.css';
import { AppContext } from '../../contexts/AppContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { mapProvider } from '../../services/mapProvider';
import { createSearchMarker, createUserMarker } from './MapMarker';

export const MapContainer: React.FC = () => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { theme } = useContext(ThemeContext);
  const { selectedPlace, userLocation, activeRoute } = useContext(AppContext) as any;
  
  const searchMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!mapRef.current) {
      mapRef.current = mapProvider.createMap(containerRef.current);
    }
    
    return () => {
      // cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapProvider.setTheme(mapRef.current, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (searchMarkerRef.current) {
      mapProvider.removeMarker(mapRef.current, searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    if (selectedPlace) {
      searchMarkerRef.current = createSearchMarker(mapRef.current, selectedPlace, () => {});
      mapProvider.addMarker(mapRef.current, searchMarkerRef.current);
      mapProvider.fitBounds(mapRef.current, [[selectedPlace.lat, selectedPlace.lng]]);
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (userMarkerRef.current) {
      mapProvider.removeMarker(mapRef.current, userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      userMarkerRef.current = createUserMarker(mapRef.current, userLocation);
      mapProvider.addMarker(mapRef.current, userMarkerRef.current);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (activeRoute) {
      mapProvider.drawRoute(mapRef.current, activeRoute.coordinates);
      mapProvider.fitBounds(mapRef.current, activeRoute.coordinates.map((c: any) => [c.lat, c.lng]));
    } else {
      mapProvider.removeRoute(mapRef.current);
    }
  }, [activeRoute]);

  return <div id="map-container" ref={containerRef} className="map-container" />;
};
