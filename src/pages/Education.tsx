import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BookOpen,
    Globe,
    Clock,
    Search,
    Flame,
    Trophy,
    Play,
    Zap,
    ArrowUpRight,
    TrendingUp,
    Target
} from 'lucide-react';
import { getLanguages, getCourses, getUserProgress } from '@/api/education.api';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/ui';
import clsx from 'clsx';
import './Education.css'; // Import Custom CSS

// --- Animated Wrapper ---
function FadeIn({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={clsx("transition-all duration-1000", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12", className)}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// --- Main Page ---
export default function Education() {
    const { isAuthenticated } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Query Data
    const { data: languages = [] } = useQuery({ queryKey: ['languages'], queryFn: getLanguages });
    const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['courses', selectedLanguage, currentPage, itemsPerPage],
        queryFn: () => getCourses({
            languageId: selectedLanguage || undefined,
            page: currentPage,
            limit: itemsPerPage
        })
    });
    const { data: userProgress } = useQuery({
        queryKey: ['userProgress'],
        queryFn: getUserProgress,
        enabled: isAuthenticated
    });

    const courses = coursesData?.items || [];
    const totalCourses = coursesData?.total || 0;
    const totalPages = coursesData?.totalPages || 1;

    const filteredCourses = courses.filter((course: any) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset to page 1 when language changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedLanguage]);

    // Removed body background force to avoid clashing with global Layout
    // useEffect(() => {
    //     document.body.style.background = '#020202';
    //     return () => { document.body.style.background = ''; };
    // }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="education-container relative min-h-screen">
            {/* Background Ambient Glows */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] glow-violet pointer-events-none z-0"></div>
            <div className="fixed bottom-0 left-[300px] w-[500px] h-[500px] glow-emerald pointer-events-none z-0"></div>

            {/* Main Content */}
            <div className="dashboard-wrapper relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <FadeIn>
                        <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 tracking-tight">Education Hub</h1>
                        <p className="text-slate-400 text-sm md:text-base font-medium">Expand your horizons with AI-driven courses.</p>
                    </FadeIn>

                    {/* Search */}
                    <FadeIn delay={100} className="w-full md:w-auto">
                        <div className="search-pill-wrapper">
                            <div className="search-pill-glow"></div>
                            <div className="search-input-container">
                                <Search className="w-5 h-5 text-slate-500 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search for courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm w-full"
                                />
                            </div>
                        </div>
                    </FadeIn>
                </header>

                {/* Hero Section */}
                <section className="relative mb-8 rounded-2xl overflow-hidden glass-pane p-8 md:p-12 min-h-[400px] flex items-center shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020405] via-transparent to-transparent z-10"></div>
                    <div className="relative z-20 w-full max-w-2xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-accent-500/20 text-accent-300 text-xs font-bold tracking-widest uppercase mb-6 border border-accent-500/30">AI-Powered Learning</span>
                        <h2 className="text-4xl md:text-6xl font-black font-headline text-white leading-[1.1] tracking-tighter mb-6">
                            Master Languages <br/>with <span className="bg-gradient-to-r from-accent-500 to-emerald-400 bg-clip-text text-transparent">AI Tutor</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-md font-medium">
                            Experience the future of education with personalized paths and real-time conversational feedback.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-accent-600 text-white rounded-full font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all">
                                Start Learning
                            </button>
                            <button className="px-8 py-4 glass-pane text-white rounded-full font-bold hover:bg-white/10 transition-all">
                                View Curriculum
                            </button>
                        </div>
                    </div>
                    {/* Hero Graphic Placeholder */}
                    <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center p-8 hidden md:flex">
                        <div className="relative w-full h-full">
                            <img alt="Premium 3D Graphic" className="w-full h-full object-contain mix-blend-lighten" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDkklOtaSgT1s5FbXGKNIBdehwvUJThfXZD42iQTwBQ1vinGPnSPbYWxSrvw8QozrUOc1ZtRvopG6OEfFXL_JlYnUo9LRm1vc3voKKhA9SqDCfhkFREiXssod0QPn8bBOoDkQWMMGbsTJB4gtqbfZwFcArUB5M58cxUcd0nuswFHGn4i7Oqb0MdDT-SZDPDHLmhYgSe87nseToLLqsyru7kN1SKuuueQt-ky8jNmkL2oc4TWOOgXHZ1YCnzoC7C942tBRYcq0KqHE"/>
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#020405]"></div>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Metric: Day Streak */}
                    <div className="glass-pane p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <Flame className="w-48 h-48 text-orange-500" />
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white">{userProgress?.streak?.currentStreak || 0}</p>
                                <p className="text-slate-400 font-medium">Day Streak</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                                    <TrendingUp className="w-4 h-4" /> Top 5% of Students
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metric: Flashcards */}
                    <div className="glass-pane p-8 rounded-2xl md:col-span-1 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                            <BookOpen className="w-48 h-48 text-accent-500" />
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6 text-accent-500" />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white">1,284</p>
                                <p className="text-slate-400 font-medium">Cards Mastered</p>
                            </div>
                            <div className="mt-4 w-full">
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-accent-500 h-full w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metric: Quiz Score */}
                    <div className="glass-pane p-8 rounded-2xl md:col-span-2 flex items-center justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-slate-400 font-medium mb-1">Average Quiz Score</p>
                            <p className="text-5xl font-black text-white">88%</p>
                        </div>
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-white/5" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                                <circle className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="43.7" strokeWidth="8"></circle>
                            </svg>
                            <span className="absolute text-xl font-bold text-white">+12%</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                    </div>
                </section>

                {/* Continue Learning Section */}
                <section className="mt-16 space-y-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <FadeIn>
                            <h3 className="text-3xl font-black font-headline text-white tracking-tight mb-2">Continue Learning</h3>
                            <p className="text-slate-400 font-medium">Pick up exactly where you left off</p>
                        </FadeIn>
                        
                        {/* Category Tabs */}
                        <FadeIn delay={300}>
                            <div className="category-scroll pb-4">
                            <button
                                onClick={() => setSelectedLanguage(null)}
                                className={clsx("chip", selectedLanguage === null && "active")}
                            >
                                All Courses
                            </button>
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setSelectedLanguage(lang.id)}
                                    className={clsx("chip", selectedLanguage === lang.id && "active")}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </FadeIn>
                    </div>

                    {/* Course Grid */}
                    {isLoadingCourses ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide no-scrollbar snap-x snap-mandatory">
                                {filteredCourses.map((course, idx) => (
                                    <FadeIn key={course.id} delay={idx * 50 + 400} className="h-full min-w-[340px] flex-shrink-0 snap-start">
                                        <Link to={`/education/courses/${course.id}`} className="block h-full">
                                            <div className="glass-pane rounded-2xl p-6 h-full flex flex-col group hover:-translate-y-2 transition-all duration-300">
                                                <div className="relative rounded-xl overflow-hidden h-40 mb-6 bg-zinc-900 border border-white/5">
                                                    {/* Gradient Cover */}
                                                    <div className={clsx("absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity bg-gradient-to-br",
                                                        idx % 3 === 0 ? "from-accent-600 to-indigo-600" :
                                                            idx % 3 === 1 ? "from-emerald-600 to-teal-600" :
                                                                "from-rose-600 to-orange-600"
                                                    )}></div>

                                                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-125">
                                                        <span className="text-6xl drop-shadow-2xl">{course.language.flag}</span>
                                                    </div>

                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-12 h-12 rounded-full bg-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-500/40">
                                                            <Play className="w-5 h-5 ml-1 fill-current" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={clsx("text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded",
                                                        idx % 3 === 0 ? "text-accent-400 bg-accent-500/10" :
                                                            idx % 3 === 1 ? "text-emerald-400 bg-emerald-500/10" :
                                                                "text-orange-400 bg-orange-500/10"
                                                    )}>
                                                        {course.level}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{course.totalLessons} Lessons</span>
                                                </div>
                                                
                                                <h4 className="text-xl font-bold mb-4 text-white line-clamp-2">{course.title}</h4>
                                                
                                                <div className="flex items-center gap-3 mt-auto pt-2">
                                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="bg-emerald-500 h-full relative" style={{ width: `${Math.random() * 80 + 10}%` }}>
                                                            <div className="absolute inset-0 glow-emerald opacity-50"></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-white">Continue</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                ))}
                            </div>

                            {filteredCourses.length === 0 && !isLoadingCourses && (
                                <div className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                        <BookOpen className="w-7 h-7 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">No courses available.</p>
                                    <p className="text-slate-600 text-xs mt-1">Check back later for new content.</p>
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
                </section>
            </div>

            {/* AI Assistant Floating Widget */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="flex items-center gap-4 bg-accent-600 text-white px-6 py-4 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform group">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        <img alt="AI Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqYmP8iFrXktp_ybNLJOpXH8E_jht1lgWDnM7X-onIHe_-If7G5s82pfz7OeH6KooxMUZ5sGLPCRkxtxD8xSjA7FX8AJr8vQJGcbKo2nAm_0eO9ZfY4SCHW0jAtHnCPAcqTo7H3ugDB1z49gziD2hXh4T8ssa85_1ZntAquxYyh3g9zJEiOMyDCiq3Xcpm62IazU-j0b3lUFWmSEuuXCpqPX3UOq68qSYkDW3v7uq8z9vX8Mpi67WR3q-L3T6MNRJ2Ucaw3bdk-x8" />
                    </div>
                    <span className="font-bold tracking-tight">Ask AI Tutor</span>
                    <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform fill-current" />
                </button>
            </div>
        </div>
    );
}
