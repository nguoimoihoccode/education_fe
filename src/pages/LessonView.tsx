import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft, BookOpen, CheckCircle2, XCircle, Lightbulb, Clock, Zap, Award, Volume2, RotateCcw,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getLessonById,
    getVocabularyByLesson,
    getExercisesByLesson,
    completeLesson,
    submitExercises,
} from '@/api/education.api';
import { getPublishedLessonSlideDecks } from '@/api/slides.api';
import type { Vocabulary, Exercise, SubmitExercisesResult } from '@/types/education.types';
import { QUERY_KEYS } from '@/config/query';
import ReactMarkdown from 'react-markdown';
import './Education.css';

type TabId = 'content' | 'vocabulary' | 'exercises';
type KetQuaNopBai = SubmitExercisesResult;
type CauTraLoiMap = Record<string, string>;
type NopCauTraLoi = Array<{ exerciseId: string; answer: string }>;
type LessonTab = {
    id: TabId;
    icon: typeof BookOpen | typeof Lightbulb | typeof Zap;
    label: string;
};

const lessonTabs: LessonTab[] = [
    { id: 'content', icon: BookOpen, label: 'Nội dung bài học' },
    { id: 'vocabulary', icon: Lightbulb, label: 'Từ vựng' },
    { id: 'exercises', icon: Zap, label: 'Bài tập' },
];

