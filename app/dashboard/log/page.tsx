'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Sun,
  Droplets,
  Brain,
  CalendarCheck,
  Smartphone,
  Dumbbell,
  BookOpen,
  Code,
  Moon,
  Heart,
  Check,
  ChevronDown,
  Loader2,
  Snowflake,
  Clock,
  Target,
  Flame
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { calculateDisciplineScore } from '@/lib/calculations';
import { ZenCard, ZenFade, ZenNumber, ZenProgress, ZenMilestone } from '@/components/zen';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface HabitItem {
  id: string;
  label: string;
  icon: typeof Sun;
  state: boolean;
  setter: (value: boolean) => void;
}

const workoutOptions = [
  { value: 'Rest', label: 'Rest Day' },
  { value: 'Gym', label: 'Gym' },
  { value: 'Run', label: 'Running' },
  { value: 'Calisthenics', label: 'Calisthenics' },
  { value: 'Swim', label: 'Swimming' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Cardio', label: 'Cardio' },
];

// ============================================================================
// ZEN HABIT TOGGLE - Save on toggle
// ============================================================================

interface ZenHabitToggleProps {
  label: string;
  icon: typeof Sun;
  checked: boolean;
  onChange: (checked: boolean) => void;
  gold?: boolean;
}

function ZenHabitToggle({ label, icon: Icon, checked, onChange, gold = false }: ZenHabitToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-full flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-500
        ${checked 
          ? gold
            ? 'bg-[var(--gold-soft)] border-[var(--gold-primary)]/30'
            : 'bg-[var(--status-success)]/10 border-[var(--status-success)]/30' 
          : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
        }
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <motion.div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${checked 
            ? gold 
              ? 'bg-[var(--gold-medium)]' 
              : 'bg-[var(--status-success)]/20' 
            : 'bg-[var(--surface-2)]'
          }
        `}
        animate={checked ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon 
          size={20} 
          strokeWidth={1.5}
          className={checked ? (gold ? 'text-[var(--gold-primary)]' : 'text-[var(--status-success)]') : 'text-[var(--text-muted)]'} 
        />
      </motion.div>

      {/* Label */}
      <span className={`flex-1 text-left font-medium ${checked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
        {label}
      </span>

      {/* Checkmark */}
      <motion.div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          ${checked 
            ? gold 
              ? 'bg-[var(--gold-primary)] border-[var(--gold-primary)]' 
              : 'bg-[var(--status-success)] border-[var(--status-success)]' 
            : 'border-[var(--border-medium)] bg-transparent'
          }
        `}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check size={14} className="text-[var(--obsidian-deepest)]" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

// ============================================================================
// ZEN NUMBER INPUT
// ============================================================================

interface ZenNumberInputProps {
  label: string;
  icon: typeof Sun;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function ZenNumberInput({ label, icon: Icon, value, onChange, min = 0, max = 100, step = 1, suffix = '' }: ZenNumberInputProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
      <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
        <Icon size={20} strokeWidth={1.5} className="text-[var(--text-muted)]" />
      </div>
      <span className="flex-1 text-[var(--text-muted)] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
          whileTap={{ scale: 0.9 }}
        >
          −
        </motion.button>
        <span className="w-16 text-center text-[var(--text-primary)] font-medium">
          {value}{suffix}
        </span>
        <motion.button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// ZEN SELECT
// ============================================================================

interface ZenSelectProps {
  label: string;
  icon: typeof Sun;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function ZenSelect({ label, icon: Icon, value, onChange, options }: ZenSelectProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
      <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
        <Icon size={20} strokeWidth={1.5} className="text-[var(--text-muted)]" />
      </div>
      <span className="flex-1 text-[var(--text-muted)] font-medium">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-[var(--surface-2)] text-[var(--text-primary)] px-4 py-2 pr-8 rounded-xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--gold-primary)] cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-ghost)] pointer-events-none" />
      </div>
    </div>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

interface SectionHeaderProps {
  icon: typeof Sun;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
        <Icon size={16} strokeWidth={1.5} className="text-[var(--gold-primary)]" />
      </div>
      <div>
        <h2 className="text-[var(--text-primary)] font-medium text-base">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[var(--text-ghost)] text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DailyLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);

  // Morning Habits
  const [wokeUp6am, setWokeUp6am] = useState(false);
  const [coldShower, setColdShower] = useState(false);
  const [noPhoneFirstHour, setNoPhoneFirstHour] = useState(false);
  const [meditated, setMeditated] = useState(false);
  
  // Evening Habit
  const [plannedTomorrow, setPlannedTomorrow] = useState(false);

  // Fitness
  const [workoutType, setWorkoutType] = useState<string>('Rest');
  const [waterIntake, setWaterIntake] = useState(0);
  
  // Recovery
  const [sleepHours, setSleepHours] = useState(7);

  // Learning
  const [leetcodeSolved, setLeetcodeSolved] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [studyHours, setStudyHours] = useState(0);

  // Journal
  const [impulseRating, setImpulseRating] = useState(3);
  const [notes, setNotes] = useState('');

  // Calculated discipline score
  const disciplineScore = calculateDisciplineScore({
    wokeUp6am,
    coldShower,
    noPhoneFirstHour,
    meditated,
    plannedTomorrow,
  });

  const isGold = disciplineScore >= 90;
  const morningHabitsCompleted = [wokeUp6am, coldShower, noPhoneFirstHour, meditated].filter(Boolean).length;
  const eveningHabitsCompleted = [plannedTomorrow].filter(Boolean).length;
  const totalHabitsCompleted = morningHabitsCompleted + eveningHabitsCompleted;

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    const loadTodayLog = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const { data: log } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        if (log) {
          setWokeUp6am(log.woke_up_at_6am);
          setColdShower(log.cold_shower);
          setNoPhoneFirstHour(log.no_phone_first_hour);
          setMeditated(log.meditated);
          setPlannedTomorrow(log.planned_tomorrow);
          setWorkoutType(log.workout_type || 'Rest');
          setWaterIntake(log.water_intake_oz || 0);
          setSleepHours(log.sleep_hours || 7);
          setLeetcodeSolved(log.leetcode_solved || 0);
          setPagesRead(log.pages_read || 0);
          setStudyHours(log.study_hours || 0);
          setImpulseRating(log.impulse_control_rating || 3);
          setNotes(log.notes || '');
        }
      } catch (error) {
        console.error('Error loading log:', error);
      }
    };

    loadTodayLog();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const logData = {
        user_id: user.id,
        log_date: today,
        woke_up_at_6am: wokeUp6am,
        cold_shower: coldShower,
        no_phone_first_hour: noPhoneFirstHour,
        meditated: meditated,
        planned_tomorrow: plannedTomorrow,
        workout_type: workoutType,
        water_intake_oz: waterIntake,
        sleep_hours: sleepHours,
        leetcode_solved: leetcodeSolved,
        pages_read: pagesRead,
        study_hours: studyHours,
        impulse_control_rating: impulseRating,
        notes: notes,
        discipline_score: disciplineScore,
      };

      const { error: upsertError } = await supabase
        .from('daily_logs')
        .upsert(logData, { onConflict: 'user_id,log_date' });

      if (upsertError) throw upsertError;

      // Show milestone if all habits completed
      if (totalHabitsCompleted === 5) {
        setShowMilestone(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save log';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const morningHabits: HabitItem[] = [
    { id: 'woke', label: 'Woke up at 6 AM', icon: Sun, state: wokeUp6am, setter: setWokeUp6am },
    { id: 'cold', label: 'Cold shower', icon: Snowflake, state: coldShower, setter: setColdShower },
    { id: 'phone', label: 'No phone first hour', icon: Smartphone, state: noPhoneFirstHour, setter: setNoPhoneFirstHour },
    { id: 'meditate', label: 'Meditated', icon: Brain, state: meditated, setter: setMeditated },
  ];

  const eveningHabits: HabitItem[] = [
    { id: 'plan', label: 'Planned tomorrow', icon: CalendarCheck, state: plannedTomorrow, setter: setPlannedTomorrow },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Milestone Modal */}
      <ZenMilestone
        isOpen={showMilestone}
        onClose={() => router.push('/dashboard')}
        title="Day Complete"
        subtitle="All habits accomplished. Rest well."
      />

      {/* Header - Minimal */}
      <motion.header 
        className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <motion.div 
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Back</span>
            </motion.div>
          </Link>
          <p className="text-[var(--text-ghost)] text-sm tracking-wide">{dateStr}</p>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Title */}
        <ZenFade>
          <div className="mb-8">
            <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">
              Daily Log
            </h1>
            <p className="text-[var(--text-ghost)]">Close today&apos;s chapter with intention.</p>
          </div>
        </ZenFade>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-[20px] bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ============================================================ */}
          {/* DISCIPLINE SCORE PREVIEW */}
          {/* ============================================================ */}
          <ZenFade delay={0.1}>
            <ZenCard variant={isGold ? 'gold' : 'default'} halo={isGold}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                    Discipline Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <ZenNumber value={disciplineScore} gold={isGold} className="text-4xl" />
                    {isGold && (
                      <span className="text-[var(--gold-primary)] text-sm font-medium">Elite</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-ghost)] text-xs mb-1">Habits</p>
                  <p className="text-[var(--text-primary)] text-lg font-light">{totalHabitsCompleted}/5</p>
                </div>
              </div>
              <ZenProgress value={(totalHabitsCompleted / 5) * 100} gold={isGold} />
            </ZenCard>
          </ZenFade>

          {/* ============================================================ */}
          {/* MORNING ROUTINE */}
          {/* ============================================================ */}
          <ZenFade delay={0.2}>
            <div>
              <SectionHeader 
                icon={Sun} 
                title="Morning Routine" 
                subtitle="Start your day right" 
              />
              <div className="space-y-3">
                {morningHabits.map((habit, idx) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <ZenHabitToggle
                      label={habit.label}
                      icon={habit.icon}
                      checked={habit.state}
                      onChange={habit.setter}
                      gold={isGold}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* EVENING ROUTINE */}
          {/* ============================================================ */}
          <ZenFade delay={0.3}>
            <div>
              <SectionHeader 
                icon={Moon} 
                title="Evening Routine" 
                subtitle="Prepare for tomorrow" 
              />
              <div className="space-y-3">
                {eveningHabits.map((habit, idx) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                  >
                    <ZenHabitToggle
                      label={habit.label}
                      icon={habit.icon}
                      checked={habit.state}
                      onChange={habit.setter}
                      gold={isGold}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* FITNESS */}
          {/* ============================================================ */}
          <ZenFade delay={0.4}>
            <div>
              <SectionHeader 
                icon={Dumbbell} 
                title="Fitness" 
                subtitle="Track your workout and hydration" 
              />
              <div className="space-y-3">
                <ZenSelect
                  label="Workout Type"
                  icon={Flame}
                  value={workoutType}
                  onChange={setWorkoutType}
                  options={workoutOptions}
                />
                <ZenNumberInput
                  label="Water Intake"
                  icon={Droplets}
                  value={waterIntake}
                  onChange={setWaterIntake}
                  max={200}
                  step={8}
                  suffix=" oz"
                />
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* RECOVERY */}
          {/* ============================================================ */}
          <ZenFade delay={0.45}>
            <div>
              <SectionHeader 
                icon={Clock} 
                title="Recovery" 
                subtitle="Rest is part of the process" 
              />
              <div className="space-y-3">
                <ZenNumberInput
                  label="Hours Slept"
                  icon={Moon}
                  value={sleepHours}
                  onChange={setSleepHours}
                  min={0}
                  max={12}
                  step={0.5}
                  suffix=" hrs"
                />
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* LEARNING */}
          {/* ============================================================ */}
          <ZenFade delay={0.5}>
            <div>
              <SectionHeader 
                icon={BookOpen} 
                title="Learning" 
                subtitle="Grow your mind daily" 
              />
              <div className="space-y-3">
                <ZenNumberInput
                  label="LeetCode Problems"
                  icon={Code}
                  value={leetcodeSolved}
                  onChange={setLeetcodeSolved}
                  max={20}
                />
                <ZenNumberInput
                  label="Pages Read"
                  icon={BookOpen}
                  value={pagesRead}
                  onChange={setPagesRead}
                  max={100}
                  step={5}
                />
                <ZenNumberInput
                  label="Study Hours"
                  icon={Brain}
                  value={studyHours}
                  onChange={setStudyHours}
                  max={12}
                  step={0.5}
                  suffix=" hrs"
                />
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* REFLECTION */}
          {/* ============================================================ */}
          <ZenFade delay={0.6}>
            <div>
              <SectionHeader 
                icon={Heart} 
                title="Reflection" 
                subtitle="End with gratitude" 
              />
              <div className="space-y-4">
                {/* Impulse Control */}
                <div className="p-4 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                      <Target size={20} strokeWidth={1.5} className="text-[var(--text-muted)]" />
                    </div>
                    <span className="text-[var(--text-muted)] font-medium">Impulse Control</span>
                    <span className="ml-auto text-[var(--text-primary)] font-medium">{impulseRating}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <motion.button
                        key={num}
                        type="button"
                        onClick={() => setImpulseRating(num)}
                        className={`
                          flex-1 h-2 rounded-full transition-colors
                          ${num <= impulseRating ? 'bg-[var(--gold-primary)]' : 'bg-[var(--surface-2)]'}
                        `}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="p-4 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="One line about today..."
                    className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-ghost)] resize-none focus:outline-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </ZenFade>

          {/* ============================================================ */}
          {/* SUBMIT BUTTON - "Close Day" */}
          {/* ============================================================ */}
          <ZenFade delay={0.7}>
            <motion.button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-[20px] font-medium text-lg transition-all
                ${isGold 
                  ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]' 
                  : 'bg-[var(--text-primary)] text-[var(--background)]'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 mx-auto animate-spin" />
              ) : (
                <>Close Day ✓</>
              )}
            </motion.button>
          </ZenFade>
        </form>
      </div>
    </div>
  );
}
