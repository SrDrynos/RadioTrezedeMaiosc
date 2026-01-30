import { User, UserRole } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Hardcoded check for demo purposes, in real app this checks hash against DB
    if (email === 'drynos.com@gmail.com' && password === '332526') {
      const user: User = {
        id: '1',
        name: 'Administrador Master',
        email: email,
        role: UserRole.ADMIN
      };
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('auth_user');
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_user');
  }
};