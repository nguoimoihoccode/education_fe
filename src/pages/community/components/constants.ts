import {
  Flame, Lightbulb, Video, Trophy, BookOpen, FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const eventTypeConfig: Record<string, { color: string; bg: string; icon: LucideIcon; label: string }> = {
  challenge: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Flame, label: 'Thử thách' },
  workshop: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Lightbulb, label: 'Workshop' },
  live: { color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/20', icon: Video, label: 'Trực tiếp' },
  contest: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20', icon: Trophy, label: 'Cuộc thi' },
};

export const resourceTypeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  deck: { icon: BookOpen, color: 'from-accent-500 to-indigo-500' },
  guide: { icon: FileText, color: 'from-emerald-500 to-teal-500' },
  notes: { icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  video: { icon: Video, color: 'from-fuchsia-500 to-pink-500' },
};

export const formatStatValue = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};
