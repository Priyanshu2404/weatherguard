import { useMutation } from '@tanstack/react-query';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useUpdateCity() {
  const { refetch } = useAuth();

  return useMutation({
    mutationFn: async (city: string) => {
      const { data } = await client.patch('/users/me/city', { city });
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });
}
