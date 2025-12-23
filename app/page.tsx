'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  Rocket, 
  Brain, 
  Target, 
  Flame, 
  ChevronRight,
  Sparkles,
  Shield,
  ArrowRight,
  Leaf,
  Dumbbell,
  BookOpen,
  Droplets,
  Camera,
  Check,
  TrendingUp,
  Zap,
  Trophy,
  Calendar,
  BarChart3
} from 'lucide-react';
import { AppHeader } from '@/components/layout';

// ============================================================================
// FLOATING USER CARDS (Social Proof)
// ============================================================================

const floatingUsers = [
  { name: 'Arjun K.', badge: 'Day 47', challenge: '75 Hard', position: { top: '15%', right: '5%' } },
  { name: 'Priya M.', badge: 'Completed', challenge: '75 Soft', position: { top: '45%', right: '0%' } },
  { name: 'Rahul S.', badge: 'Day 23', challenge: 'Custom', position: { bottom: '25%', right: '8%' } },
];

function FloatingUserCard({ user, delay }: { user: typeof floatingUsers[0]; delay: number }) {
  return (
    <motion.div
      className="absolute z-20"
      style={user.position as React.CSSProperties}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-soft)] flex items-center justify-center text-[var(--obsidian-deepest)] font-bold text-sm">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-medium text-sm">{user.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-[var(--gold-primary)] text-xs font-medium">{user.badge}</span>
            <span className="text-[var(--text-ghost)] text-xs">• {user.challenge}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// 3D TILTED DASHBOARD PREVIEW
// ============================================================================

function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      x.set(e.clientX - rect.left - rect.width / 2);
      y.set(e.clientY - rect.top - rect.height / 2);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="relative w-full max-w-xl perspective-1000"
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      {/* Main Dashboard Card */}
      <motion.div
        className="relative rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-6 shadow-2xl"
        initial={{ opacity: 0, y: 40, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[var(--text-ghost)] text-xs uppercase tracking-wider">Today</p>
            <h3 className="text-[var(--text-primary)] text-2xl font-light">Day 47 of 75</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--status-success)]/20 text-[var(--status-success)]">
            <TrendingUp size={14} />
            <span className="text-xs font-medium">On Track</span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="var(--surface-2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="var(--gold-primary)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.63 }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                style={{ pathLength: 0.63 }}
                strokeDasharray="251.2"
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-2xl font-light text-[var(--text-primary)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                63%
              </motion.span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-ghost)]">Discipline Score</span>
                <span className="text-[var(--gold-primary)] font-medium">87/100</span>
              </div>
              <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-soft)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-ghost)]">Streak</span>
                <span className="text-[var(--status-success)] font-medium flex items-center gap-1">
                  <Flame size={12} />
                  47 days
                </span>
              </div>
              <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[var(--status-success)] to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Checklist */}
        <div className="space-y-2">
          <p className="text-[var(--text-ghost)] text-xs uppercase tracking-wider mb-3">Today&apos;s Tasks</p>
          {[
            { icon: Dumbbell, label: 'Morning Workout', done: true },
            { icon: Dumbbell, label: 'Outdoor Session', done: true },
            { icon: BookOpen, label: 'Read 10 Pages', done: true },
            { icon: Droplets, label: 'Water Goal', done: false, progress: '2.8L / 3.8L' },
            { icon: Camera, label: 'Progress Photo', done: false },
          ].map((task, i) => (
            <motion.div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl ${
                task.done ? 'bg-[var(--status-success)]/10' : 'bg-[var(--surface-2)]'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  task.done ? 'bg-[var(--status-success)]/20' : 'bg-[var(--surface-card)]'
                }`}>
                  <task.icon size={16} className={task.done ? 'text-[var(--status-success)]' : 'text-[var(--text-ghost)]'} />
                </div>
                <span className={`text-sm ${task.done ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}`}>
                  {task.label}
                </span>
              </div>
              {task.done ? (
                <div className="w-5 h-5 rounded-full bg-[var(--status-success)] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              ) : task.progress ? (
                <span className="text-xs text-[var(--text-ghost)]">{task.progress}</span>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[var(--border-subtle)]" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Icon Badges */}
      <motion.div
        className="absolute -top-4 -left-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--status-error)] to-orange-500 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, type: 'spring' }}
      >
        <Flame size={28} className="text-white" />
      </motion.div>

      <motion.div
        className="absolute -bottom-3 -left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold-primary)] to-yellow-400 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: 20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.3, type: 'spring' }}
      >
        <Trophy size={22} className="text-white" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 -right-5 w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--status-success)] to-emerald-400 flex items-center justify-center shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.4, type: 'spring' }}
      >
        <Zap size={20} className="text-white" />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// CHALLENGE CARDS (Compact)
// ============================================================================

const challenges = [
  {
    id: '75_hard',
    name: '75 Hard',
    tagline: 'Strict Discipline',
    icon: Flame,
    color: 'var(--status-error)',
    rules: ['2 workouts (1 outdoor)', 'No cheat meals', 'Read 10 pages', 'Drink 3.8L water'],
    coreRule: 'Miss ONE → reset to Day 1',
  },
  {
    id: '75_soft',
    name: '75 Soft',
    tagline: 'Sustainable Growth',
    icon: Leaf,
    color: 'var(--status-success)',
    rules: ['1 workout daily', '80-90% diet', 'Read 10 pages', 'Daily reflection'],
    coreRule: 'No reset. Progress > perfection.',
  },
  {
    id: 'custom',
    name: 'Custom',
    tagline: 'AI-Personalized',
    icon: Sparkles,
    color: 'var(--gold-primary)',
    rules: ['Choose domains', 'AI generates plan', 'Flexible rules'],
    coreRule: 'Your path, your pace.',
  },
];

function ChallengeCard({ challenge, index }: { challenge: typeof challenges[0]; index: number }) {
  const Icon = challenge.icon;
  
  return (
    <motion.div
      className="group relative p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-medium)] transition-all cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${challenge.color}20` }}
        >
          <Icon size={24} style={{ color: challenge.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--text-primary)] font-medium mb-0.5">{challenge.name}</h3>
          <p className="text-[var(--text-ghost)] text-sm mb-3">{challenge.tagline}</p>
          <ul className="space-y-1.5 mb-3">
            {challenge.rules.slice(0, 3).map((rule, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Check size={12} style={{ color: challenge.color }} />
                {rule}
              </li>
            ))}
          </ul>
          <p className="text-xs font-medium" style={{ color: challenge.color }}>
            {challenge.coreRule}
          </p>
        </div>
      </div>
      
      {/* Hover Arrow */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ x: -5 }}
        whileHover={{ x: 0 }}
      >
        <ChevronRight size={20} style={{ color: challenge.color }} />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// FEATURES LIST
