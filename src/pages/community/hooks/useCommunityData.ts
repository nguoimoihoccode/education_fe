import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useRateLimit';
import {
  getStudyGroups,
  getCommunityEvents,
  getForumThreads,
  getSharedResources,
  getTopMembers,
  getCommunityStats,
  joinGroup,
  leaveGroup,
  registerEvent,
  unregisterEvent,
} from '@/api/community.api';

export type TabId = 'overview' | 'groups' | 'events' | 'forum' | 'resources';

export function useCommunityData() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // ==================== QUERIES ====================

  const { data: statsData } = useQuery({
    queryKey: ['communityStats'],
    queryFn: getCommunityStats,
    staleTime: 1000 * 60 * 5,
  });

  const { data: groupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['studyGroups'],
    queryFn: () => getStudyGroups({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['communityEvents'],
    queryFn: () => getCommunityEvents({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: threadsData, isLoading: isLoadingThreads } = useQuery({
    queryKey: ['forumThreads'],
    queryFn: () => getForumThreads({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
    enabled: activeTab === 'overview' || activeTab === 'forum',
  });

  const { data: resourcesData, isLoading: isLoadingResources } = useQuery({
    queryKey: ['sharedResources'],
    queryFn: () => getSharedResources({ limit: 20 }),
    staleTime: 1000 * 60 * 2,
    enabled: activeTab === 'overview' || activeTab === 'resources',
  });

  const { data: topMembers = [] } = useQuery({
    queryKey: ['topMembers'],
    queryFn: () => getTopMembers(3),
    staleTime: 1000 * 60 * 5,
    enabled: activeTab === 'overview',
  });

  // ==================== MUTATIONS ====================

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      toast.success('Joined group!');
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      toast.success('Left group');
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: (eventId: string) => registerEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
      toast.success('Registered for event!');
    },
  });

  const unregisterEventMutation = useMutation({
    mutationFn: (eventId: string) => unregisterEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
    },
  });

  // ==================== HANDLERS ====================

  const toggleJoinGroup = (id: string, isJoined: boolean) => {
    if (joinGroupMutation.isPending || leaveGroupMutation.isPending) return;
    if (isJoined) leaveGroupMutation.mutate(id);
    else joinGroupMutation.mutate(id);
  };

  const toggleRegisterEvent = (id: string, isRegistered: boolean) => {
    if (registerEventMutation.isPending || unregisterEventMutation.isPending) return;
    if (isRegistered) unregisterEventMutation.mutate(id);
    else registerEventMutation.mutate(id);
  };

  // ==================== DERIVED DATA ====================

  const groups = groupsData?.data || [];
  const events = eventsData?.data || [];
  const threads = threadsData?.data || [];
  const resources = resourcesData?.data || [];
  const stats = statsData || { totalMembers: 0, totalDiscussions: 0, totalResources: 0, eventsThisMonth: 0 };

  return {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery, debouncedSearch,
    groups, events, threads, resources, stats, topMembers,
    isLoadingGroups, isLoadingEvents, isLoadingThreads, isLoadingResources,
    isTogglingGroup: joinGroupMutation.isPending || leaveGroupMutation.isPending,
    isTogglingEvent: registerEventMutation.isPending || unregisterEventMutation.isPending,
    toggleJoinGroup, toggleRegisterEvent,
  };
}
