import React, { createContext, useContext, useState, useEffect } from 'react';
import { type OnboardingProfile } from '@/types/onboarding';
import { toLocalDateKey, getReflectionStreak } from '@/lib/streak';
import { getStageIndex } from '@/lib/stage';

const MAX_RECENTLY_VIEWED = 10;

export interface NotificationPrefs {
  newPicks: boolean;
  communityReplies: boolean;
  stageProgress: boolean;
}

const defaultNotificationPrefs: NotificationPrefs = {
  newPicks: true,
  communityReplies: true,
  stageProgress: true,
};

interface OnboardingContextType {
  profile: Partial<OnboardingProfile>;
  updateProfile: (data: Partial<OnboardingProfile>) => void;
  startOnboarding: (name: string, userId: string) => string;
  completeOnboarding: (profileSummary: string) => void;
  isOnboardingComplete: boolean;
  reflectionCount: number;
  reflectionStreak: number;
  logReflection: () => void;
  recentlyViewed: string[];
  logView: (id: string) => void;
  savedIds: string[];
  toggleSaved: (id: string) => void;
  dismissedIds: string[];
  dismissItem: (id: string) => void;
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (data: Partial<NotificationPrefs>) => void;
  reduceMotionOverride: boolean;
  setReduceMotionOverride: (value: boolean) => void;
  hasSeenTour: boolean;
  markTourSeen: () => void;
  lastSeenStageIndex: number;
  setLastSeenStageIndex: (index: number) => void;
  startedAt: string | null;
  resetAll: () => void;
}

const defaultProfile: Partial<OnboardingProfile> = {
  habits: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const readSavedState = () => {
  try {
    const saved = localStorage.getItem('onboarding_state');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to parse onboarding state', e);
    return null;
  }
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read synchronously on first render (lazy initializer) rather than in a
  // useEffect: an effect-based load races the save effect below on mount
  // (the save effect fires with the stale default state before the loaded
  // state commits, clobbering whatever was just read from storage).
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>(() => {
    const saved = readSavedState();
    return saved?.profile ? { ...defaultProfile, ...saved.profile } : defaultProfile;
  });
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => !!readSavedState()?.isComplete);
  const [reflectionCount, setReflectionCount] = useState<number>(() => readSavedState()?.reflectionCount ?? 0);
  const [reflectionDates, setReflectionDates] = useState<string[]>(() => readSavedState()?.reflectionDates ?? []);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => readSavedState()?.recentlyViewed ?? []);
  const [savedIds, setSavedIds] = useState<string[]>(() => readSavedState()?.savedIds ?? []);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => readSavedState()?.dismissedIds ?? []);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    () => ({ ...defaultNotificationPrefs, ...(readSavedState()?.notificationPrefs ?? {}) })
  );
  const [reduceMotionOverride, setReduceMotionOverride] = useState<boolean>(() => !!readSavedState()?.reduceMotionOverride);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => !!readSavedState()?.hasSeenTour);
  // Seeded from the user's *current* computed stage on first read (not 0), so
  // upgrading an existing local session doesn't retroactively "celebrate"
  // stages the user already reached before this feature existed.
  const [lastSeenStageIndex, setLastSeenStageIndex] = useState<number>(() => {
    const saved = readSavedState();
    if (typeof saved?.lastSeenStageIndex === 'number') return saved.lastSeenStageIndex;
    const seedProfile = saved?.profile ? { ...defaultProfile, ...saved.profile } : defaultProfile;
    return getStageIndex(seedProfile, saved?.reflectionCount ?? 0);
  });
  const [startedAt, setStartedAt] = useState<string | null>(() => readSavedState()?.startedAt ?? null);

  // Save to local storage on any change
  useEffect(() => {
    localStorage.setItem(
      'onboarding_state',
      JSON.stringify({
        profile,
        isComplete: isOnboardingComplete,
        reflectionCount,
        reflectionDates,
        recentlyViewed,
        savedIds,
        dismissedIds,
        notificationPrefs,
        reduceMotionOverride,
        hasSeenTour,
        lastSeenStageIndex,
        startedAt,
      })
    );
  }, [
    profile, isOnboardingComplete, reflectionCount, reflectionDates, recentlyViewed,
    savedIds, dismissedIds, notificationPrefs, reduceMotionOverride, hasSeenTour, lastSeenStageIndex, startedAt,
  ]);

  const updateProfile = (data: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  // Called from WelcomePage once the user has a real backend account —
  // userId is the actual /api/auth id, not a locally-generated one.
  const startOnboarding = (name: string, userId: string) => {
    setProfile((prev) => ({ ...prev, userId, name }));
    setStartedAt((prev) => prev ?? new Date().toISOString());
    return userId;
  };

  const completeOnboarding = (profileSummary: string) => {
    setProfile((prev) => ({ ...prev, profileSummary }));
    setIsOnboardingComplete(true);
  };

  // Every reflection logged is a data point the curator uses to re-assess
  // the user's stage, rather than a plain journal entry going nowhere. Also
  // records today's date (deduped) so a streak can be derived from it.
  const logReflection = () => {
    setReflectionCount((prev) => prev + 1);
    setReflectionDates((prev) => {
      const today = toLocalDateKey(new Date());
      return prev.includes(today) ? prev : [...prev, today];
    });
  };

  // Tracks what the user actually opens, most-recent first, so "Recent" on
  // the dashboard means something instead of just being more padding.
  const logView = (id: string) => {
    setRecentlyViewed((prev) => [id, ...prev.filter((existing) => existing !== id)].slice(0, MAX_RECENTLY_VIEWED));
  };

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  };

  // "Not interested" — filtered out of feeds going forward, distinct from
  // just not clicking on something.
  const dismissItem = (id: string) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const updateNotificationPrefs = (data: Partial<NotificationPrefs>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...data }));
  };

  const markTourSeen = () => setHasSeenTour(true);

  // Wipes everything local to this browser: profile, reflections, saves,
  // preferences. Used by the "Clear my data" settings action.
  const resetAll = () => {
    localStorage.removeItem('onboarding_state');
    setProfile(defaultProfile);
    setIsOnboardingComplete(false);
    setReflectionCount(0);
    setReflectionDates([]);
    setRecentlyViewed([]);
    setSavedIds([]);
    setDismissedIds([]);
    setNotificationPrefs(defaultNotificationPrefs);
    setReduceMotionOverride(false);
    setHasSeenTour(false);
    setLastSeenStageIndex(0);
    setStartedAt(null);
  };

  return (
    <OnboardingContext.Provider
      value={{
        profile,
        updateProfile,
        startOnboarding,
        completeOnboarding,
        isOnboardingComplete,
        reflectionCount,
        reflectionStreak: getReflectionStreak(reflectionDates),
        logReflection,
        recentlyViewed,
        logView,
        savedIds,
        toggleSaved,
        dismissedIds,
        dismissItem,
        notificationPrefs,
        updateNotificationPrefs,
        reduceMotionOverride,
        setReduceMotionOverride,
        hasSeenTour,
        markTourSeen,
        lastSeenStageIndex,
        setLastSeenStageIndex,
        startedAt,
        resetAll,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
