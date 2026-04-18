import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  TrendingUp,
  Target,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  getQuizzes,
  getQuizStats,
  createQuiz,
  deleteQuiz,
  updateQuiz,
} from '@/api/quiz.api';
import { QuizCard, QuizStats } from '@/components/quiz';
import { Pagination } from '@/components/ui';
import type { Quiz, UpdateQuizDto } from '@/types/quiz.types';
import {
  buildCreateQuizDto,
  buildUpdateQuizDto,
  createDefaultQuizFormState,
  createQuizFormStateFromQuiz,
  extractAvailableTopics,
  getQuizCreateErrorMessage,
  getQuizDeleteErrorMessage,
  getQuizUpdateErrorMessage,
  type QuizListFormState,
} from './quizListView';
import toast from 'react-hot-toast';
import '../Education.css';

const ITEMS_PER_PAGE = 9;

export default function QuizListPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [form, setForm] = useState<QuizListFormState>(createDefaultQuizFormState());

  // Fetch quizzes
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['quizzes', currentPage, ITEMS_PER_PAGE, topicFilter],
    queryFn: () => getQuizzes({ page: currentPage, limit: ITEMS_PER_PAGE, topic: topicFilter || undefined }),
  });

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['quizStats'],
    queryFn: getQuizStats,
  });

  const quizzes = quizzesData?.items || [];
  const totalPages = quizzesData?.totalPages || 1;
  const availableTopics = extractAvailableTopics(quizzes);

  const filteredQuizzes = quizzes.filter((quiz: Quiz) => {
    const matchesSearch = quiz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesTopic = !topicFilter || quiz.topic === topicFilter;
    return matchesSearch && matchesTopic;
  });

  const isEditMode = Boolean(editingQuiz);

  const resetQuizForm = () => {
    setForm(createDefaultQuizFormState());
    setEditingQuiz(null);
  };

  const closeQuizModal = () => {
    setShowCreateModal(false);
    resetQuizForm();
  };

  const openCreateModal = () => {
    resetQuizForm();
    setShowCreateModal(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setForm(createQuizFormStateFromQuiz(quiz));
    setShowCreateModal(true);
  };

  // Mutations
  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizStats'] });
      toast.success('Quiz created successfully!');
      closeQuizModal();
    },
    onError: (error) => {
      toast.error(getQuizCreateErrorMessage(error));
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, dto }: { quizId: string; dto: UpdateQuizDto }) => updateQuiz(quizId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizStats'] });
      toast.success('Quiz updated successfully!');
      closeQuizModal();
    },
    onError: (error) => {
      toast.error(getQuizUpdateErrorMessage(error));
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizStats'] });
      toast.success('Quiz deleted successfully!');
    },
    onError: (error) => {
      toast.error(getQuizDeleteErrorMessage(error));
    },
  });

  const handleSubmitQuizForm = () => {
    if (!form.name.trim()) {
      toast.error('Please enter a quiz name');
      return;
    }

    if (editingQuiz) {
      updateQuizMutation.mutate({
        quizId: editingQuiz.id,
        dto: buildUpdateQuizDto(form),
      });
      return;
    }

    createQuizMutation.mutate(buildCreateQuizDto(form));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="education-container">

      <div className="dashboard-wrapper">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-accent-400" />
              Quiz Center
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
              Test your knowledge with interactive quizzes
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-accent-900/30"
          >
            <Plus className="w-5 h-5" />
            Create Quiz
          </button>
        </header>

        {/* Stats Overview */}
        {!isLoadingStats && stats && (
          <div className="mb-10">
            <QuizStats stats={stats} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Link
            to="/quiz/history"
            className="glass-card p-6 group hover:-translate-y-1 transition-all border-white/10 hover:border-accent-500/30 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Quiz History</h3>
                <p className="text-sm text-slate-400">Review past attempts</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-accent-400 text-sm font-medium group-hover:text-accent-300">
              View History <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/quiz/stats"
            className="glass-card p-6 group hover:-translate-y-1 transition-all border-white/10 hover:border-emerald-500/30 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Detailed Stats</h3>
                <p className="text-sm text-slate-400">Track your progress</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium group-hover:text-emerald-300">
              View Details <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/quiz"
            className="glass-card p-6 group hover:-translate-y-1 transition-all border-white/10 hover:border-amber-500/30 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Play className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">All Quizzes</h3>
                <p className="text-sm text-slate-400">Browse available quizzes</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-amber-400 text-sm font-medium group-hover:text-amber-300">
              Browse <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="search-pill-wrapper flex-1">
            <div className="search-pill-glow"></div>
            <div className="search-input-container">
              <Search className="w-5 h-5 text-slate-500 mr-3" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm w-full"
              />
            </div>
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500"
          >
            <option value="">All Topics</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Quizzes Grid */}
        {isLoadingQuizzes ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz: Quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStartQuiz={() => {}}
                  onEdit={(quiz) => {
                    openEditModal(quiz);
                  }}
                  onDelete={(quiz: Quiz) => {
                    if (window.confirm(`Delete quiz "${quiz.name}"?`)) {
                      deleteQuizMutation.mutate(quiz.id);
                    }
                  }}
                />
              ))}
            </div>

            {filteredQuizzes.length === 0 && !isLoadingQuizzes && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No quizzes found.</p>
                <p className="text-slate-600 text-xs mt-1">
                  {searchQuery || topicFilter
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first quiz to get started!'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 max-w-2xl w-full my-8 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black font-headline text-white flex items-center gap-3">
                  <Plus className="w-6 h-6 text-accent-400" />
                  {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isEditMode ? 'Update quiz settings' : 'Configure your quiz settings'}
                </p>
              </div>
              <button
                onClick={closeQuizModal}
                className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Quiz Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                    placeholder="e.g., JavaScript Basics"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm((current) => ({ ...current, topic: e.target.value }))}
                    placeholder="e.g., JavaScript"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Brief description of this quiz..."
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((current) => ({ ...current, difficulty: e.target.value as QuizListFormState['difficulty'] }))}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="EASY" className="bg-slate-800">🟢  Easy</option>
                    <option value="MEDIUM" className="bg-slate-800">🟡  Medium</option>
                    <option value="HARD" className="bg-slate-800">🔴  Hard</option>
                    <option value="MIXED" className="bg-slate-800">🔀  Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Question Type
                  </label>
                  <select
                    value={form.questionType}
                    onChange={(e) => setForm((current) => ({ ...current, questionType: e.target.value as QuizListFormState['questionType'] }))}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="MIXED" className="bg-slate-800">Mixed</option>
                    <option value="MULTIPLE_CHOICE" className="bg-slate-800">Multiple Choice</option>
                    <option value="TRUE_FALSE" className="bg-slate-800">True/False</option>
                    <option value="FILL_BLANK" className="bg-slate-800">Fill Blank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.questionCount}
                    onChange={(e) => setForm((current) => ({ ...current, questionCount: parseInt(e.target.value, 10) || 10 }))}
                    disabled={isEditMode}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-mono focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Time (min)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.timeLimitMinutes}
                    onChange={(e) => setForm((current) => ({ ...current, timeLimitMinutes: parseFloat(e.target.value) || 10 }))}
                    disabled={isEditMode}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-mono focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.passingScore}
                    onChange={(e) => setForm((current) => ({ ...current, passingScore: parseInt(e.target.value, 10) || 70 }))}
                    disabled={isEditMode}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-mono focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={form.maxRetries}
                    onChange={(e) => setForm((current) => ({ ...current, maxRetries: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-mono focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 pt-5 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                    <input
                      type="checkbox"
                      checked={form.shuffleQuestions}
                      onChange={(e) => setForm((current) => ({ ...current, shuffleQuestions: e.target.checked }))}
                      className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Shuffle Questions</div>
                      <div className="text-xs text-slate-500">Randomize order</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                    <input
                      type="checkbox"
                      checked={form.shuffleAnswers}
                      onChange={(e) => setForm((current) => ({ ...current, shuffleAnswers: e.target.checked }))}
                      className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Shuffle Answers</div>
                      <div className="text-xs text-slate-500">Randomize options</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                    <input
                      type="checkbox"
                      checked={form.showCorrectAnswer}
                      onChange={(e) => setForm((current) => ({ ...current, showCorrectAnswer: e.target.checked }))}
                      className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Show Correct</div>
                      <div className="text-xs text-slate-500">After submission</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                    <input
                      type="checkbox"
                      checked={form.allowRetry}
                      onChange={(e) => setForm((current) => ({ ...current, allowRetry: e.target.checked }))}
                      className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Allow Retry</div>
                      <div className="text-xs text-slate-500">Multiple attempts</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
              <button
                onClick={closeQuizModal}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuizForm}
                disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
                className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createQuizMutation.isPending
                  ? 'Creating...'
                  : updateQuizMutation.isPending
                    ? 'Saving...'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
