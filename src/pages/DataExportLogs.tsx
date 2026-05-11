import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  Filter,
  Search,
  Clock,
  Brain,
  BookOpen,
  Target,
  Zap,
  Flame,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import './Education.css';

/* ================================================================ */
/* ==================== TYPES ====================                  */

interface LogEntry {
  id: string;
  date: string;
  type: 'system' | 'learning' | 'practice' | 'social' | 'achievement';
  action: string;
  detail: string;
  xp: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface ExportEntry {
  id: string;
  date: string;
  format: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
  name: string;
  downloadUrl?: string;
}

interface LearningLogEntry {
  id: string;
  date?: string;
  createdAt?: string;
  type: LogEntry['type'];
  action: string;
  detail?: string;
  description?: string;
  xp?: number;
}

/* ==================== API CALLS ==================== */

const getLearningLogs = async (params?: {
  type?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: LearningLogEntry[]; meta: { total: number; page: number; totalPages: number } }> => {
  try {
    const response = await apiClient.get('/education/logs', { params });
    return response.data;
  } catch {
    return { data: [], meta: { total: 0, page: 1, totalPages: 0 } };
  }
};

const getExportHistory = async (): Promise<ExportEntry[]> => {
  try {
    const response = await apiClient.get('/education/exports');
    return response.data;
  } catch {
    return [];
  }
};

const requestDataExport = async (params: {
  format: 'json' | 'csv';
  timeRange: string;
  dataTypes: Record<string, boolean>;
}): Promise<ExportEntry> => {
  const response = await apiClient.post('/education/exports', params);
  return response.data;
};

const downloadExport = async (exportId: string): Promise<void> => {
  const response = await apiClient.get(`/education/exports/${exportId}/download`, {
    responseType: 'blob',
  });
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `edupro_export_${exportId}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/* ==================== ICON MAPPING ==================== */

function getLogIcon(type: string, action: string): { icon: LucideIcon; color: string; bg: string } {
  switch (type) {
    case 'learning':
      if (action.toLowerCase().includes('quiz')) return { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      if (action.toLowerCase().includes('course')) return { icon: BookOpen, color: 'text-accent-400', bg: 'bg-accent-500/10' };
      if (action.toLowerCase().includes('ai')) return { icon: Zap, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' };
      return { icon: BookOpen, color: 'text-accent-400', bg: 'bg-accent-500/10' };
    case 'practice':
      return { icon: Brain, color: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 'achievement':
      return { icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/10' };
    case 'social':
      return { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    default:
      return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10' };
  }
}

/* ================================================================ */

export default function DataExportLogs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'export' | 'logs'>('export');
  
  // Export State
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [timeRange, setTimeRange] = useState('all');
  const [dataTypes, setDataTypes] = useState({
    profile: true,
    progress: true,
    flashcards: true,
    quizzes: true,
    forum: false
  });

  // Logs State
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const logsLimit = 20;

  // Fetch export history
  const { data: exports = [], isLoading: isLoadingExports } = useQuery({
    queryKey: ['exportHistory'],
    queryFn: getExportHistory,
    staleTime: 1000 * 60 * 1,
  });

  // Fetch learning logs
  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['learningLogs', logFilter, logSearch, logsPage],
    queryFn: () => getLearningLogs({
      type: logFilter === 'all' ? undefined : logFilter,
      search: logSearch || undefined,
      page: logsPage,
      limit: logsLimit,
    }),
    staleTime: 1000 * 60 * 1,
    enabled: activeTab === 'logs',
  });

  const logs = logsData?.data || [];
  const logsMeta = logsData?.meta || { total: 0, page: 1, totalPages: 0 };

  // Map API log data to display format
  const displayLogs: LogEntry[] = logs.map((log) => {
    const iconInfo = getLogIcon(log.type, log.action);
    return {
      id: log.id,
      date: log.date || log.createdAt || '',
      type: log.type,
      action: log.action,
      detail: log.detail || log.description || '',
      xp: log.xp || 0,
      icon: iconInfo.icon,
      color: iconInfo.color,
      bg: iconInfo.bg,
    };
  });

  // Request export mutation
  const exportMutation = useMutation({
    mutationFn: requestDataExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportHistory'] });
      toast.success('Export requested! You will be notified when it\'s ready.');
    },
    onError: () => {
      toast.error('Failed to request export. Please try again.');
    },
  });

  const toggleDataType = (key: keyof typeof dataTypes) => {
    setDataTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRequestExport = () => {
    exportMutation.mutate({ format, timeRange, dataTypes });
  };

  const handleDownload = async (exp: ExportEntry) => {
    try {
      if (exp.downloadUrl) {
        window.open(exp.downloadUrl, '_blank');
      } else {
        await downloadExport(exp.id);
      }
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download export.');
    }
  };

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
                <Database className="w-8 h-8 text-teal-400" />
                Data & Logs
              </h1>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
                Manage your data and view learning history
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('export')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'export' ? 'bg-teal-600/20 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.15)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Data Export
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'logs' ? 'bg-accent-600/20 text-accent-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Learning Logs
              </button>
            </div>
          </div>

          {/* ==================== EXPORT TAB ==================== */}
          {activeTab === 'export' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Left: Export Form */}
              <div className="space-y-6">
                <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                  <h2 className="text-lg font-black font-headline text-white mb-6">Create New Export</h2>
                  
                  {/* Format */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormat('json')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                          format === 'json' ? 'bg-teal-600/10 border-teal-500/30 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.1)]' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <FileJson className="w-5 h-5" /> JSON (Developer)
                      </button>
                      <button
                        onClick={() => setFormat('csv')}
                        className={`flex items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                          format === 'csv' ? 'bg-teal-600/10 border-teal-500/30 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.1)]' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <FileSpreadsheet className="w-5 h-5" /> CSV (Spreadsheet)
                      </button>
                    </div>
                  </div>

                  {/* Range */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Time Range</label>
                    <select 
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none"
                    >
                      <option value="all">All Time (Complete History)</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="yeartodate">Year to Date</option>
                      <option value="custom">Custom Range...</option>
                    </select>
                  </div>

                  {/* Data Types */}
                  <div className="mb-8">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Data to Include</label>
                    <div className="space-y-2">
                      {[
                        { id: 'profile', label: 'Profile & Settings' },
                        { id: 'progress', label: 'Course Progress & Certificates' },
                        { id: 'flashcards', label: 'Flashcard Decks & Review History' },
                        { id: 'quizzes', label: 'Quiz & Exam Results' },
                        { id: 'forum', label: 'Forum Posts & Contributions' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/10 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={dataTypes[item.id as keyof typeof dataTypes]}
                            onChange={() => toggleDataType(item.id as keyof typeof dataTypes)}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900" 
                          />
                          <span className="text-sm font-medium text-slate-300">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button 
                    onClick={handleRequestExport}
                    disabled={exportMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {exportMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing Request...
                      </span>
                    ) : (
                      <>
                        <Database className="w-5 h-5" /> Request Data Export
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-4">
                    Exports may take a few minutes. We'll notify you when it's ready.
                  </p>
                </div>
              </div>

              {/* Right: Export History */}
              <div className="space-y-6">
                <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-full">
                  <h2 className="text-lg font-black font-headline text-white mb-6 flex items-center justify-between">
                    Export History
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px] uppercase">{exports.length} total</span>
                  </h2>
                  
                  {isLoadingExports ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                  ) : exports.length === 0 ? (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold text-sm">No exports yet</p>
                      <p className="text-slate-500 text-xs mt-1">Create your first export using the form</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exports.map((exp) => (
                        <div key={exp.id} className="p-4 rounded-2xl bg-black/20 border border-white/[0.03] flex items-center gap-4 group hover:bg-white/[0.02] transition-colors">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            exp.format === 'JSON' ? 'bg-teal-500/10 text-teal-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {exp.format === 'JSON' ? <FileJson className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate max-w-[200px]" title={exp.name}>{exp.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{exp.date}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span className="text-[10px] text-slate-500 font-bold">{exp.size}</span>
                            </div>
                          </div>

                          {exp.status === 'completed' ? (
                            <button
                              onClick={() => handleDownload(exp)}
                              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-teal-600 hover:text-white hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          ) : exp.status === 'failed' ? (
                            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3" /> Failed
                            </div>
                          ) : (
                            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Processing
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-400 mb-1">Data Privacy Guarantee</h4>
                      <p className="text-xs text-blue-300/70 leading-relaxed">
                        Your downloaded data is strictly for personal use. We never sell your learning data to third parties. For deletions, use the Privacy tab in Settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== LOGS TAB ==================== */}
          {activeTab === 'logs' && (
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative min-h-[60vh] animate-fade-in flex flex-col">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex gap-2">
                  <select 
                    value={logFilter}
                    onChange={(e) => { setLogFilter(e.target.value); setLogsPage(1); }}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-slate-300 text-sm font-bold focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none appearance-none"
                  >
                    <option value="all">All Events</option>
                    <option value="learning">Learning Progress</option>
                    <option value="practice">Practice & Reviews</option>
                    <option value="achievement">Achievements</option>
                    <option value="system">System & Account</option>
                  </select>
                  <button className="p-2 rounded-xl bg-black/20 border border-white/10 text-slate-400 hover:text-white transition-colors">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={logSearch}
                    onChange={(e) => { setLogSearch(e.target.value); setLogsPage(1); }}
                    placeholder="Search logs..." 
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Logs Table */}
              {isLoadingLogs ? (
                <div className="flex-1 flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
              ) : displayLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16">
                  <Clock className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400 font-bold text-sm">No logs found</p>
                  <p className="text-slate-500 text-xs mt-1">Your learning activity will appear here</p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto rounded-2xl border border-white/[0.05]">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-black/40 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <th className="p-4 rounded-tl-2xl">Time</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Details</th>
                        <th className="p-4 text-right rounded-tr-2xl">XP Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {displayLogs.map((log) => {
                        const Icon = log.icon;
                        return (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400 font-mono">{log.date.split(' ')[1] || ''}</span>
                                <span className="text-xs text-slate-600 font-bold">{log.date.split(' ')[0] || ''}</span>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${log.bg} flex items-center justify-center`}>
                                  <Icon className={`w-4 h-4 ${log.color}`} />
                                </div>
                                <span className={`text-sm font-bold ${log.color}`}>{log.action}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-slate-300 max-w-md truncate">{log.detail}</p>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              {log.xp > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                                  +{log.xp} XP
                                </span>
                              ) : (
                                <span className="text-slate-600 font-mono text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.05]">
                <p className="text-xs text-slate-500 font-bold">
                  {logsMeta.total > 0
                    ? `Showing ${(logsPage - 1) * logsLimit + 1}-${Math.min(logsPage * logsLimit, logsMeta.total)} of ${logsMeta.total} logs`
                    : 'No logs'}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={logsPage <= 1}
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={logsPage >= logsMeta.totalPages}
                    onClick={() => setLogsPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-accent-600 text-white text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:bg-accent-500 transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
