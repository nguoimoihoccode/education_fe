import { Compass, Users, Calendar, MessageSquare, BookOpen } from 'lucide-react';
import { useCommunityData, type TabId } from './community/hooks/useCommunityData';
import OverviewTab from './community/components/OverviewTab';
import GroupsTab from './community/components/GroupsTab';
import EventsTab from './community/components/EventsTab';
import ForumTab from './community/components/ForumTab';
import ResourcesTab from './community/components/ResourcesTab';
import './Education.css';

const TAB_ITEMS: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'groups', label: 'Study Groups', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'forum', label: 'Forum', icon: MessageSquare },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

export default function CommunityHub() {
  const data = useCommunityData();

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/6 rounded-full blur-[120px]" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent-600/6 rounded-full blur-[100px]" />
          </div>
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
              <Compass className="w-8 h-8 text-emerald-400" />
              Community Hub
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
              Study groups • Events • Forum • Resources
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => data.setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                data.activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {data.activeTab === 'overview' && (
          <OverviewTab
            stats={data.stats}
            groups={data.groups}
            events={data.events}
            threads={data.threads}
            topMembers={data.topMembers}
            isLoadingGroups={data.isLoadingGroups}
            isLoadingEvents={data.isLoadingEvents}
            isLoadingThreads={data.isLoadingThreads}
            toggleJoinGroup={data.toggleJoinGroup}
            toggleRegisterEvent={data.toggleRegisterEvent}
            setActiveTab={data.setActiveTab}
          />
        )}
        {data.activeTab === 'groups' && (
          <GroupsTab
            groups={data.groups}
            isLoading={data.isLoadingGroups}
            searchQuery={data.searchQuery}
            setSearchQuery={data.setSearchQuery}
            toggleJoinGroup={data.toggleJoinGroup}
          />
        )}
        {data.activeTab === 'events' && (
          <EventsTab events={data.events} isLoading={data.isLoadingEvents} toggleRegisterEvent={data.toggleRegisterEvent} />
        )}
        {data.activeTab === 'forum' && (
          <ForumTab threads={data.threads} isLoading={data.isLoadingThreads} />
        )}
        {data.activeTab === 'resources' && (
          <ResourcesTab resources={data.resources} isLoading={data.isLoadingResources} />
        )}
      </div>
    </div>
  );
}
