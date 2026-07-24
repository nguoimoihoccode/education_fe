import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Brain,
  Lightbulb,
  Trash2,
  Plus,
  MessageSquare,
  Wand2,
  GraduationCap,
  Languages,
  PenTool,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  RotateCcw,
  Loader2,
  Key,
  Globe,
  Cpu,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
} from '@/api/ai.api';
import { useAiProviderStore } from '@/store/aiProvider.store';
import type { AiMessage, AiConversationSummary, SendMessageResponse } from '@/types/ai.types';
import './Education.css';
import { AiSettingsDrawer } from '@/components/ai';
import { directSendMessage } from '@/api/aiDirect.api';
import type { DirectChatMessage } from '@/api/aiDirect.api';

/* ============ Types ============ */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const SUGGESTED_PROMPTS = [
  { icon: Languages, label: 'Explain grammar', prompt: 'Explain the difference between present perfect and past simple with examples.' },
  { icon: BookOpen, label: 'Vocabulary help', prompt: 'Teach me 10 advanced English vocabulary words related to business with examples.' },
  { icon: PenTool, label: 'Writing review', prompt: 'Review this sentence for grammar and style: ' },
  { icon: Brain, label: 'Quiz me', prompt: 'Give me a 5-question quiz about English irregular verbs.' },
  { icon: GraduationCap, label: 'Learning plan', prompt: 'Create a 30-day study plan for learning Spanish from beginner level.' },
  { icon: Lightbulb, label: 'Study tips', prompt: 'What are the most effective techniques for memorizing vocabulary?' },
];

const mapApiMessage = (msg: AiMessage): ChatMessage => ({
  id: msg.id,
  role: msg.role,
  content: msg.content,
  timestamp: new Date(msg.createdAt),
});

const mapSummaryToConversation = (
  summary: AiConversationSummary,
  messages: ChatMessage[] = [],
): Conversation => ({
  id: summary.id,
  title: summary.title,
  messages,
  createdAt: new Date(summary.createdAt),
  updatedAt: new Date(summary.updatedAt),
});

const renderSafeMessageContent = (content: string) => {
  const segments = content.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return (
        <strong key={index} className="text-white font-bold">
          {segment.slice(2, -2)}
        </strong>
      );
    }

    if (segment.startsWith('*') && segment.endsWith('*')) {
      return (
        <em key={index} className="text-accent-300">
          {segment.slice(1, -1)}
        </em>
      );
    }

    if (segment.startsWith('`') && segment.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded text-accent-300 text-xs font-mono" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {segment.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{segment}</span>;
  });
};

