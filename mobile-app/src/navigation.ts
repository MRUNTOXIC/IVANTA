import React, { createContext, useContext } from 'react';
import type { MobileFilters, FilterPropertyLite } from './filters/types';
import type { UserRole } from './auth/types';

export type RootStackParamList = {
  Home: undefined;
  Properties: { type?: string; category?: string; filters?: MobileFilters } | undefined;
  PropertyDetail: { propertyId: string };
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
  PostProperty: undefined;
  Filters: { type?: string; initial?: MobileFilters; properties: FilterPropertyLite[]; returnParams?: { type?: string; category?: string } };
  Login: { role?: UserRole } | undefined;
};

export const DrawerContext = createContext<{
  openDrawer: () => void;
  currentScreen: string;
}>({ openDrawer: () => {}, currentScreen: 'Home' });

export const useDrawer = () => useContext(DrawerContext);
