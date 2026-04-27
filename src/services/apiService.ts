import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
import { navigationRef } from '../navigation';

/**
 * Centralized API Service
 * 
 * 1. Gets token from storage
 * 2. Attaches Authorization header to every request
 * 4. If token is missing, redirects to login and does NOT call the API.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Get token from storage
  const token = await AsyncStorage.getItem('token');

  // Add the logs requested by the user
  console.log("API CALL:", endpoint);
  console.log("TOKEN:", token);

  // 4. If token missing: redirect to login and do NOT call API
  if (!token) {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
    throw new Error('No auth token found');
  }

  // Ensure endpoint starts with slash if missing, or use BASE_URL properly
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // 2. Attach to every request
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  // 7. Handle frontend error properly
  if (response.status === 401) {
    console.warn('apiFetch: 401 Unauthorized. Redirecting to login.');
    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
    throw new Error('UNAUTHORIZED: Redirected to login');
  }

  return response;
};

// 3. Example usage helper (as requested in the prompt)
export const fetchProductsExample = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    if (navigationRef.isReady()) navigationRef.navigate('Login');
    throw new Error('UNAUTHORIZED: Redirected to login');
  }
  
  const res = await fetch(`${BASE_URL}/api/shop/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
};
