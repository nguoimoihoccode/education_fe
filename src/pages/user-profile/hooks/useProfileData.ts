import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { getUserProgress, getUserStreak } from '@/api/education.api';
import { getQuizStats } from '@/api/quiz.api';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';

export function useProfileData() {
  const { user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'preferences'>('overview');
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgress,
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ['userStreak'],
    queryFn: getUserStreak,
    enabled: !!user,
  });

  const { data: quizStats } = useQuery({
    queryKey: ['quizStats'],
    queryFn: getQuizStats,
    enabled: !!user,
  });

  // ==================== MUTATIONS (with loading guards) ====================

  const saveProfileMutation = useMutation({
    mutationFn: (data: { displayName: string; phone: string }) =>
      apiClient.patch('/auth/profile', data),
    onSuccess: (response) => {
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    },
    onError: () => toast.error('Failed to change password'),
  });

  const avatarUploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (response) => {
      setUser(response.data);
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const handleSaveProfile = () => {
    if (saveProfileMutation.isPending) return;
    saveProfileMutation.mutate(editForm);
  };

  const handleChangePassword = () => {
    if (changePasswordMutation.isPending) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || avatarUploadMutation.isPending) return;
    avatarUploadMutation.mutate(file);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return {
    user, isEditing, setIsEditing,
    activeTab, setActiveTab,
    editForm, setEditForm,
    showPassword, setShowPassword,
    passwordForm, setPasswordForm,
    avatarInputRef,
    progress, streak, quizStats,
    memberSince,
    isSavingProfile: saveProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUploadingAvatar: avatarUploadMutation.isPending,
    handleSaveProfile, handleChangePassword, handleAvatarUpload, handleLogout,
  };
}
