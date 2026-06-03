import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import PropertiesScreen from './src/screens/PropertiesScreen';
import PropertyDetailScreen from './src/screens/PropertyDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import PostPropertyScreen from './src/screens/PostPropertyScreen';
import FiltersScreen from './src/screens/FiltersScreen';
import LoginScreen from './src/screens/LoginScreen';
import DrawerMenu from './src/components/DrawerMenu';
import { DrawerContext, RootStackParamList } from './src/navigation';
import { AuthContext } from './src/auth/context';
import type { AuthUser } from './src/auth/types';
import { API_BASE } from './src/services/api';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Home');
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Handle deep-link callback from Google OAuth
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (!url.startsWith('ivanta-properties://callback')) return;
      const token = new URL(url).searchParams.get('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/token-exchange?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data?.success && data?.userData) {
          const u = data.userData;
          setUser({ id: String(u.id ?? u._id ?? ''), email: String(u.email ?? ''), name: String(u.name ?? ''), role: u.role ?? 'User' });
        }
      } catch {}
    };
    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ user, setUser }}>
        <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true), currentScreen }}>
          <NavigationContainer
            ref={navRef}
            onStateChange={(state) => {
              const route = state?.routes[state.index];
              if (route) setCurrentScreen(route.name);
            }}
          >
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Properties" component={PropertiesScreen} />
              <Stack.Screen name="Filters" component={FiltersScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen}
                options={{ headerShown: true, title: 'Property Details', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#1f2937' }} />
              <Stack.Screen name="Search" component={SearchScreen}
                options={{ headerShown: true, title: 'Search', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#1f2937' }} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="PostProperty" component={PostPropertyScreen}
                options={{ headerShown: true, title: 'Post Property', headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#1f2937' }} />
            </Stack.Navigator>
          </NavigationContainer>

          <DrawerMenu
            visible={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onNavigate={(screen, params) => {
              setDrawerOpen(false);
              setTimeout(() => {
                setCurrentScreen(screen);
                navRef.current?.navigate(screen as any, params as any);
              }, 200);
            }}
          />
        </DrawerContext.Provider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
