import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileUpload,
  ImportPreview,
} from '@/components/document';
import {
  confirmDocumentImport,
  previewDocumentImport,
} from '@/api/document.api';
import type {
  ImportPreview as ImportPreviewType,
  ImportOptions,
  ImportResult,
  SuggestedFlashcard,
} from '@/types/document.types';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Info,
  Zap,
  FileText,
  Brain,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import './Education.css';

export default function DocumentImportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [preview, setPreview] = useState<ImportPreviewType | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    maxCards: 50,
    difficulty: 'auto',
    includeExamples: true,
    includePronunciation: true,
  });

  const previewMutation = useMutation({
    mutationFn: ({ file, options }: { file: File; options: ImportOptions }) =>
      previewDocumentImport(file, options),
    onSuccess: (previewData) => {
      setPreview(previewData);
      setStep('preview');
      toast.success(`Đã tạo ${previewData.totalFlashcards} thẻ xem trước`);
    },
    onError: () => toast.error('Không thể xem trước tài liệu'),
  });

  const importMutation = useMutation({
    mutationFn: ({
      options,
      selectedCards,
    }: {
      options: ImportOptions;
      selectedCards: SuggestedFlashcard[];
    }) =>
      confirmDocumentImport({
        fileName: preview?.fileName || 'Imported Document',
        deckName: options.deckName || preview?.fileName?.replace(/\.[^.]+$/, '') || 'Imported Deck',
        deckColor: options.deckColor || '#8b5cf6',
        deckIsPublic: false,
        topic: preview?.parsedContent.metadata.tags?.[0],
        flashcards: selectedCards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          pronunciation: card.pronunciation,
          example: card.example,
          exampleTranslation: card.exampleTranslation,
          description: card.description,
          notes: card.notes,
          difficulty: card.difficulty,
        })),
      }),
    onSuccess: (result) => {
      setImportResult(result);
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['flashcardStats'] });
      queryClient.invalidateQueries({ queryKey: ['flashcardDecks'] });
      toast.success(`Đã import ${result.imported} thẻ thành công!`);
    },
    onError: () => toast.error('Không thể import flashcards'),
  });

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);

    try {
      await previewMutation.mutateAsync({ file, options: importOptions });
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = (options: ImportOptions, selectedCards: SuggestedFlashcard[]) => {
    if (!preview || selectedCards.length === 0) return;
    importMutation.mutate({ options: { ...importOptions, ...options }, selectedCards });
  };

  const handleCancel = () => {
    setStep('upload');
    setPreview(null);
    setImportResult(null);
  };

  const handleGoToDecks = () => {
    navigate('/flashcards');
  };

  const handleImportMore = () => {
    setStep('upload');
    setPreview(null);
    setImportResult(null);
  };

  // Step indicator data
  const steps = [
    { key: 'upload', label: 'Tải lên', icon: FileText },
    { key: 'preview', label: 'Xem trước', icon: Brain },
    { key: 'complete', label: 'Hoàn tất', icon: CheckCircle },
  ] as const;

  return (
    <div className="education-container education-path-page relative min-h-screen" style={{ color: 'var(--app-text)' }}>
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-accent-600/8 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/8 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[25%] h-[25%] rounded-full bg-fuchsia-600/5 blur-[100px]"></div>
      </div>

      <div className="dashboard-wrapper relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/flashcards')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-1 flex items-center gap-3">
                <Wand2 className="w-8 h-8 text-accent-400" />
                Import tài liệu AI
              </h1>
              <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
                Chuyển tài liệu thành flashcards bằng AI
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all text-sm tracking-wider uppercase"
          >
            <Settings className="w-4 h-4 text-accent-400" />
            Nâng cao
            {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </header>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            const isActive = step === s.key;
            const isPast =
              (step === 'preview' && s.key === 'upload') ||
              (step === 'complete' && (s.key === 'upload' || s.key === 'preview'));

            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={clsx(
                    'flex items-center gap-2.5 px-5 py-3 rounded-full border transition-all font-bold text-sm',
                    isActive
                      ? 'bg-accent-500/20 border-accent-500/40 text-accent-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                      : isPast
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-slate-600'
                  )}
                >
                  <StepIcon className="w-4 h-4" />
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={clsx(
                      'w-12 h-px',
                      isPast ? 'bg-emerald-500/40' : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl">
            <h3 className="text-lg font-black font-headline text-white mb-6 flex items-center gap-3">
              <Info className="w-5 h-5 text-accent-400" />
              Cài đặt import
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Số thẻ tối đa
                </label>
                <input
                  type="number"
                  value={importOptions.maxCards}
                  onChange={(e) =>
                    setImportOptions({ ...importOptions, maxCards: parseInt(e.target.value) || 50 })
                  }
                  min={1}
                  max={100}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-mono text-lg focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Độ khó
                </label>
                <select
                  value={importOptions.difficulty}
                  onChange={(e) =>
                    setImportOptions({
                      ...importOptions,
                      difficulty: e.target.value as ImportOptions['difficulty'],
                    })
                  }
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/5 text-white font-bold focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="auto" className="bg-slate-800">🤖  Tự nhận diện</option>
                  <option value="easy" className="bg-slate-800">🟢  Dễ</option>
                  <option value="medium" className="bg-slate-800">🟡  Trung bình</option>
                  <option value="hard" className="bg-slate-800">🔴  Khó</option>
                </select>
              </div>

              <div className="flex items-center gap-6 md:col-span-2">
                <label className="group flex items-center gap-3 cursor-pointer px-5 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex-1">
                  <input
                    type="checkbox"
                    checked={importOptions.includeExamples}
                    onChange={(e) =>
                      setImportOptions({ ...importOptions, includeExamples: e.target.checked })
                    }
                    className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">Kèm ví dụ</div>
                    <div className="text-xs text-slate-500">AI tạo ví dụ sử dụng</div>
                  </div>
                </label>

                <label className="group flex items-center gap-3 cursor-pointer px-5 py-3.5 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex-1">
                  <input
                    type="checkbox"
                    checked={importOptions.includePronunciation}
                    onChange={(e) =>
                      setImportOptions({ ...importOptions, includePronunciation: e.target.checked })
                    }
                    className="w-5 h-5 rounded-lg border-white/20 bg-black/40 text-accent-500 focus:ring-accent-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">Kèm phát âm</div>
                    <div className="text-xs text-slate-500">Tự tạo phiên âm</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-5">
              <InfoCard
                icon={FileText}
                title="Nhiều định dạng"
                description="Hỗ trợ PDF, DOC, DOCX, TXT, JSON, CSV, MD, HTML"
                color="violet"
                accent="from-accent-500 to-indigo-500"
              />
              <InfoCard
                icon={Brain}
                title="Phân tích bằng AI"
                description="Trích xuất nội dung và tạo flashcard thông minh"
                color="fuchsia"
                accent="from-fuchsia-500 to-pink-500"
              />
              <InfoCard
                icon={Zap}
                title="Xem trước & chỉnh"
                description="Duyệt, sửa và chọn thẻ trước khi import"
                color="emerald"
                accent="from-emerald-500 to-teal-500"
              />
            </div>

            {/* File Upload */}
            <FileUpload
              onFileSelect={handleFileSelect}
              maxSize={10 * 1024 * 1024} // 10MB
              maxFiles={1}
              multiple={false}
            />

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-slate-800/80 backdrop-blur-md border border-accent-500/30 rounded-3xl p-10 text-center shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-500/10 flex items-center justify-center border border-accent-500/20 relative">
                  <Loader2 className="w-10 h-10 text-accent-400 animate-spin" />
                  <div className="absolute inset-0 rounded-full border border-accent-400/30 animate-ping" />
                </div>
                <h3 className="text-2xl font-black font-headline text-white mb-2">AI đang xử lý...</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  AI đang phân tích tài liệu, trích xuất khái niệm chính và tạo flashcards. File lớn có thể mất thêm chút thời gian.
                </p>

                {/* Animated progress bar */}
                <div className="mt-8 max-w-sm mx-auto">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-accent-500 to-fuchsia-500 rounded-full animate-pulse w-2/3" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500 font-bold tracking-widest uppercase">
                    <span>Đọc file</span>
                    <span>Phân tích</span>
                    <span>Tạo thẻ</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && preview && (
          <ImportPreview
            preview={preview}
            onImport={handleImport}
            onCancel={handleCancel}
          />
        )}

        {/* Complete Step */}
        {step === 'complete' && importResult && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
              {/* Success Icon */}
              <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative">
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                <CheckCircle className="w-14 h-14 text-white" />
              </div>

              <h2 className="text-4xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2">
                Import hoàn tất!
              </h2>
              <p className="text-slate-400 text-lg mb-10">
                Flashcards của bạn đã được import thành công
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  <div className="text-4xl font-black font-mono text-emerald-400">{importResult.imported}</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">Đã import</div>
                </div>
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  <div className="text-4xl font-black font-mono text-amber-400">{importResult.skipped}</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">Bỏ qua</div>
                </div>
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  <div className="text-4xl font-black font-mono text-accent-400">{importResult.timeSpent}s</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">Thời gian</div>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-8 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-bold text-rose-400 tracking-wider uppercase">
                      {importResult.errors.length} lỗi
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {importResult.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-xs text-rose-300 font-mono">
                        Dòng {error.line}: {error.message}
                      </div>
                    ))}
                    {importResult.errors.length > 3 && (
                      <div className="text-xs text-rose-400 font-bold mt-2">
                        ...và {importResult.errors.length - 3} lỗi khác
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleGoToDecks}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-accent-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Xem bộ thẻ
                </button>
                <button
                  onClick={handleImportMore}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  Import thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function InfoCard({
  icon: Icon,
  title,
  description,
  color,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  accent: string;
}) {
  const colorConfigs: Record<string, { icon: string; glow: string }> = {
    violet: { icon: 'text-accent-400', glow: 'bg-accent-500/10 group-hover:bg-accent-500/20' },
    fuchsia: { icon: 'text-fuchsia-400', glow: 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20' },
    emerald: { icon: 'text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
  };
  const config = colorConfigs[color] || colorConfigs.violet;

  return (
    <div className="group bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-7 hover:-translate-y-1 hover:border-accent-500/30 transition-all duration-300 relative overflow-hidden shadow-xl">
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[50px] transition-colors duration-500 ${config.glow}`}></div>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-5 shadow-lg relative`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-black font-headline text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
