import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Zap,
  Check,
  X,
  Star,
  Sparkles,
  Shield,
  Brain,
  Bot,
  Users,
  BookOpen,
  Flame,
  Trophy,
  Infinity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Download,
  BarChart2,
  Target,
  Rocket,
  Gift,
  CreditCard,
  Lock,
  Globe,
  Headphones,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import './Education.css';

/* ============ Plan Data ============ */
interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  icon: any;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  badgeColor?: string;
  features: PlanFeature[];
  gradient: string;
  glowColor: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: BookOpen,
    description: 'Get started with basic learning tools',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: '5 courses access', included: true },
      { text: '50 flashcards / month', included: true },
      { text: 'Basic quiz mode', included: true },
      { text: 'Community access', included: true },
      { text: 'AI Tutor (5 msgs/day)', included: true },
      { text: 'Unlimited courses', included: false },
      { text: 'Unlimited flashcards', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Document import AI', included: false },
      { text: 'Priority support', included: false },
      { text: 'Certificate of completion', included: false },
      { text: 'Offline mode', included: false },
    ],
    gradient: 'from-slate-600 to-slate-700',
    glowColor: 'rgba(100,116,139,0.15)',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    description: 'Everything you need to learn faster',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    badge: 'Most Popular',
    badgeColor: 'from-accent-600 to-fuchsia-600',
    popular: true,
    features: [
      { text: 'Unlimited courses', included: true, highlight: true },
      { text: 'Unlimited flashcards', included: true, highlight: true },
      { text: 'All quiz modes', included: true },
      { text: 'Community access', included: true },
      { text: 'AI Tutor (100 msgs/day)', included: true, highlight: true },
      { text: 'Advanced analytics', included: true, highlight: true },
      { text: 'Document import AI', included: true, highlight: true },
      { text: 'Priority support', included: true },
      { text: 'Certificate of completion', included: true },
      { text: 'Offline mode', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'API access', included: false },
    ],
    gradient: 'from-accent-600 to-fuchsia-600',
    glowColor: 'rgba(139,92,246,0.2)',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    description: 'The ultimate learning experience',
    monthlyPrice: 19.99,
    yearlyPrice: 14.99,
    badge: 'Best Value',
    badgeColor: 'from-amber-500 to-orange-600',
    features: [
      { text: 'Everything in Pro', included: true, highlight: true },
      { text: 'Unlimited AI Tutor', included: true, highlight: true },
      { text: 'Offline mode', included: true, highlight: true },
      { text: 'Team collaboration', included: true, highlight: true },
      { text: 'API access', included: true },
      { text: 'Custom study paths', included: true, highlight: true },
      { text: 'Early feature access', included: true },
      { text: 'Dedicated support', included: true },
      { text: '1-on-1 tutoring sessions', included: true, highlight: true },
      { text: 'White-label certificates', included: true },
      { text: 'Export all data', included: true },
      { text: 'Lifetime deal available', included: true },
    ],
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245,158,11,0.15)',
  },
];

const TESTIMONIALS = [
  { name: 'Minh Tuấn', role: 'Software Engineer', text: 'Pro plan transformed my learning. AI Tutor alone is worth 10x the price!', rating: 5, avatar: 'M' },
  { name: 'Thu Hà', role: 'University Student', text: 'The unlimited flashcards and document import saved me hundreds of hours of study time.', rating: 5, avatar: 'T' },
  { name: 'Đức Anh', role: 'Language Teacher', text: 'Premium is a game-changer for my students. The analytics and custom paths are incredible.', rating: 5, avatar: 'Đ' },
];

