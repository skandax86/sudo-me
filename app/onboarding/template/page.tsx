'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Leaf, 
  Sparkles, 
  Check, 
  X, 
  Loader2,
  Dumbbell,
  BookOpen,
  Droplets,
  Utensils,
  Camera,
  Heart,
  Brain,
  Target
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { TemplateType } from '@/types/database';
import { ZenFade } from '@/components/zen';
import { AppHeader } from '@/components/layout';

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

interface TemplateInfo {
  type: TemplateType;
  name: string;
  tagline: string;
  description: string;
  icon: typeof Flame;
  accentColor: string;
  rules: { icon: typeof Dumbbell; text: string }[];
  badge: string;
}

const templates: TemplateInfo[] = [
  {
    type: '75_hard',
    name: '75 Hard',
    tagline: 'Absolute discipline',
    description: 'Miss one task → restart from Day 1. For those who seek elite mental toughness.',
    icon: Flame,
    accentColor: 'var(--status-error)',
    badge: 'Elite',
    rules: [
      { icon: Dumbbell, text: '2 workouts (1 outdoor)' },
      { icon: BookOpen, text: 'Read 10 pages' },
      { icon: Droplets, text: 'Hydration goal' },
      { icon: Utensils, text: 'No cheat meals or alcohol' },
      { icon: Camera, text: 'Progress photo' },
    ],
  },
  {
    type: '75_soft',
    name: '75 Soft',
    tagline: 'Sustainable growth',
    description: 'Progress over perfection. Build discipline without burnout.',
    icon: Leaf,
    accentColor: 'var(--status-success)',
    badge: 'Sustainable',
    rules: [
      { icon: Dumbbell, text: '1 workout daily' },
      { icon: BookOpen, text: 'Read 10 pages' },
      { icon: Droplets, text: 'Hydration goal' },
      { icon: Heart, text: '80-90% diet compliance' },
      { icon: Brain, text: 'Daily reflection' },
    ],
  },
  {
    type: 'custom',
    name: 'Custom',
    tagline: 'Your own path',
    description: 'Fully personalized plan across all life domains. AI-generated based on your goals.',
    icon: Sparkles,
    accentColor: 'var(--gold-primary)',
    badge: 'Personalized',
    rules: [
      { icon: Target, text: 'Multi-domain tracking' },
      { icon: Brain, text: 'AI-generated plan' },
      { icon: Sparkles, text: 'Flexible rules' },
    ],
  },
];

// ============================================================================
// TEMPLATE CARD
// ============================================================================

interface TemplateCardProps {
  template: TemplateInfo;
  selected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  const Icon = template.icon;
  
  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative w-full text-left p-6 rounded-[28px] border transition-all duration-500
        ${selected 
          ? 'border-[var(--gold-primary)]/50 bg-[var(--gold-soft)]' 
          : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-medium)]'
        }
      `}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selected glow */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-[28px] -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${template.accentColor}15 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${selected ? 'bg-[var(--gold-medium)]' : 'bg-[var(--surface-2)]'}
          `}
          animate={selected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Icon 
            size={24} 
            strokeWidth={1.5}
            style={{ color: selected ? template.accentColor : 'var(--text-muted)' }}
          />
        </motion.div>
        {/* Badge with selection indicator */}
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: `${template.accentColor}20`, 
              color: template.accentColor 
            }}
          >
            {template.badge}
          </span>
          {/* Selection checkmark - inline with badge, not overlapping */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-6 h-6 rounded-full bg-[var(--gold-primary)] flex items-center justify-center"
              >
                <Check size={14} className="text-[var(--obsidian-deepest)]" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-medium text-[var(--text-primary)] mb-1">
        {template.name}
      </h3>
      <p className="text-[var(--text-muted)] text-sm mb-4">
        {template.tagline}
      </p>
      
      {/* Description */}
      <p className="text-[var(--text-ghost)] text-sm mb-4">
        {template.description}
      </p>

      {/* Rules */}
      <div className="space-y-2">
        {template.rules.map((rule, i) => {
          const RuleIcon = rule.icon;
          return (
            <motion.div 
              key={i}
              className="flex items-center gap-3 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <RuleIcon size={14} strokeWidth={1.5} className="text-[var(--text-ghost)]" />
              <span className="text-[var(--text-muted)]">{rule.text}</span>
            </motion.div>
          );
        })}
      </div>

    </motion.button>
  );
}

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

