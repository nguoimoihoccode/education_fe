import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  TrendingUp,
  Image as ImageIcon,
  Smile,
  MoreHorizontal,
  Trophy,
  Flame,
  BookOpen,
  Star,
  Calendar,
  ThumbsUp,
  Globe,
  Award,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import {
  getSocialFeed,
  createPost,
  likePost,
  bookmarkPost,
  getTrendingTopics,
} from '@/api/social.api';
import type { SocialPost as ApiSocialPost } from '@/api/social.api';
import toast from 'react-hot-toast';
import { useThrottle } from '@/hooks/useRateLimit';
import './Education.css';

/* ============ Types ============ */
interface SocialPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    level: number;
    badge: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags: string[];
  type: 'achievement' | 'question' | 'share' | 'milestone';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

const FEED_FILTERS = [
  { id: 'all', label: 'Tất cả', icon: Globe },
  { id: 'achievement', label: 'Thành tích', icon: Award },
  { id: 'question', label: 'Hỏi đáp', icon: HelpCircle },
  { id: 'share', label: 'Tài nguyên', icon: BookOpen },
  { id: 'milestone', label: 'Cột mốc', icon: Flame },
];

// Map API response to local post format
function mapApiPost(p: ApiSocialPost): SocialPost {
  return {
    id: p.id,
    author: {
      name: p.author.name,
      avatar: p.author.avatar,
      level: p.author.level,
      badge: p.author.badge,
    },
    content: p.content,
    image: p.image,
    likes: p.likes,
    comments: p.comments.map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      createdAt: c.createdAt,
      likes: c.likes,
    })),
    shares: p.shares,
    isLiked: p.isLiked,
    isBookmarked: p.isBookmarked,
    createdAt: p.createdAt,
    tags: p.tags,
    type: p.type,
  };
}

