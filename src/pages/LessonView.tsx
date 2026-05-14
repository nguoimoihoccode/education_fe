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
        document.body.style.background = '#020617';
        return () => {
            if (animatedBg) animatedBg.style.display = '';
            document.body.style.background = '';
        };
    }, []);

    const { data: lesson, isLoading } = useQuery({ queryKey: ['lesson', id], queryFn: () => getLessonById(id!), enabled: !!id });
    const { data: vocabularies = [] } = useQuery({ queryKey: ['vocabulary', id], queryFn: () => getVocabularyByLesson(id!), enabled: !!id });
    const { data: exercises = [] } = useQuery({ queryKey: ['exercises', id], queryFn: () => getExercisesByLesson(id!), enabled: !!id });

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

    if (isLoading) return <div className="education-container flex items-center justify-center"><div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!lesson) return <div className="education-container text-center pt-20">Lesson not found</div>;

    return (
        <div className="education-container">
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
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400 flex items-center gap-2 backdrop-blur-md">
                        <Clock className="w-3 h-3 text-pink-400" /> {lesson.estimatedMinutes} min
                    </div>
                </div>

                <div className="mb-10 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Sparkles className="w-3 h-3 fill-current" />
                        {lesson.type.replace('_', ' ')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 pb-2">
                        {lesson.title}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{lesson.description}</p>
                </div>

                {/* Glass Tabs */}
                <div className="flex justify-center mb-10 relative z-10">
                    <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl inline-flex gap-2">
                        {lessonTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`
                                     flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300
                                     ${activeTab === tab.id ? 'bg-gradient-to-r from-accent-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                 `}>
                                    <Icon className="w-4 h-4" /> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-8 md:p-12 min-h-[500px] relative overflow-hidden rounded-3xl shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-accent-500/10 to-transparent pointer-events-none rounded-tr-3xl"></div>

                    {activeTab === 'content' && (
                        <div className="lesson-content fade-in-entry relative z-10">
                            <ReactMarkdown>{lesson.content || '> *No content available.*'}</ReactMarkdown>

                            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center">
                                <p className="text-slate-400 mb-4 text-sm uppercase tracking-widest">Đã học xong?</p>
                                <button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending} className="px-10 py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                    <CheckCircle2 className="w-6 h-6" /> {completeMutation.isPending ? 'Đang hoàn thành...' : 'Hoàn thành bài học'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vocabulary' && (
                        <div className="fade-in-entry relative z-10">
                            {vocabularies.length === 0 ? <p className="text-slate-500 text-center py-20 italic">Chưa có từ vựng cho bài này.</p> :
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
    return (
        <div className={`relative h-64 perspective-1000 cursor-pointer group`} onClick={() => setFlipped(!flipped)}>
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl group-hover:border-accent-500/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all">
                    <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent-400 to-fuchsia-400 mb-4">{vocab.word}</span>
                    {vocab.pronunciation && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-sm font-mono"><Volume2 className="w-3 h-3" /> /{vocab.pronunciation}/</div>}
                    <div className="absolute bottom-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest animate-pulse">Click to flip</div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-accent-900/80 to-indigo-900/80 border border-accent-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl">
                    <h3 className="text-2xl font-bold text-white mb-4">{vocab.meaning}</h3>
                    {vocab.example && <p className="text-slate-300 italic text-lg leading-relaxed">"{vocab.example}"</p>}
                </div>
            </div>
        </div>
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
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {passed ? <Award className="w-16 h-16 text-emerald-400" /> : <XCircle className="w-16 h-16 text-rose-400" />}
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">{passed ? 'Hoàn thành tốt!' : 'Cần luyện thêm'}</h2>
                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-8 font-mono">{Math.round(results.score)}%</div>
                {!passed && (
                    <button onClick={onRetry} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 transition-all">
                        <RotateCcw className="w-5 h-5" /> Làm lại bài tập
                    </button>
                )}
            </div>
        );
    }

    if (exercises.length === 0) return <div className="text-center text-slate-500 py-20 italic">Chưa có bài tập cho bài học này.</div>;

    return (
        <div className="space-y-10 max-w-3xl mx-auto">
                {exercises.map((ex, i: number) => (
                <div key={ex.id} className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-accent-500/30 transition-all shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">{i + 1}</div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{ex.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-2xl font-medium text-white mb-8 leading-normal">{ex.question}</p>

                    {ex.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 gap-4">
                            {(ex.options || []).map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => setAnswers({ ...answers, [ex.id]: opt })}
                                    className={`
                                        group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-4
                                        ${answers[ex.id] === opt
                                            ? 'bg-amber-500/10 border-amber-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                            : 'bg-black/20 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'}
                                    `}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[ex.id] === opt ? 'border-amber-500 bg-amber-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                        {answers[ex.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-lg font-medium">{opt}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {ex.type === 'fill_blank' && (
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-mono focus:border-accent-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.2)] outline-none transition-all placeholder:text-slate-700"
                            placeholder="Nhập câu trả lời..."
                            value={answers[ex.id] || ''}
                            onChange={e => setAnswers({ ...answers, [ex.id]: e.target.value })}
                        />
                    )}
                </div>
            ))}

            <div className="flex justify-end pt-10 border-t border-white/10">
                <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="px-12 py-5 rounded-2xl bg-white text-black text-lg font-bold shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                    {submitting ? 'Đang nộp...' : <><CheckCircle2 className="w-6 h-6" /> Nộp câu trả lời</>}
                </button>
            </div>
        </div>
    );
}