export default function LessonView() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabId>('content');
    const [exerciseAnswers, setExerciseAnswers] = useState<CauTraLoiMap>({});
    const [exerciseResults, setExerciseResults] = useState<KetQuaNopBai | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const animatedBg = document.querySelector('.animated-bg') as HTMLElement;
        startTimeRef.current = Date.now();
        if (animatedBg) animatedBg.style.display = 'none';
        document.body.style.background = 'var(--app-bg)';
        return () => {
            if (animatedBg) animatedBg.style.display = '';
            document.body.style.background = '';
        };
    }, []);

    const { data: lesson, isLoading } = useQuery({ queryKey: ['lesson', id], queryFn: () => getLessonById(id!), enabled: !!id });
    const { data: vocabularies = [] } = useQuery({ queryKey: ['vocabulary', id], queryFn: () => getVocabularyByLesson(id!), enabled: !!id });
    const { data: exercises = [] } = useQuery({ queryKey: ['exercises', id], queryFn: () => getExercisesByLesson(id!), enabled: !!id });
    const { data: slideDecks = [] } = useQuery({ queryKey: ['lesson-slides', id], queryFn: () => getPublishedLessonSlideDecks(id!), enabled: !!id });

    const completeMutation = useMutation({
        mutationFn: () => {
            const startedAt = startTimeRef.current ?? Date.now();
            const timeSpent = Math.round((Date.now() - startedAt) / 1000);
            return completeLesson(id!, { timeSpent });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_PLAN });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_HUB });
            toast.success('Lesson completed! 🎉');
        },
    });

    const submitMutation = useMutation({
        mutationFn: () => {
            const answers: NopCauTraLoi = Object.entries(exerciseAnswers).map(([exerciseId, answer]) => ({ exerciseId, answer }));
            return submitExercises(id!, answers);
        },
        onSuccess: (result) => {
            setExerciseResults(result);
            if (result.score >= 70) completeMutation.mutate();
        },
    });

    if (isLoading) return <div className="education-container education-path-page flex items-center justify-center" style={{ color: 'var(--app-text)' }}><div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!lesson) return <div className="education-container education-path-page text-center pt-20" style={{ color: 'var(--app-text)' }}>Lesson not found</div>;

    return (
        <div className="education-container education-path-page lesson-page" style={{ color: 'var(--app-text)' }}>
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
            </div>

            <div className="lesson-wrapper fade-in-entry">
                <div className="flex items-center justify-between mb-8">
                    <Link to={`/education/courses/${lesson.courseId}`} className="btn-back group">
                        <div className="bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-colors mr-2"><ChevronLeft className="w-4 h-4" /></div>
                        Quay lại khóa học
                    </Link>
                    <div className="lesson-badge flex items-center gap-2">
                        <Clock className="w-3 h-3 text-pink-400" /> {lesson.estimatedMinutes} min
                    </div>
                </div>

                <div className="mb-10 text-center relative z-10">
                    <div className="lesson-badge inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-3 h-3 fill-current" />
                        {lesson.type.replace('_', ' ')}
                    </div>
                    <h1 className="lesson-title text-4xl md:text-5xl mb-4 leading-tight tracking-tight pb-2">
                        {lesson.title}
                    </h1>
                    <p className="lesson-muted text-lg max-w-2xl mx-auto leading-relaxed">{lesson.description}</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {slideDecks[0] && (
                            <Link to={`/education/slides/${slideDecks[0].id}/present`} className="lesson-primary-btn">
                                Xem Slides
                            </Link>
                        )}
                        <Link to={`/education/slides/create?lessonId=${lesson.id}`} className="lesson-secondary-btn">
                            Tạo Slides từ bài này
                        </Link>
                    </div>
                </div>

                {/* Glass Tabs */}
                <div className="flex justify-center mb-10 relative z-10">
                    <div className="lesson-tabs">
                        {lessonTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    aria-pressed={isActive}
                                    className={isActive ? 'lesson-tab lesson-tab-active' : 'lesson-tab'}
                                >
                                    <Icon className="w-4 h-4" /> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lesson-panel min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-accent-500/10 to-transparent pointer-events-none rounded-tr-3xl"></div>

                    {activeTab === 'content' && (
                        <div className="lesson-content fade-in-entry relative z-10">
                            <ReactMarkdown>{lesson.content || '> *No content available.*'}</ReactMarkdown>

                            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center">
                                <p className="lesson-muted mb-4 text-sm uppercase tracking-widest">Đã học xong?</p>
                                <button
                                    type="button"
                                    onClick={() => completeMutation.mutate()}
                                    disabled={completeMutation.isPending}
                                    className="lesson-primary-btn flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-6 h-6" /> {completeMutation.isPending ? 'Đang hoàn thành...' : 'Hoàn thành bài học'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vocabulary' && (
                        <div className="fade-in-entry relative z-10">
                            {vocabularies.length === 0 ? <p className="lesson-muted text-center py-20 italic">Chưa có từ vựng cho bài này.</p> :
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {vocabularies.map((vocab) => <TuVungCard key={vocab.id} vocab={vocab} />)}
                                </div>
                            }
                        </div>
                    )}

                    {activeTab === 'exercises' && (
                        <div className="fade-in-entry relative z-10">
                            <BaiTapList
                                exercises={exercises} answers={exerciseAnswers} setAnswers={setExerciseAnswers}
                                results={exerciseResults} onSubmit={() => submitMutation.mutate()}
                                submitting={submitMutation.isPending}
                                onRetry={() => { setExerciseResults(null); setExerciseAnswers({}); }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TuVungCard({ vocab }: { vocab: Vocabulary }) {
    const [flipped, setFlipped] = useState(false);
    const label = flipped
        ? `${vocab.meaning}. Lật thẻ từ vựng`
        : `${vocab.word}. Lật thẻ từ vựng`;

    return (
        <button
            type="button"
            className={`lesson-flashcard${flipped ? ' is-flipped' : ''}`}
            aria-pressed={flipped}
            aria-label={label}
            onClick={() => setFlipped(!flipped)}
        >
            <div className="lesson-flashcard-inner">
                <div className="lesson-flashcard-face">
                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent-400 to-fuchsia-400 mb-4">{vocab.word}</span>
                    {vocab.pronunciation && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-sm font-mono">
                            <Volume2 className="w-3 h-3" /> /{vocab.pronunciation}/
                        </div>
                    )}
                    <div className="absolute bottom-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nhấn để lật</div>
                </div>
                <div className="lesson-flashcard-back">
                    <h3 className="text-2xl font-bold text-white mb-4">{vocab.meaning}</h3>
                    {vocab.example && <p className="text-slate-300 italic text-lg leading-relaxed">"{vocab.example}"</p>}
                </div>
            </div>
        </button>
    );
}

function BaiTapList({
    exercises,
    answers,
    setAnswers,
    results,
    onSubmit,
    submitting,
    onRetry,
}: {
    exercises: Exercise[];
    answers: CauTraLoiMap;
    setAnswers: React.Dispatch<React.SetStateAction<CauTraLoiMap>>;
    results: KetQuaNopBai | null;
    onSubmit: () => void;
    submitting: boolean;
    onRetry: () => void;
}) {
    if (results) {
        const passed = results.score >= 70;
        return (
            <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 relative ${passed ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <div className={`absolute inset-0 rounded-full opacity-20 ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {passed ? <Award className="w-16 h-16 text-emerald-400" /> : <XCircle className="w-16 h-16 text-rose-400" />}
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">{passed ? 'Hoàn thành tốt!' : 'Cần luyện thêm'}</h2>
                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8 font-mono">{Math.round(results.score)}%</div>
                {!passed && (
                    <button type="button" onClick={onRetry} className="lesson-secondary-btn flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" /> Làm lại bài tập
                    </button>
                )}
            </div>
        );
    }

    if (exercises.length === 0) return <div className="lesson-muted text-center py-20 italic">Chưa có bài tập cho bài học này.</div>;

    return (
        <div className="space-y-10 max-w-3xl mx-auto">
            {exercises.map((ex, i: number) => (
                <div key={ex.id} className="lesson-exercise-card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">{i + 1}</div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ex.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-2xl font-medium text-white mb-8 leading-normal">{ex.question}</p>

                    {ex.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 gap-4">
                            {(ex.options || []).map((opt) => {
                                const selected = answers[ex.id] === opt;
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setAnswers({ ...answers, [ex.id]: opt })}
                                        className={selected ? 'lesson-option lesson-option-selected' : 'lesson-option'}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-amber-500 bg-amber-500' : 'border-slate-600'}`}>
                                            {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-lg font-medium">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {ex.type === 'fill_blank' && (
                        <input
                            type="text"
                            className="lesson-input"
                            placeholder="Nhập câu trả lời..."
                            value={answers[ex.id] || ''}
                            onChange={e => setAnswers({ ...answers, [ex.id]: e.target.value })}
                        />
                    )}
                </div>
            ))}

            <div className="flex justify-end pt-10 border-t border-white/10">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="lesson-primary-btn flex items-center gap-3"
                >
                    {submitting ? 'Đang nộp...' : <><CheckCircle2 className="w-6 h-6" /> Nộp câu trả lời</>}
                </button>
            </div>
        </div>
    );
}
