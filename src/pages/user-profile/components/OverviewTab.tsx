import {
  BookOpen, Brain, Trophy, Flame, Clock, Target, TrendingUp, Award,
  User, Mail, Phone, Calendar, Shield, Zap, CheckCircle, Edit3,
} from 'lucide-react';
import { StatCard, DetailRow } from './SharedComponents';

interface OverviewTabProps {
  isEditing: boolean;
  editForm: { displayName: string; phone: string };
  setEditForm: (form: { displayName: string; phone: string }) => void;
  progress: any;
  streak: any;
  quizStats: any;
  user: any;
  memberSince: string;
}

export default function OverviewTab({
  isEditing, editForm, setEditForm,
  progress, streak, quizStats, user, memberSince,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Edit Form */}
      {isEditing && (
        <div className="bg-slate-800/80 backdrop-blur-md border border-accent-500/20 rounded-3xl p-8 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
          <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-accent-400" /> Edit Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
              <input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
              <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+84 123 456 789"
                className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* Learning Stats */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Learning Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Flame} value={streak?.currentStreak || 0} label="Day Streak" color="amber" suffix=" 🔥" />
          <StatCard icon={BookOpen} value={progress?.completedLessons || 0} label="Lessons Done" color="violet" />
          <StatCard icon={Brain} value={progress?.learnedVocabularies || 0} label="Vocab Learned" color="fuchsia" />
          <StatCard icon={Clock} value={progress?.streak?.totalXp || 0} label="Total XP" color="emerald" />
        </div>
      </div>

      {/* Quiz Performance */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quiz Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Trophy} value={quizStats?.totalQuizzes || 0} label="Quizzes Taken" color="amber" />
          <StatCard icon={Target} value={Math.round(quizStats?.averageScore || 0)} label="Avg Score" color="violet" suffix="%" />
          <StatCard icon={Award} value={quizStats?.passedQuizzes || 0} label="Passed" color="emerald" />
          <StatCard icon={TrendingUp} value={quizStats?.highestScore || 0} label="Best Score" color="fuchsia" suffix="%" />
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <User className="w-5 h-5 text-accent-400" /> Account Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <DetailRow icon={User} label="Display Name" value={user?.displayName || '--'} />
          <DetailRow icon={Mail} label="Email Address" value={user?.email || '--'} />
          <DetailRow icon={Phone} label="Phone Number" value={user?.phone || 'Not set'} />
          <DetailRow icon={Calendar} label="Member Since" value={memberSince} />
          <DetailRow icon={Shield} label="Account Status" value="Active" valueColor="text-emerald-400" />
          <DetailRow icon={Zap} label="Plan" value="Pro Learner" valueColor="text-accent-400" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-black font-headline text-white mb-6 flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent-400" /> Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { icon: BookOpen, label: 'Completed Spanish Lesson 5', time: '2 hours ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Brain, label: 'Reviewed 25 flashcards', time: '5 hours ago', color: 'text-accent-400', bg: 'bg-accent-500/10' },
            { icon: Trophy, label: 'Passed Grammar Quiz with 92%', time: '1 day ago', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { icon: Flame, label: '7-day streak achieved!', time: '2 days ago', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: Award, label: 'Earned "Fast Learner" badge', time: '3 days ago', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-all group">
              <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center`}>
                <activity.icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{activity.label}</p>
                <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
