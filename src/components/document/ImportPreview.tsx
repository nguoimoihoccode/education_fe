import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  Brain,
  Zap,
} from 'lucide-react';
import type {
  ImportPreview,
  SuggestedFlashcard,
  ImportOptions,
} from '@/types/document.types';
import clsx from 'clsx';

interface ImportPreviewProps {
  preview: ImportPreview;
  onImport: (options: ImportOptions) => void;
  onCancel: () => void;
  onEditFlashcard?: (flashcard: SuggestedFlashcard) => void;
  onDeleteFlashcard?: (flashcardId: string) => void;
}

export function ImportPreview({
  preview,
  onImport,
  onCancel,
  onEditFlashcard,
  onDeleteFlashcard,
}: ImportPreviewProps)
{
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [editedCards] = useState<Map<string, SuggestedFlashcard>>(new Map());
  const [showAllCards, setShowAllCards] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 10;

  const totalPages = Math.ceil(preview.suggestedFlashcards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const visibleCards = preview.suggestedFlashcards.slice(startIndex, endIndex);

  const handleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCards.size === visibleCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(visibleCards.map((c) => c.id)));
    }
  };

  const handleEditCard = (card: SuggestedFlashcard) => {
    onEditFlashcard?.(card);
  };

  const handleDeleteCard = (cardId: string) => {
    onDeleteFlashcard?.(cardId);
    setSelectedCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  };

  const handleImport = () => {
    const cardsToImport = selectedCards.size > 0
      ? preview.suggestedFlashcards.filter((c) => selectedCards.has(c.id))
      : preview.suggestedFlashcards;

    onImport({
      maxCards: cardsToImport.length,
      difficulty: 'auto',
      includeExamples: true,
      includePronunciation: true,
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    if (confidence >= 0.6) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    if (difficulty === 3) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-1 flex items-center gap-3">
            <Brain className="w-7 h-7 text-accent-400" />
            AI Preview
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Review and select flashcards before importing — <span className="text-accent-400 font-bold">{preview.fileName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm tracking-wider uppercase"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={selectedCards.size === 0 && preview.suggestedFlashcards.length > 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm tracking-wider uppercase"
          >
            <Sparkles className="w-4 h-4" />
            Import {selectedCards.size > 0 ? `(${selectedCards.size})` : 'All'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          value={preview.totalFlashcards}
          label="Total Cards"
          color="violet"
        />
        <StatCard
          icon={Target}
          value={selectedCards.size || preview.totalFlashcards}
          label="Selected"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          value={preview.estimatedTime}
          label="Est. Minutes"
          color="amber"
        />
        <StatCard
          icon={Zap}
          value={Math.round(
            preview.suggestedFlashcards.reduce((sum, c) => sum + c.confidence, 0) /
              preview.suggestedFlashcards.length * 100
          )}
          label="Avg Confidence"
          color="fuchsia"
        />
      </div>

      {/* Flashcards List */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCards.size === visibleCards.length}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
              />
              <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors tracking-wider uppercase">Select All</span>
            </label>

            <div className="h-5 w-px bg-white/10" />

            <button
              onClick={() => setShowAllCards(!showAllCards)}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-accent-400 transition-colors tracking-wider uppercase"
            >
              {showAllCards ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllCards ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
            <span className="tracking-wider">
              {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="divide-y divide-white/5">
          {visibleCards.map((card) => {
            const isSelected = selectedCards.has(card.id);
            const editedCard = editedCards.get(card.id) || card;
            const confidenceColors = getConfidenceColor(editedCard.confidence);

            return (
              <div
                key={card.id}
                className={clsx(
                  'p-5 transition-all group/card',
                  isSelected
                    ? 'bg-accent-500/5'
                    : 'hover:bg-white/[0.02]'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectCard(card.id)}
                    className="mt-1.5 w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500 cursor-pointer"
                  />

                  {/* Card Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Front */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Front
                          </span>
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-widest border',
                              confidenceColors.bg,
                              confidenceColors.text,
                              confidenceColors.border,
                            )}
                          >
                            {Math.round(editedCard.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-white font-bold text-base leading-relaxed">{editedCard.front}</p>
                      </div>

                      {/* Separator */}
                      <div className="hidden md:block w-px h-12 bg-white/5 self-center" />

                      {/* Back */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            Back
                          </span>
                          <div
                            className={clsx(
                              'w-2.5 h-2.5 rounded-full',
                              getDifficultyColor(editedCard.difficulty)
                            )}
                          />
                        </div>
                        <p className="text-slate-300 font-medium text-base leading-relaxed">{editedCard.back}</p>
                      </div>
                    </div>

                    {/* Details */}
                    {showAllCards && (
                      <div className="mt-5 pt-5 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {editedCard.pronunciation && (
                            <div className="flex items-start gap-2 text-sm bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                              <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest shrink-0 mt-0.5">Pronun.</span>
                              <span className="text-slate-300 font-mono text-sm">{editedCard.pronunciation}</span>
                            </div>
                          )}
                          {editedCard.example && (
                            <div className="flex items-start gap-2 text-sm bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest shrink-0 mt-0.5">Example</span>
                              <span className="text-slate-300 italic">{editedCard.example}</span>
                            </div>
                          )}
                          {editedCard.sourceSection && (
                            <div className="flex items-start gap-2 text-sm bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest shrink-0 mt-0.5">Source</span>
                              <span className="text-slate-300">{editedCard.sourceSection}</span>
                            </div>
                          )}
                          {editedCard.notes && (
                            <div className="flex items-start gap-2 text-sm bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest shrink-0 mt-0.5">Notes</span>
                              <span className="text-slate-300">{editedCard.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="p-2.5 rounded-xl hover:bg-accent-500/10 text-slate-500 hover:text-accent-400 transition-all border border-transparent hover:border-accent-500/20"
                      aria-label="Edit card"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                      aria-label="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {visibleCards.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
              <BookOpen className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-500 font-bold">No flashcards to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: number | string;
  label: string;
  color: 'violet' | 'emerald' | 'amber' | 'fuchsia';
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
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[40px] transition-colors duration-500 ${config.glow}`}></div>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.icon} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-3xl font-black font-mono ${config.text}`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}
