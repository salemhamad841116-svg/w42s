export const createSearchMarker = (map: any, place: any, onClick: () => void): any => {
  // Mock function, assuming L is available globally or imported in real app
  return { id: place.id, type: 'search', lat: place.lat, lng: place.lng };
};

export const createUserMarker = (map: any, position: any): any => {
  // Mock function
  return { type: 'user', lat: position.lat, lng: position.lng };
};
