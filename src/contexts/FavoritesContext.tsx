"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: Set<string>;
  isLoading: boolean;
  isAuthenticated: boolean;
  addFavorite: (propertyId: string) => Promise<boolean>;
  removeFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Read non-httpOnly cookie synchronously on mount
    if (typeof document !== 'undefined') {
      return document.cookie.split(';').some(c => c.trim().startsWith('userLoggedIn=true'));
    }
    return false;
  });

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    try {
      const authResponse = await fetch('/api/auth/me');
      if (authResponse.ok) {
        setIsAuthenticated(true);
        await fetchFavorites();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favIds = new Set<string>(data.data.map((p: any) => p._id as string));
        setFavorites(favIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addFavorite = async (propertyId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });

      if (response.ok) {
        setFavorites(prev => new Set([...prev, propertyId]));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  };

  const removeFavorite = async (propertyId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return favorites.has(propertyId);
  };

  const refreshFavorites = async () => {
    setIsLoading(true);
    await fetchFavorites();
    setIsLoading(false);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isAuthenticated,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
