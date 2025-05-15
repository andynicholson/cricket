import { useContext } from 'react';
import { StravaContext } from '../contexts/StravaContext';

export const useStrava = () => {
  const context = useContext(StravaContext);
  if (context === undefined) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
}; 