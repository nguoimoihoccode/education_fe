import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon, value, label, color, suffix = '',
}: {
  icon: LucideIcon; value: number; label: string;
  color: 'violet' | 'emerald' | 'amber' | 'fuchsia'; suffix?: string;
}) {
  const colorConfigs = {
    violet: { text: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20', icon: 'from-accent-500 to-indigo-500' },
    emerald: { text: 'text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20', icon: 'from-emerald-500 to-teal-500' },
    amber: { text: 'text-amber-400', glow: 'bg-amber-500/10 group-hover:bg-amber-500/20', icon: 'from-amber-500 to-orange-500' },
    fuchsia: { text: 'text-fuchsia-400', glow: 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20', icon: 'from-fuchsia-500 to-pink-500' },
  };
  const config = colorConfigs[color];
  return (
    <div className="group bg-slate-800/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden hover:-translate-y-0.5 hover:border-white/20 transition-all duration-300">
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] transition-colors duration-500 ${config.glow}`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.icon} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-3xl font-black font-mono ${config.text}`}>{value}{suffix}</div>
      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export function DetailRow({ icon: Icon, label, value, valueColor = 'text-white' }: {
  icon: LucideIcon; label: string; value: string; valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-bold ${valueColor} truncate`}>{value}</p>
      </div>
    </div>
  );
}

export function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.02] transition-all">
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button onClick={onChange} className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${checked ? 'bg-accent-600' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