export default function Social() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [feedFilter, setFeedFilter] = useState('all');
  const [newPostText, setNewPostText] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [localPosts, setLocalPosts] = useState<SocialPost[]>([]);

  // Fetch posts from API
  const { data: feedData } = useQuery({
    queryKey: ['socialFeed', feedFilter],
    queryFn: () => getSocialFeed({
      type: feedFilter === 'all' ? undefined : feedFilter,
      limit: 20,
    }),
    staleTime: 1000 * 60 * 1,
  });

  // Fetch trending topics from API
  const { data: trendingTopics } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: getTrendingTopics,
    staleTime: 1000 * 60 * 5,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      toast.success('Đã đăng bài!');
    },
    onError: () => {
      toast.error('Không thể đăng bài');
    },
  });

  const posts = localPosts.length > 0 ? localPosts : feedData?.data.map(mapApiPost) ?? [];
  const filteredPosts = feedFilter === 'all'
    ? posts
    : posts.filter((p) => p.type === feedFilter);

  const trendingData = trendingTopics && trendingTopics.length > 0
    ? trendingTopics
    : [
        { tag: '#EnglishGrammar', posts: '2.4K posts' },
        { tag: '#StudyStreak', posts: '1.8K posts' },
        { tag: '#SpanishBasics', posts: '1.2K posts' },
        { tag: '#TOEICPrep', posts: '980 posts' },
        { tag: '#VocabChallenge', posts: '756 posts' },
      ];

  const handleLikeRaw = useCallback(async (postId: string) => {
    // Optimistic update
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    // Fire API call (best-effort)
    likePost(postId).catch(() => {});
  }, []);
  const handleLike = useThrottle(handleLikeRaw, 500);

  const handleBookmarkRaw = useCallback(async (postId: string) => {
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
    bookmarkPost(postId).catch(() => {});
  }, []);
  const handleBookmark = useThrottle(handleBookmarkRaw, 500);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    // Try API first
    createPostMutation.mutate(
      { content: newPostText, type: 'share' },
      {
        onSettled: () => {
          // Also add locally for instant UI feedback
          const newPost: SocialPost = {
            id: Math.random().toString(36).substr(2, 9),
            author: { name: user?.displayName || 'You', level: 15, badge: 'streak' },
            content: newPostText,
            likes: 0,
            comments: [],
            shares: 0,
            isLiked: false,
            isBookmarked: false,
            createdAt: 'Just now',
            tags: [],
            type: 'share',
          };
          setLocalPosts((prev) => [newPost, ...prev]);
          setNewPostText('');
          setShowCreatePost(false);
        },
      }
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'question': return <MessageCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'share': return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'milestone': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      default: return null;
    }
  };

  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="dashboard-wrapper">
        {/* ============ Header ============ */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Mạng xã hội
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
            Kết nối, chia sẻ và học cùng nhau
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ============ Main Feed ============ */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create Post */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  {!showCreatePost ? (
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="w-full text-left px-5 py-3.5 rounded-2xl bg-black/30 border border-white/5 text-slate-500 text-sm hover:bg-black/40 hover:border-white/10 transition-all"
                    >
                      Chia sẻ gì đó với cộng đồng...
                    </button>
                  ) : (
                    <div>
                      <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Bạn đang nghĩ gì? Chia sẻ tip, hỏi đáp, hoặc ăn mừng thành tích..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/5 text-white text-sm placeholder-slate-500 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toast('Đính kèm ảnh sẽ sớm có mặt', { icon: '🖼️' })}
                            className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-accent-400 transition-all"
                            title="Sắp có"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast('Emoji picker sẽ sớm có mặt', { icon: '😊' })}
                            className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-all"
                            title="Sắp có"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowCreatePost(false)}
                            className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 text-sm font-bold hover:bg-white/10 transition-all"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleCreatePost}
                            disabled={!newPostText.trim() || createPostMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Đăng
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feed Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {FEED_FILTERS.map((f) => {
                const FilterIcon = f.icon;
                return (
                <button
                  key={f.id}
                  onClick={() => setFeedFilter(f.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    feedFilter === f.id
                      ? 'bg-accent-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <FilterIcon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              );
              })}
            </div>

            {/* Posts */}
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-white/15 transition-all"
              >
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                        post.author.level >= 20 ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : post.author.level >= 15 ? 'bg-gradient-to-br from-accent-500 to-fuchsia-600'
                        : 'bg-gradient-to-br from-slate-500 to-slate-600'
                      }`}>
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{post.author.name}</p>
                          {post.author.badge ? <Flame className="h-3.5 w-3.5 text-orange-400" aria-label={post.author.badge} /> : null}
                          {getTypeIcon(post.type)}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {post.createdAt} • Level {post.author.level}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('Tuỳ chọn bài viết sẽ sớm có mặt', { icon: '⋯' })}
                      className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                      title="Sắp có"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-white/5 text-slate-400 border border-white/5 hover:text-accent-400 hover:border-accent-500/20 cursor-pointer transition-all">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          post.isLiked
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.length}
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Chia sẻ bài viết sẽ sớm có mặt', { icon: '🔗' })}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        title="Sắp có"
                      >
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </button>
                    </div>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2.5 rounded-xl transition-all ${
                        post.isBookmarked
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-500 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Comments */}
                  {expandedComments.has(post.id) && post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 pl-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {comment.author.charAt(0)}
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-black/20 border border-white/[0.03]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-white">{comment.author}</span>
                              <span className="text-[10px] text-slate-600">{comment.createdAt}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{comment.content}</p>
                            <button
                              type="button"
                              onClick={() => toast('Thích bình luận sẽ sớm có mặt', { icon: '👍' })}
                              className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
                              title="Sắp có"
                            >
                              <ThumbsUp className="w-3 h-3" /> {comment.likes}
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Comment Input */}
                      <div className="flex gap-3 pl-2 mt-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Viết bình luận... (sắp có)"
                            disabled
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black/30 border border-white/5 text-white text-xs placeholder-slate-500 focus:border-accent-500 outline-none transition-all disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => toast('Gửi bình luận sẽ sớm có mặt', { icon: '💬' })}
                            className="px-3 py-2.5 rounded-xl bg-accent-600 text-white hover:bg-accent-700 transition-all"
                            title="Sắp có"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* ============ Right Sidebar ============ */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Trending Topics */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Chủ đề nổi bật
              </h3>
              <div className="space-y-3">
                {trendingData.map((topic) => (
                  <button
                    key={topic.tag}
                    type="button"
                    onClick={() => toast(`Lọc theo ${topic.tag} sẽ sớm có mặt`, { icon: '🏷️' })}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                    title="Sắp có"
                  >
                    <div>
                      <p className="text-sm font-bold text-accent-400 group-hover:text-accent-300 transition-colors">{topic.tag}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{topic.posts}</p>
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Học viên hàng đầu
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Minh Tuấn', badge: 'trophy', level: 24, streak: 45 },
                  { name: 'Thu Hà', badge: 'star', level: 22, streak: 38 },
                  { name: 'Đức Anh', badge: 'star', level: 21, streak: 33 },
                  { name: 'Lan Phương', badge: 'star', level: 19, streak: 28 },
                ].map((person) => (
                  <div key={person.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {person.name} {person.badge === 'trophy' ? <Trophy className="h-3.5 w-3.5 text-amber-400" /> : <Star className="h-3.5 w-3.5 text-amber-400" />}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold inline-flex items-center gap-1.5">LVL {person.level} • {person.streak}d <Flame className="h-3 w-3 text-orange-400" /></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('Theo dõi người dùng sẽ sớm có mặt', { icon: '👤' })}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20 hover:bg-accent-500/20 transition-all"
                      title="Sắp có"
                    >
                      Theo dõi
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black font-headline text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-400" />
                Thống kê cộng đồng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                  <div className="text-xl font-black font-mono text-emerald-400">12.5K</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Thành viên</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                  <div className="text-xl font-black font-mono text-accent-400">3.2K</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Bài hôm nay</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                  <div className="text-xl font-black font-mono text-amber-400">856</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Đang online</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                  <div className="text-xl font-black font-mono text-fuchsia-400">18.9K</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Tài nguyên</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
