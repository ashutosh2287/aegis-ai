import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, type UserProfile, type UpdateProfileData } from '../lib/profile.service';

export const useProfile = () => {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UpdateProfileData>({
    mutationFn: (data) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
