import { useQuery } from '@tanstack/react-query';

export const useIdentityProfile = () => {
  return useQuery({
    queryKey: ['identityProfile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/onboarding';
        throw new Error('No token found');
      }
      
      const res = await fetch('/api/identity/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/onboarding';
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return res.json();
    },
    retry: false
  });
};