// ============================================================================

const features = [
  { icon: Calendar, text: 'Curated 75-day challenges designed for discipline.' },
  { icon: BarChart3, text: 'Detailed tracking across health, finance & learning.' },
  { icon: Flame, text: 'Stay consistent with streaks and discipline scoring.' },
  { icon: Brain, text: 'AI-powered plans for faster transformation.' },
];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Subtle background gradients */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, var(--gold-soft) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, var(--status-error)10 0%, transparent 40%)
          `,
        }}
      />

      {/* Fixed Header */}
      <AppHeader variant="landing" />

      {/* Hero Section - Split Layout */}
      <section className="relative z-10 px-6 lg:px-12 pt-28 pb-12 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div>
            {/* Social Proof Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--gold-primary)] to-orange-400 border-2 border-[var(--surface-card)]"
                  />
                ))}
              </div>
              <span className="text-[var(--text-muted)] text-sm">
                <span className="text-[var(--text-primary)] font-medium">1,200+</span> Transformations
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--text-primary)] leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-[var(--gold-primary)]">ONE STOP</span>
              <br />
              Transformation Platform
              <br />
              For <span className="text-[var(--gold-primary)]">LIFE</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              className="text-[var(--text-muted)] text-lg mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Track health, finance, and learning with structured challenges, 
              AI-powered plans, and discipline scoring built for results.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              className="flex flex-wrap gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/auth/signup">
                <motion.button
                  className="px-8 py-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium flex items-center gap-2 hover:bg-[var(--surface-2)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start for Free
                </motion.button>
              </Link>
              <Link href="#challenges">
                <motion.button
                  className="px-8 py-4 rounded-xl bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.02, gap: '12px' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Challenges
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>

            {/* Features List */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <feature.icon size={18} className="text-[var(--gold-primary)]" />
                  <span className="text-[var(--text-muted)] text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Interactive Dashboard Preview */}
          <div className="relative">
            {/* Floating User Cards */}
            {floatingUsers.map((user, i) => (
              <FloatingUserCard key={user.name} user={user} delay={1.5 + i * 0.2} />
            ))}
            
            {/* Dashboard Preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Challenge Modes Section */}
      <section id="challenges" className="relative z-10 px-6 lg:px-12 py-24 bg-[var(--surface-2)]/50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[var(--gold-primary)] text-xs uppercase tracking-[0.2em] mb-3">Choose Your Path</p>
            <h2 className="text-3xl lg:text-4xl font-light text-[var(--text-primary)] mb-4">
              Three Paths to Transformation
            </h2>
            <p className="text-[var(--text-ghost)] max-w-xl mx-auto">
              75 Hard for elite discipline. 75 Soft for sustainable growth. 
              Custom for full life optimization.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {challenges.map((challenge, i) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={i} />
            ))}
          </div>

          {/* Comparison Quick View */}
          <motion.div 
            className="mt-12 p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div className="text-left text-[var(--text-ghost)]">Aspect</div>
              <div className="text-[var(--status-error)] font-medium">75 Hard</div>
              <div className="text-[var(--status-success)] font-medium">75 Soft</div>
              <div className="text-[var(--gold-primary)] font-medium">Custom</div>
              
              <div className="text-left text-[var(--text-muted)]">Miss a day</div>
              <div className="text-[var(--text-primary)]">Reset</div>
              <div className="text-[var(--text-primary)]">Continue</div>
              <div className="text-[var(--text-primary)]">Your rules</div>
              
              <div className="text-left text-[var(--text-muted)]">Strictness</div>
              <div className="text-[var(--text-primary)]">Very High</div>
              <div className="text-[var(--text-primary)]">Moderate</div>
              <div className="text-[var(--text-primary)]">Flexible</div>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div 
            className="mt-8 p-4 rounded-xl border border-[var(--status-warning)]/30 bg-[var(--status-warning)]/10 flex items-start gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Shield size={20} className="text-[var(--status-warning)] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-[var(--status-warning)] font-medium mb-1">Important</p>
              <p className="text-[var(--text-muted)]">
                Rules cannot be edited mid-challenge. Switching challenges resets progress. Discipline beats intensity.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[var(--gold-primary)] text-xs uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-light text-[var(--text-primary)] mb-4">
              Everything You Need to Transform
            </h2>
            <p className="text-[var(--text-ghost)] max-w-xl mx-auto">
              Powerful tools designed to help you build discipline, track progress, and stay accountable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Multi-Domain Tracking',
                description: 'Track health, fitness, finance, learning, and personal growth all in one place.',
                color: 'var(--gold-primary)',
              },
              {
                icon: Flame,
                title: 'Streak System',
                description: 'Build momentum with visual streaks that keep you motivated day after day.',
                color: 'var(--status-error)',
              },
              {
                icon: BarChart3,
                title: 'Discipline Score',
                description: 'Get a daily score that reflects your overall commitment to your goals.',
                color: 'var(--status-info)',
              },
              {
                icon: Brain,
                title: 'AI-Powered Plans',
                description: 'Let AI generate personalized plans based on your lifestyle and goals.',
                color: 'var(--status-success)',
              },
              {
                icon: Calendar,
                title: 'Daily Rituals',
                description: 'End each day with a reflection ritual that reinforces positive habits.',
                color: 'var(--gold-primary)',
              },
              {
                icon: Trophy,
                title: 'Achievements & XP',
                description: 'Earn XP and unlock achievements as you hit milestones in your journey.',
                color: 'var(--status-warning)',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-medium)] transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-[var(--text-primary)] font-medium mb-2">{feature.title}</h3>
                <p className="text-[var(--text-ghost)] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-[var(--surface-2)]/50">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gold-primary)] to-orange-400 flex items-center justify-center">
              <Sparkles size={40} className="text-white" />
            </div>
          </motion.div>

          <motion.h2 
            className="text-3xl font-light text-[var(--text-primary)] mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to transform?
          </motion.h2>
          <motion.p 
            className="text-[var(--text-ghost)] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Join 1,200+ people building better habits, one day at a time.
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/auth/signup">
              <motion.button
                className="py-4 px-12 rounded-xl bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium text-lg flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Transformation
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>

          <motion.p 
            className="text-[var(--text-ghost)] text-sm mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            100% Free • Takes 2 minutes • No strings attached
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/auth/login"
              className="inline-block mt-4 text-[var(--text-muted)] hover:text-[var(--gold-primary)] transition-colors text-sm"
            >
              Already have an account? Log in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-ghost)] text-sm">
            <Rocket size={16} className="text-[var(--gold-primary)]" />
            <span>Tracky © 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-ghost)]">
            <span className="flex items-center gap-1.5">
              <Brain size={14} />
              AI-powered
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} />
              Private & Secure
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
