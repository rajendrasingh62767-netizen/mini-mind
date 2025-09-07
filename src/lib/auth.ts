import type { User } from './types';

const USER_STORAGE_KEY = 'mini-mind-user';

export function saveUserToLocalStorage(user: User) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function getLoggedInUser(): User | null {
  if (typeof window !== 'undefined') {
    const userJson = window.localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
      }
    }
  }
  return null;
}

export function clearUserFromLocalStorage() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}
