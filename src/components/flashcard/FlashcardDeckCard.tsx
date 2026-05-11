import React from 'react';
import { Clock, MoreVertical, Edit, Trash2, Play } from 'lucide-react';
import type { FlashcardDeck } from '@/types/flashcard.types';

interface FlashcardDeckCardProps {
  deck: FlashcardDeck;
  onEdit?: (deck: FlashcardDeck) => void;
  onDelete?: (deck: FlashcardDeck) => void;
  onStartReview?: (deck: FlashcardDeck) => void;
}

export function FlashcardDeckCard({
  deck,
  onEdit,
  onDelete,
  onStartReview,
}: FlashcardDeckCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(deck);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(deck);
  };

  const handleStartReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartReview?.(deck);
  };

  return (
    <div
      className="group relative bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/10"
      style={{
        boxShadow: `0 0 30px ${deck.color ? deck.color + '10' : 'rgba(139,92,246,0.1)'}`,
      }}
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: deck.color || '#8B5CF6' }}
      ></div>

      {/* Header */}
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {deck.icon && (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-white/10"
                style={{ backgroundColor: deck.color ? `${deck.color}20` : 'rgba(139,92,246,0.2)' }}
              >
                {deck.icon}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold font-headline text-white group-hover:text-accent-400 transition-colors">
                {deck.name}
              </h3>
              {deck.description && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{deck.description}</p>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-white/10 py-2 z-20">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Deck
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Deck
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-2xl font-black font-mono text-white">{deck.cardCount}</div>
            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Cards</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-xl font-black font-headline text-accent-400 mt-1">
              {deck.type === 'SYSTEM' ? 'Auto' : 'Manual'}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Type</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-2xl border border-white/5">
            <div className="text-xl font-black font-headline text-emerald-400 mt-1">
              {deck.isPublic ? 'Public' : 'Private'}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Visibility</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-black/20 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold tracking-wide">
            <Clock className="w-4 h-4" />
            <span>Updated {new Date(deck.updatedAt).toLocaleDateString()}</span>
          </div>

          <button
            onClick={handleStartReview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white font-bold hover:bg-accent-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Play className="w-4 h-4 fill-current" />
            Review
          </button>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