interface ConfirmModalProps {
  template: TemplateInfo;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmModal({ template, onConfirm, onCancel, loading }: ConfirmModalProps) {
  const Icon = template.icon;
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-[var(--obsidian-base)] rounded-[28px] p-8 max-w-md w-full border border-[var(--border-subtle)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${template.accentColor}20` }}
          >
            <Icon size={32} strokeWidth={1.5} style={{ color: template.accentColor }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-light text-[var(--text-primary)] text-center mb-2">
          This is a commitment
        </h2>
        <p className="text-[var(--text-ghost)] text-center mb-6">
          You&apos;re about to start <span className="text-[var(--text-primary)] font-medium">{template.name}</span>
        </p>

        {/* Rules */}
        <div className="space-y-3 mb-8 p-4 rounded-[20px] bg-[var(--surface-2)]">
          {template.type === '75_hard' && (
            <>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <X size={14} className="text-[var(--status-error)]" />
                <span>Missing one task resets progress</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Check size={14} className="text-[var(--status-success)]" />
                <span>75 days of absolute discipline</span>
              </div>
            </>
          )}
          {template.type === '75_soft' && (
            <>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Check size={14} className="text-[var(--status-success)]" />
                <span>Progress over perfection</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Check size={14} className="text-[var(--status-success)]" />
                <span>Flexible but consistent</span>
              </div>
            </>
          )}
          {template.type === 'custom' && (
            <>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Check size={14} className="text-[var(--status-success)]" />
                <span>Personalized to your goals</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <Check size={14} className="text-[var(--status-success)]" />
                <span>AI-generated plan</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[16px] border border-[var(--border-medium)] text-[var(--text-muted)] font-medium"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Go back
          </motion.button>
          <motion.button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-[16px] bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium disabled:opacity-50"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              "Yes, I'm ready"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TemplateSelectionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TemplateType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = templates.find(t => t.type === selectedType);

  const handleConfirm = async () => {
    if (!selectedType) return;

    setLoading(true);
    setError('');

    try {
      if (!isSupabaseReady()) {
        throw new Error('Database not connected');
      }

      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Start challenge via API
      const response = await fetch('/api/challenge/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_type: selectedType,
          start_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start challenge');
      }

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Fixed Header */}
      <AppHeader variant="auth" showBack backHref="/" />
      
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        {/* Page Title */}
        <ZenFade>
          <div className="text-center mb-12">
            <p className="text-[var(--gold-primary)] text-xs uppercase tracking-[0.2em] mb-4">
              Choose Your Path
            </p>
            <h1 className="text-4xl font-light text-[var(--text-primary)] tracking-tight mb-4">
              How will you transform?
            </h1>
            <p className="text-[var(--text-ghost)] max-w-md mx-auto">
              Select a challenge mode. Each path has different rules and expectations. 
              You can always change later.
            </p>
          </div>
        </ZenFade>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-[20px] bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Cards */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
        >
          {templates.map((template, idx) => (
            <motion.div
              key={template.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <TemplateCard
                template={template}
                selected={selectedType === template.type}
                onSelect={() => setSelectedType(template.type)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <ZenFade delay={0.6}>
          <motion.button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedType}
            className={`
              w-full py-4 rounded-[20px] font-medium text-lg transition-all
              ${selectedType 
                ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]' 
                : 'bg-[var(--surface-2)] text-[var(--text-ghost)] cursor-not-allowed'
              }
            `}
            whileHover={selectedType ? { y: -2 } : {}}
            whileTap={selectedType ? { scale: 0.98 } : {}}
          >
            {selectedType ? 'Continue' : 'Select a path to continue'}
          </motion.button>
        </ZenFade>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedTemplate && (
          <ConfirmModal
            template={selectedTemplate}
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
