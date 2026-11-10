import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export function useVideos() {
  return useQuery({ queryKey: ['videos'], queryFn: api.videos, select: (data) => data.videos });
}