export default function AiTutor() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loadedConvIds = useRef<Set<string>>(new Set());
  const skipNextDetailLoad = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isConfigured: hasLocalKey, settings: localSettings } = useAiProviderStore();

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = useMemo(() => activeConv?.messages || [], [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Initial load: list conversations, create if empty, select first + load messages
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let list = await listConversations();
        if (cancelled) return;

        if (list.length === 0) {
          const created = await createConversation();
          if (cancelled) return;
          list = [created];
        }

        const mapped = list.map((s) => mapSummaryToConversation(s));
        setConversations(mapped);

        const firstId = list[0].id;
        skipNextDetailLoad.current = true;
        setActiveConvId(firstId);

        setIsLoadingMessages(true);
        try {
          const detail = await getConversation(firstId);
          if (cancelled) return;
          const msgs = detail.messages.map(mapApiMessage);
          loadedConvIds.current.add(firstId);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === firstId
                ? {
                    ...c,
                    title: detail.title,
                    messages: msgs,
                    updatedAt: new Date(detail.updatedAt),
                  }
                : c,
            ),
          );
        } catch {
          if (!cancelled) {
            setLoadError('Failed to load conversation messages.');
          }
        } finally {
          if (!cancelled) setIsLoadingMessages(false);
        }
      } catch {
        if (!cancelled) {
          setConversations([]);
          setActiveConvId(null);
          setLoadError('Failed to load conversations. Please try again.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load full messages when selecting a conversation (skip if already loaded or just created)
  useEffect(() => {
    if (!activeConvId || isLoading) return;
    if (skipNextDetailLoad.current) {
      skipNextDetailLoad.current = false;
      return;
    }
    if (loadedConvIds.current.has(activeConvId)) return;

    let cancelled = false;

    const loadDetail = async () => {
      setIsLoadingMessages(true);
      setLoadError(null);
      try {
        const detail = await getConversation(activeConvId);
        if (cancelled) return;
        const msgs = detail.messages.map(mapApiMessage);
        loadedConvIds.current.add(activeConvId);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  title: detail.title,
                  messages: msgs,
                  updatedAt: new Date(detail.updatedAt),
                }
              : c,
          ),
        );
      } catch {
        if (!cancelled) {
          setLoadError('Failed to load conversation messages.');
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [activeConvId, isLoading]);

  const handleSelectConv = useCallback((id: string) => {
    if (id === activeConvId) return;
    setActiveConvId(id);
  }, [activeConvId]);

  const mockSendMessage = async (
    conversationId: string,
    message: string,
  ): Promise<SendMessageResponse> => {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
    const now = new Date().toISOString();
    return {
      userMessage: {
        id: `mock-user-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: now,
      },
      assistantMessage: {
        id: `mock-asst-${Date.now()}`,
        role: 'assistant',
        content:
          'This is a mock AI reply (VITE_AI_MOCK=1). Connect a real provider for live answers.',
        createdAt: now,
      },
      conversation: {
        id: conversationId,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        updatedAt: now,
      },
    };
  };

  const directSend = async (
    conversationId: string,
    message: string,
  ): Promise<SendMessageResponse> => {
    const now = new Date().toISOString();
    const systemPrompt =
      'You are a helpful AI language tutor. Answer clearly and concisely.';

    const history: DirectChatMessage[] = messages
      .slice(-20)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    history.unshift({ role: 'system', content: systemPrompt });
    history.push({ role: 'user', content: message });

    const result = await directSendMessage(history, localSettings);

    return {
      userMessage: {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: now,
      },
      assistantMessage: {
        id: `local-asst-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        createdAt: new Date().toISOString(),
      },
      conversation: {
        id: conversationId,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        updatedAt: now,
      },
    };
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping || !activeConvId) return;

    setInput('');
    setIsTyping(true);

    try {
      const reply =
        import.meta.env.VITE_AI_MOCK === '1'
          ? await mockSendMessage(activeConvId, trimmed)
          : hasLocalKey
            ? await directSend(activeConvId, trimmed)
            : await sendMessage(activeConvId, trimmed);

      const userMsg = mapApiMessage(reply.userMessage);
      const assistantMsg = mapApiMessage(reply.assistantMessage);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: [...c.messages, userMsg, assistantMsg],
                title: reply.conversation.title || c.title,
                updatedAt: new Date(reply.conversation.updatedAt),
              }
            : c,
        ),
      );
      loadedConvIds.current.add(activeConvId);
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `user-${Date.now()}`,
                    role: 'user',
                    content: trimmed,
                    timestamp: new Date(),
                  },
                  errorMessage,
                ],
              }
            : c,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const created = await createConversation();
      const conv = mapSummaryToConversation(created, []);
      loadedConvIds.current.add(created.id);
      skipNextDetailLoad.current = true;
      setConversations((prev) => [conv, ...prev]);
      setActiveConvId(created.id);
      setLoadError(null);
    } catch {
      setLoadError('Failed to create a new conversation.');
    }
  };

  const handleDeleteConv = async (id: string) => {
    try {
      await deleteConversation(id);
      loadedConvIds.current.delete(id);

      const remaining = conversations.filter((c) => c.id !== id);

      if (remaining.length === 0) {
        const created = await createConversation();
        const conv = mapSummaryToConversation(created, []);
        loadedConvIds.current.add(created.id);
        skipNextDetailLoad.current = true;
        setConversations([conv]);
        setActiveConvId(created.id);
        return;
      }

      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining[0].id);
      }
    } catch {
      setLoadError('Failed to delete conversation.');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="education-container education-path-page" style={{ paddingBottom: 0, color: 'var(--app-text)' }}>
      <div className="flex h-[calc(100vh-64px)]">
        {/* ============ Sidebar ============ */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } flex-shrink-0 backdrop-blur-xl border-r flex flex-col transition-all duration-300 overflow-hidden`}
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8" style={{ color: 'var(--app-text-subtle)' }}>
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all text-sm ${
                    activeConvId === conv.id
                      ? 'bg-accent-600/15 text-white border border-accent-500/20'
                      : 'border border-transparent hover:bg-[var(--app-surface-hover)]'
                  }`}
                  style={activeConvId !== conv.id ? { color: 'var(--app-text-muted)' } : undefined}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate font-medium">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConv(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-[var(--app-surface-hover)]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--app-border)' }}>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--app-text-subtle)' }}>
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span className="font-bold tracking-wider uppercase">AI Tutor v2.0</span>
            </div>
          </div>
        </aside>

        {/* ============ Chat Area ============ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <header className="flex items-center gap-4 px-6 py-4 border-b backdrop-blur-md flex-shrink-0" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-[var(--app-surface-hover)] transition-all"
              style={{ color: 'var(--app-text-muted)' }}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black font-headline text-white">AI Tutor</h2>
                <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online — Ready to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 rounded-xl hover:bg-[var(--app-surface-hover)] transition-all"
              style={{ color: 'var(--app-text-muted)' }}
              title="AI Provider Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => activeConvId && handleDeleteConv(activeConvId)}
              disabled={!activeConvId || isLoading}
              className="p-2.5 rounded-xl hover:bg-[var(--app-surface-hover)] transition-all disabled:opacity-30"
              style={{ color: 'var(--app-text-subtle)' }}
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </header>

          {loadError && (
            <div
              role="alert"
              className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-200 text-sm text-center font-medium"
            >
              {loadError}
              <span className="block text-xs text-rose-300/80 mt-1 font-normal">
                Check your connection or AI provider settings, then retry.
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {isLoading || isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--app-text-muted)' }}>
                <Loader2 className="w-8 h-8 animate-spin text-accent-400" aria-hidden />
                <span className="text-sm font-medium">
                  {isLoading ? 'Loading conversations…' : 'Loading messages…'}
                </span>
              </div>
            ) : messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-600/20 to-fuchsia-600/20 flex items-center justify-center border border-accent-500/20">
                    <Wand2 className="w-12 h-12 text-accent-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3 text-center">
                  Hi {user?.displayName?.split(' ')[0] || 'there'}! I'm your AI Tutor
                </h2>
                <p className="text-center max-w-lg mb-10 text-sm leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                  Ask me anything about languages, grammar, vocabulary, or study strategies. I'm here to help you learn faster and smarter.
                </p>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(prompt.prompt);
                        inputRef.current?.focus();
                      }}
                      className="group p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/30"
                      style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <prompt.icon className="w-4 h-4 text-accent-400" />
                        <span className="text-xs font-bold text-white">{prompt.label}</span>
                      </div>
                      <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--app-text-subtle)' }}>{prompt.prompt}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-accent-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="px-4 md:px-6 py-6 space-y-6 max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-accent-600 to-fuchsia-600'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-5 py-4 rounded-2xl text-sm leading-relaxed border ${
                          msg.role === 'user'
                            ? 'bg-accent-600/20 border-accent-500/20 text-white rounded-br-md'
                            : 'rounded-bl-md'
                        }`}
                        style={msg.role === 'assistant' ? { background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text-muted)' } : undefined}
                      >
                        {/* Render lightweight markdown without executing raw HTML. */}
                        <div className="whitespace-pre-wrap">{renderSafeMessageContent(msg.content)}</div>
                      </div>

                      {/* Actions */}
                      <div className={`flex items-center gap-2 mt-1.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-[10px] font-mono" style={{ color: 'var(--app-text-subtle)' }}>{formatTime(msg.timestamp)}</span>
                        {msg.role === 'assistant' && (
                          <>
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-1 rounded-md hover:bg-[var(--app-surface-hover)] opacity-0 group-hover:opacity-100 transition-all"
                              style={{ color: 'var(--app-text-subtle)' }}
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => toast('Đọc to sẽ sớm có mặt', { icon: '🔊' })}
                              className="p-1 rounded-md hover:bg-[var(--app-surface-hover)] opacity-0 group-hover:opacity-100 transition-all"
                              style={{ color: 'var(--app-text-subtle)' }}
                              title="Listen (sắp có)"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-600 to-fuchsia-600 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl rounded-bl-md border" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="px-4 md:px-6 pb-5 pt-3 border-t backdrop-blur-md flex-shrink-0" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your AI tutor anything..."
                    rows={1}
                    disabled={isTyping || isLoading || !activeConvId}
                    className="w-full px-5 py-4 pr-14 rounded-2xl border text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-all resize-none disabled:opacity-50"
                    style={{ background: 'var(--app-surface-hover)', borderColor: 'var(--app-border-strong)', color: 'var(--app-text)', maxHeight: '160px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || isLoading || !activeConvId}
                    className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] mt-2 text-center font-medium" style={{ color: 'var(--app-text-subtle)' }}>
                AI Tutor may occasionally provide inaccurate information. Always verify important facts.
              </p>
            </div>
          </div>
        </div>
      </div>
      <AiSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