const FAQ_ITEMS = [
  { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'Is there a free trial for Pro?', a: 'Absolutely! Every new user gets a 14-day free trial of Pro with full access to all features. No credit card required.' },
  { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, AMEX, PayPal, and bank transfer. All payments are processed securely with 256-bit encryption.' },
  { q: 'Can I get a refund?', a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students with a valid .edu email get 50% off any paid plan. Contact support with your student ID.' },
  { q: 'What happens when my subscription ends?', a: 'Your data is safe! You\'ll be downgraded to the Free plan but can still access your content. Upgrade anytime to regain Pro/Premium features.' },
];

export default function PremiumUpgrade() {
  const { user } = useAuthStore();
  const [isYearly, setIsYearly] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const yearlySavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  return (
    <div className="education-container">
      <div className="dashboard-wrapper">
        {/* ============ Hero Section ============ */}
        <div className="relative text-center mb-16 pt-8">
          {/* Ambient glow */}
          <div className="absolute inset-0 -top-20 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-accent-600/8 rounded-full blur-[150px]" />
            <div className="absolute top-10 right-1/3 w-[400px] h-[400px] bg-amber-600/6 rounded-full blur-[120px]" />
          </div>

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent-600/20 to-fuchsia-600/20 border border-accent-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span className="text-xs font-bold text-accent-400 tracking-widest uppercase">Upgrade Your Learning</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black font-headline text-white mb-4 leading-tight">
              Unlock Your Full
              <br />
              <span className="bg-gradient-to-r from-accent-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                Learning Potential
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Choose the perfect plan to accelerate your learning journey. From casual learners to power users, we have you covered.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-2 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/10">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  !isYearly
                    ? 'bg-accent-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isYearly
                    ? 'bg-accent-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ============ Pricing Cards ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const savings = yearlySavings(plan.monthlyPrice, plan.yearlyPrice);
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`relative group rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? 'ring-2 ring-accent-500/50 shadow-[0_0_60px_rgba(139,92,246,0.12)]'
                    : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white bg-gradient-to-r ${plan.badgeColor} shadow-lg`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`h-full bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col ${
                  plan.popular ? 'border-accent-500/30' : ''
                }`}>
                  {/* Ambient glow */}
                  <div
                    className="absolute -top-20 right-0 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: plan.glowColor }}
                  />

                  {/* Plan Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black font-headline text-white">{plan.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black font-mono text-white">
                        {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-slate-500 font-bold">/month</span>
                      )}
                    </div>
                    {isYearly && price > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500 line-through font-mono">${plan.monthlyPrice.toFixed(2)}/mo</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          SAVE {savings}%
                        </span>
                      </div>
                    )}
                    {isYearly && price > 0 && (
                      <p className="text-xs text-slate-500 mt-1 font-bold">
                        Billed ${(price * 12).toFixed(2)}/year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-8 ${
                      plan.id === 'free'
                        ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        : plan.popular
                        ? 'bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:scale-[1.02] active:scale-95'
                        : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:scale-[1.02] active:scale-95`
                    }`}
                  >
                    {plan.id === 'free' ? 'Current Plan' : (
                      <>
                        <Rocket className="w-4 h-4" />
                        {plan.id === 'pro' ? 'Start Free Trial' : 'Go Premium'}
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="flex-1 space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-accent-400' : 'text-emerald-400'}`} />
                        ) : (
                          <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
                        )}
                        <span className={`text-sm ${
                          feature.included
                            ? feature.highlight ? 'text-white font-bold' : 'text-slate-300'
                            : 'text-slate-600'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============ Feature Comparison Grid ============ */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3">
              Why Go Premium?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Unlock powerful features that make learning 3x faster
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <FeatureCard
              icon={Bot}
              title="Unlimited AI Tutor"
              description="24/7 personalized tutoring with context-aware AI that remembers your progress"
              color="violet"
            />
            <FeatureCard
              icon={Brain}
              title="Smart Analytics"
              description="Deep insights into your learning patterns with AI-powered improvement suggestions"
              color="fuchsia"
            />
            <FeatureCard
              icon={Download}
              title="Document Import"
              description="Convert any PDF, DOCX, or text into interactive flashcards with one click"
              color="emerald"
            />
            <FeatureCard
              icon={Infinity}
              title="Unlimited Access"
              description="No limits on courses, flashcards, quizzes, or study time. Learn without boundaries"
              color="amber"
            />
            <FeatureCard
              icon={Globe}
              title="Offline Mode"
              description="Download courses and study anywhere — no internet required"
              color="blue"
            />
            <FeatureCard
              icon={Trophy}
              title="Certificates"
              description="Earn verified certificates upon course completion to showcase your skills"
              color="amber"
            />
            <FeatureCard
              icon={Headphones}
              title="Priority Support"
              description="Get help within 2 hours with dedicated support team access"
              color="emerald"
            />
            <FeatureCard
              icon={Users}
              title="Team Features"
              description="Collaborate with classmates, share decks, and track group progress"
              color="violet"
            />
          </div>
        </div>

        {/* ============ Social Proof / Metrics ============ */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black font-mono text-accent-400">50K+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Learners</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black font-mono text-emerald-400">4.9</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">App Rating ⭐</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black font-mono text-amber-400">98%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Satisfaction</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black font-mono text-fuchsia-400">3x</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Faster Learning</div>
            </div>
          </div>
        </div>

        {/* ============ Testimonials ============ */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3">
              Loved by Learners
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              See what our Pro and Premium members have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ FAQ ============ */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-all"
                >
                  <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ============ CTA Banner ============ */}
        <div className="relative max-w-4xl mx-auto mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-600/20 to-fuchsia-600/20 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-r from-accent-900/60 via-fuchsia-900/40 to-accent-900/60 backdrop-blur-xl border border-accent-500/20 rounded-3xl p-10 md:p-14 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Gift className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Limited Time Offer</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black font-headline text-white mb-4">
              Start Your 14-Day Free Trial
            </h2>
            <p className="text-slate-300 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Try Pro for free. No credit card required. Cancel anytime. Join 50,000+ learners who are already learning smarter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-base shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all">
                <Rocket className="w-5 h-5" />
                Start Free Trial
              </button>
              <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all">
                <MessageCircle className="w-5 h-5" />
                Talk to Sales
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Secure Payment
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                30-day Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Cancel Anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Sub-components ============ */

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: 'violet' | 'fuchsia' | 'emerald' | 'amber' | 'blue';
}) {
  const colorMap = {
    violet: { gradient: 'from-accent-500 to-indigo-500', glow: 'group-hover:bg-accent-500/10' },
    fuchsia: { gradient: 'from-fuchsia-500 to-pink-500', glow: 'group-hover:bg-fuchsia-500/10' },
    emerald: { gradient: 'from-emerald-500 to-teal-500', glow: 'group-hover:bg-emerald-500/10' },
    amber: { gradient: 'from-amber-500 to-orange-500', glow: 'group-hover:bg-amber-500/10' },
    blue: { gradient: 'from-blue-500 to-cyan-500', glow: 'group-hover:bg-blue-500/10' },
  };
  const c = colorMap[color];

  return (
    <div className="group bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-[50px] transition-colors duration-500 ${c.glow}`} />
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
