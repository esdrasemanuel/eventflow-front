import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checks if there is a session saved on the device disk when the app boots
  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AsyncStorage.getItem('@EventFlow:user');
      const storedToken = await AsyncStorage.getItem('@EventFlow:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Persists session data when login success
  async function signIn(userData, token) {
    setUser(userData);
    await AsyncStorage.setItem('@EventFlow:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@EventFlow:token', token);
  }

  // Clears storage when logout
  async function signOut() {
    await AsyncStorage.multiRemove(['@EventFlow:user', '@EventFlow:token']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier access down the component tree
export function useAuth() {
  return useContext(AuthContext);
}