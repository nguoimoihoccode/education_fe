import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BookOpen,
    ChevronLeft,
    Play,
    Lock,
    Users,
    Sparkles,
    Star,
    Award,
    type LucideIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourseById, enrollCourse, getMyCourses, getLessonsByCourse } from '@/api/education.api';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui';
import type { CourseLevel, LessonType } from '@/types/education.types';
import './Education.css';

const levelLabels: Record<CourseLevel, string> = {
    beginner: 'Beginner',
    elementary: 'Elementary',
    intermediate: 'Intermediate',
    upper_intermediate: 'Upper Int.',
    advanced: 'Advanced',
};

const typeConfig: Record<LessonType, { icon: LucideIcon; label: string; color: string }> = {
    vocabulary: { icon: BookOpen, label: 'Vocabulary', color: 'text-blue-400' },
    grammar: { icon: Star, label: 'Grammar', color: 'text-purple-400' },
    reading: { icon: BookOpen, label: 'Reading', color: 'text-emerald-400' },
    listening: { icon: Play, label: 'Listening', color: 'text-amber-400' },
    speaking: { icon: Users, label: 'Speaking', color: 'text-rose-400' },
    practice: { icon: Sparkles, label: 'Practice', color: 'text-cyan-400' },
    quiz: { icon: Award, label: 'Quiz', color: 'text-yellow-400' },
};

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const lessonsPerPage = 10;

    useEffect(() => {
        const animatedBg = document.querySelector('.animated-bg') as HTMLElement;
        if (animatedBg) animatedBg.style.display = 'none';
        document.body.style.background = '#020617';
        return () => {
            if (animatedBg) animatedBg.style.display = '';
            document.body.style.background = '';
        };
    }, []);

    const { data: course, isLoading: isLoadingCourse } = useQuery({
        queryKey: ['course', id],
        queryFn: () => getCourseById(id!),
        enabled: !!id
    });

    const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['lessons', id, currentPage, lessonsPerPage],
        queryFn: () => getLessonsByCourse(id!, { page: currentPage, limit: lessonsPerPage }),
        enabled: !!id
    });

    const { data: myCourses = [] } = useQuery({
        queryKey: ['myCourses'],
        queryFn: getMyCourses,
        enabled: isAuthenticated
    });

    const isEnrolled = myCourses.some((uc) => uc.courseId === id);
    const userCourse = myCourses.find((uc) => uc.courseId === id);

    const enrollMutation = useMutation({
        mutationFn: () => enrollCourse(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myCourses'] });
            toast.success('Successfully enrolled!');
        },
        onError: () => toast.error('Failed to enroll.'),
    });

    const handleEnroll = () => {
        if (!isAuthenticated) return navigate('/login');
        enrollMutation.mutate();
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoadingCourse) return <div className="education-container flex items-center justify-center"><div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!course) return <div className="education-container flex items-center justify-center">Course not found</div>;

    const lessons = lessonsData?.items || [];
    const totalLessons = lessonsData?.total || 0;
    const totalPages = lessonsData?.totalPages || 1;

    return (
        <div className="education-container">
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
            </div>

            <div className="detail-wrapper fade-in-entry">
                <Link to="/education" className="btn-back mb-8 group pl-2">
                    <div className="bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-colors mr-2"><ChevronLeft className="w-4 h-4" /></div>
                    Quay lại khóa học
                </Link>

                {/* Hero Section */}
                <section className="relative w-full h-[450px] flex items-end overflow-hidden mb-12 rounded-3xl mt-[-20px]">
                    <div className="absolute inset-0 z-0">
                        {/* Background Image & Effects */}
                        <img alt="Course background" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_50%)] z-10"></div>
                    </div>

                    <div className="relative z-20 w-full px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                    {levelLabels[course.level as CourseLevel]}
                                </span>
                                <span className="text-slate-400 text-xs font-bold font-mono">• {course.estimatedHours} Hours Total Content</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
                                {course.title.split(':').length > 1 ? (
                                    <>
                                        {course.title.split(':')[0]}: <br /><span className="text-accent-400 bg-none drop-shadow-none">{course.title.split(':')[1]}</span>
                                    </>
                                ) : (
                                    course.title
                                )}
                            </h1>
                            <div className="flex flex-wrap gap-4 mt-8">
                                <button className="px-8 py-4 bg-gradient-to-r from-accent-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all">
                                    <Play className="w-5 h-5 fill-current" />
                                    Tiếp tục học
                                </button>
                                <button className="px-8 py-4 bg-slate-800/80 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold flex items-center gap-3 hover:bg-white/10 transition-all">
                                    <BookOpen className="w-5 h-5" />
                                    Thông tin khóa học
                                </button>
                            </div>
                        </div>

                        {/* Progress / Enrollment Card */}
                        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 p-8 rounded-xl relative group overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-headline font-bold text-lg text-white">Tổng tiến độ</h3>
                                <span className="text-emerald-400 font-bold text-xl">{Math.round(userCourse?.progress || 0)}%</span>
                            </div>
                            
                            <div className="h-3 w-full bg-white/5 rounded-full mb-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: `${userCourse?.progress || 0}%` }}>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Đã học</p>
                                    <p className="text-xl font-black text-white">{userCourse?.completedLessons || 0}/{totalLessons} <span className="text-xs text-slate-400 font-medium">bài học</span></p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Thời gian học</p>
                                    <p className="text-xl font-black text-white">{Math.round((userCourse?.totalTimeSpent || 0) / 60)} <span className="text-xs text-slate-400 font-medium">phút</span></p>
                                </div>
                            </div>
                            
                            {!isEnrolled && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <button onClick={handleEnroll} disabled={enrollMutation.isPending} className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-xl hover:bg-emerald-400/20 transition-colors w-full text-center">
                                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Syllabus Content */}
                <section className="mt-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div>
                            <h2 className="text-3xl font-black font-headline mb-3 text-white">Giáo trình khóa học</h2>
                            <p className="text-slate-400 max-w-xl leading-relaxed">Master the nuances of the language through structured lessons and comprehensive exercises.</p>
                        </div>
                    </div>

                    {isLoadingLessons ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div className="relative">
                                {/* Section Header */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="flex-none w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-md border border-accent-500/20 flex items-center justify-center font-headline font-black text-xl text-accent-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]">01</div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                    <h3 className="text-2xl font-bold font-headline text-white pr-8">Core Lessons</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {lessons.map((lesson, idx) => {
                                        const config = typeConfig[lesson.type as LessonType] || typeConfig.vocabulary;
                                        const Icon = config.icon;
                                        const locked = !isEnrolled;
                                        
                                        // Status logic mimicking Stitch design
                                        const statusClass = locked ? "opacity-50 hover:opacity-75" : "hover:bg-white/5";
                                        let outerClass = locked ? "bg-slate-800/60" : "bg-slate-800/80 hover:bg-slate-800";
                                        if (!locked && idx === 0) {
                                            outerClass = "bg-accent-900/20 border-accent-500/30 hover:bg-accent-900/30";
                                        }

                                        return (
                                            <div key={lesson.id} className={`group border border-white/5 backdrop-blur-md p-6 rounded-2xl flex items-center justify-between transition-all duration-300 ${outerClass} ${statusClass}`}>
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${locked ? 'bg-white/5 text-slate-500' : 'bg-white/10 ' + config.color}`}>
                                                        {locked ? <Lock className="w-5 h-5" /> : <Icon className="w-6 h-6" />}
                                                    </div>
                                                        <div>
                                                            <h4 className="font-bold text-white mb-1 group-hover:text-accent-300 transition-colors">{lesson.title}</h4>
                                                            <p className={`text-xs font-bold tracking-wide ${!locked && idx === 0 ? 'text-accent-400' : 'text-slate-400'}`}>
                                                                {!locked && idx === 0 ? 'Hoạt động hiện tại' : config.label.toUpperCase()} • {lesson.estimatedMinutes}m
                                                            </p>
                                                        </div>
                                                    </div>
                                                <Link to={locked ? '#' : `/education/lessons/${lesson.id}`} className="shrink-0 flex items-center justify-center">
                                                    {locked ? (
                                                        <span className="text-slate-600"><Lock className="w-5 h-5" /></span>
                                                    ) : idx === 0 ? (
                                                        <span className="w-10 h-10 rounded-full bg-accent-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110 transition-transform">
                                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 group-hover:text-accent-400 transition-colors">
                                                            <Play className="w-8 h-8" />
                                                        </span>
                                                    )}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center w-full">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
