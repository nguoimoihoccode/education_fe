import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Clock, Users, Star, TrendingUp, Award, Play, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { getCourses } from '@/api/education.api';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui';
import './Education.css';

export default function CourseHomepage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const animatedBg = document.querySelector('.animated-bg') as HTMLElement;
    if (animatedBg) animatedBg.style.display = 'none';
    document.body.style.background = '#020617';
    return () => {
      if (animatedBg) animatedBg.style.display = '';
      document.body.style.background = '';
    };
  }, []);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', currentPage, itemsPerPage],
    queryFn: () => getCourses({
      page: currentPage,
      limit: itemsPerPage
    }),
  });

  const courses = coursesData?.items || [];
  const totalCourses = coursesData?.total || 0;
  const totalPages = coursesData?.totalPages || 1;

  const categories = [
    { id: 'all', name: 'All Courses', color: 'bg-accent-500/10 text-accent-400' },
    { id: 'investing', name: 'Investing', color: 'bg-emerald-500/10 text-emerald-400' },
    { id: 'trading', name: 'Trading', color: 'bg-amber-500/10 text-amber-400' },
    { id: 'crypto', name: 'Crypto', color: 'bg-cyan-500/10 text-cyan-400' },
    { id: 'analysis', name: 'Analysis', color: 'bg-pink-500/10 text-pink-400' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const featuredCourses = courses.filter(c => c.featured).slice(0, 3);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="education-container">
      

      <div className="dashboard-wrapper">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span className="text-sm text-slate-300">AI-Powered Learning Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              Master the
              <span className="text-gradient mx-2 bg-gradient-to-r from-accent-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Markets
              </span>
              <br />Like a Pro
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Transform your trading journey with expert-led courses, interactive lessons, and real-world strategies.
              From basics to advanced techniques, we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/education" className="px-8 py-4 rounded-full bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-accent-900/30">
                <Play className="w-5 h-5" />
                Start Learning
              </Link>
              <button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all">
                Browse Courses
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: BookOpen, value: totalCourses, label: 'Courses', color: 'text-accent-400' },
            { icon: Users, value: '10K+', label: 'Students', color: 'text-emerald-400' },
            { icon: Award, value: '50+', label: 'Certificates', color: 'text-amber-400' },
            { icon: Star, value: '4.8', label: 'Avg Rating', color: 'text-pink-400' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-6 text-center group hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-500/20 to-fuchsia-500/20 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-accent-400" />
                Featured Courses
              </h2>
              <Link to="/education" className="text-accent-400 hover:text-accent-300 font-bold flex items-center gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Link to={`/education/courses/${course.id}`} key={course.id} className="glass-card p-6 group hover:-translate-y-2 transition-all border-white/10 hover:border-accent-500/30">
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img src={course.thumbnail || '/api/placeholder/400/250'} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="chip bg-accent-500/20 text-accent-300 text-xs">Featured</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.totalLessons}</span>
                    </div>
                    <span className="text-white font-bold">{course.free ? 'Free' : `$${course.price}`}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section id="courses" className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="search-pill-wrapper flex-1">
              <div className="search-input-container">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-white placeholder-slate-400 outline-none flex-1"
                />
              </div>
              <div className="search-pill-glow"></div>
            </div>
            <div className="tab-container">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link to={`/education/courses/${course.id}`} key={course.id} className="glass-card p-6 group hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl">
                      {course.language.flag}
                    </div>
                    <div className="flex gap-2">
                      {course.free && <span className="chip bg-emerald-500/20 text-emerald-400 text-xs">FREE</span>}
                      {course.featured && <span className="chip bg-amber-500/20 text-amber-400 text-xs">FEATURED</span>}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent-400 transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.estimatedHours}h</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.totalLessons}</span>
                    </div>
                    <span className="text-white font-bold">{course.free ? 'Free' : `$${course.price}`}</span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredCourses.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No courses found matching your criteria.</p>
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
    </div>
  );
}
