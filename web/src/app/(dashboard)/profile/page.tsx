"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { LoadingState, ErrorState } from '@/components/ui/states';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.auth.me()
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // @ts-ignore
      return api.users.update(user!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><LoadingState message="Loading profile..." /></div>;
  if (error || !user) return <div className="p-8"><ErrorState description="Failed to load profile" /></div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
      {isEditing ? (
        <ProfileEdit 
          user={user} 
          onSave={(data) => mutation.mutate(data)} 
          onCancel={() => setIsEditing(false)} 
          isSaving={mutation.isPending}
        />
      ) : (
        <ProfileView 
          user={user} 
          onEdit={() => setIsEditing(true)} 
        />
      )}
    </div>
  );
}
