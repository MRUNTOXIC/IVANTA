// Broadcast channel for real-time property updates
export const propertyUpdateChannel = typeof window !== 'undefined' 
  ? new BroadcastChannel('property-updates')
  : null;

export const notifyPropertyUpdate = () => {
  if (propertyUpdateChannel) {
    propertyUpdateChannel.postMessage({ type: 'PROPERTY_UPDATED', timestamp: Date.now() });
  }
};
