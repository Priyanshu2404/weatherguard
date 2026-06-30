import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import type { User } from '../context/AuthContext';

export interface AdminUser extends User {
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await client.get<AdminUser[]>('/users');
      return data;
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'rejected' | 'pending';
    }) => {
      const { data } = await client.patch<AdminUser>(`/users/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useTriggerAlerts() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post('/scheduler/trigger');
      return data;
    },
  });
}
