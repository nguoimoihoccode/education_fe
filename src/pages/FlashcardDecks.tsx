import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  getFlashcardDecks,
  getFlashcardStats,
  createFlashcardDeck,
  deleteFlashcardDeck,
} from '@/api/flashcard.api';
import { FlashcardDeckCard, FlashcardStats } from '@/components/flashcard';
import { Pagination } from '@/components/ui';
import type { FlashcardDeck, CreateFlashcardDeckDto } from '@/types/flashcard.types';
import toast from 'react-hot-toast';
import './Education.css';

export default function FlashcardDecks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckIcon, setNewDeckIcon] = useState('📚');
  const [newDeckColor, setNewDeckColor] = useState('#4F46E5');
  const itemsPerPage = 9;

  // Query data
  const { data: decksData, isLoading: isLoadingDecks } = useQuery({
    queryKey: ['flashcardDecks', currentPage, itemsPerPage],
    queryFn: () => getFlashcardDecks({ page: currentPage, limit: itemsPerPage }),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: getFlashcardStats,
  });

  const decks = decksData?.items || [];
  const totalDecks = decksData?.total || 0;
  const totalPages = decksData?.totalPages || 1;

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutations
  const createDeckMutation = useMutation({
    mutationFn: (dto: CreateFlashcardDeckDto) => createFlashcardDeck(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
      toast.success('Deck created successfully!');
      setShowCreateModal(false);
      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckIcon('📚');
      setNewDeckColor('#4F46E5');
    },
    onError: () => toast.error('Failed to create deck.'),
  });

  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: string) => deleteFlashcardDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
      queryClient.invalidateQueries({ queryKey: ['flashcardStats'] });
      toast.success('Deck deleted successfully!');
    },
    onError: () => toast.error('Failed to delete deck.'),
  });

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    createDeckMutation.mutate({
      name: newDeckName,
      description: newDeckDescription,
      icon: newDeckIcon,
      color: newDeckColor,
      isPublic: false,
    });
  };

  const handleDeleteDeck = (deck: FlashcardDeck) => {
    if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
      deleteDeckMutation.mutate(deck.id);
    }
  };

  const handleStartReview = (deck: FlashcardDeck) => {
    navigate(`/flashcards/review?deckId=${deck.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="education-container relative min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
      </div>

      <div className="dashboard-wrapper relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Flashcard Decks</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Master your vocabulary with spaced repetition
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-600 to-indigo-600 text-white font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Create Deck
          </button>
        </header>

        {/* Stats Overview */}
        {!isLoadingStats && stats && (
          <div className="mb-10">
            <FlashcardStats stats={stats} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Link
            to="/flashcards/review"
            className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 group hover:-translate-y-1 transition-all border border-white/10 hover:border-accent-500/30 cursor-pointer shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Daily Review</h3>
                <p className="text-sm text-slate-400">
                  {stats?.dueFlashcards || 0} cards due today
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium group-hover:text-indigo-300">
              Start Review <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/flashcards/document-import"
            className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 group hover:-translate-y-1 transition-all border border-white/10 hover:border-emerald-500/30 cursor-pointer shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Import Documents</h3>
                <p className="text-sm text-slate-400">PDF, DOC, TXT, JSON, CSV</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-400 text-sm font-medium group-hover:text-green-300">
              Import <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/flashcards/stats"
            className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 group hover:-translate-y-1 transition-all border border-white/10 hover:border-fuchsia-500/30 cursor-pointer shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">View Stats</h3>
                <p className="text-sm text-slate-400">Track your progress</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300">
              View Details <ArrowRight className="w-4 h-4 ml-1" />
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
                placeholder="Search decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm w-full"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Decks Grid */}
        {isLoadingDecks ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map((deck) => (
                <FlashcardDeckCard
                  key={deck.id}
                  deck={deck}
                  onDelete={handleDeleteDeck}
                  onStartReview={handleStartReview}
                />
              ))}
            </div>

            {filteredDecks.length === 0 && !isLoadingDecks && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No decks found.</p>
                <p className="text-slate-600 text-xs mt-1">Create your first deck to get started!</p>
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

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-black font-headline text-white mb-6">Create New Deck</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Deck Name *
                </label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g., Japanese Basics"
                  className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/5 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all text-white placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/5 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all resize-none text-white placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={newDeckIcon}
                    onChange={(e) => setNewDeckIcon(e.target.value)}
                    placeholder="📚"
                    className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/5 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all text-center text-2xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Color Focus
                  </label>
                  <input
                    type="color"
                    value={newDeckColor}
                    onChange={(e) => setNewDeckColor(e.target.value)}
                    className="w-full h-[58px] p-1 rounded-xl bg-black/40 border border-white/5 focus:border-accent-500 outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeck}
                disabled={createDeckMutation.isPending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-indigo-600 text-white font-bold hover:from-accent-500 hover:to-indigo-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
