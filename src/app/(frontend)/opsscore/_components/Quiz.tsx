'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/lib/icons';
import { captureAttribution } from '@/lib/opsscore/attribution';
import { INSTRUMENT_VERSION, productPath } from '@/lib/opsscore/config';
import { AREA_FEEDBACK, PROFILE_COPY, QUIZ_COPY, SECTION_FACTS } from '@/lib/opsscore/copy';
import {
  SECTION_LABELS,
  buildSteps,
  closesSection,
  progressSections,
  shownAreas,
  stepKey,
  type SectionId,
  type Step,
} from '@/lib/opsscore/flow';
import {
  PROFILE_OPTIONS,
  WEBSITE_MAX,
  isProfileAnswered,
  isProfileOptional,
  sanitizeProfile,
  type Profile,
  type ProfileField,
} from '@/lib/opsscore/profile';
import {
  AREAS,
  AREA_LABELS,
  QUESTION_BY_ID,
  SCALE_OPTIONS,
  promptFor,
  type AreaId,
  type Option,
} from '@/lib/opsscore/questions';
import { areaScore, bandFor, isAnswered, isAreaSkipped, sanitizeAnswers, type Answers } from '@/lib/opsscore/scoring';
import { track } from '@/lib/opsscore/track';
import { AnimatedCount } from '../../_components/ui/AnimatedCount';
import { OctagonMark } from '../../_components/ui/OctagonMark';
import { ScoreBar } from './ScoreBar';
import { SCENE_PANEL_GRID } from './scene-engine';
import { ScoringConsole } from './ScoringConsole';
import { SectionScene } from './SectionScene';

import { Meta } from '../../_components/ui/Meta';
const STORAGE_KEY = `opsscore.quiz.v${INSTRUMENT_VERSION}`;
const LAST_RESULT_KEY = 'opsscore.lastResult';
const ADVANCE_DELAY_MS = 250;
/** The scoring console stays up this long, so its lines can play out on fast connections. */
const CONSOLE_MIN_MS = 1600;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

type Screen = 'loading' | 'intro' | 'resume' | 'step' | 'finishing' | 'error';
type Saved = { sessionId: string | null; answers: Answers; profile: Profile; step: string };

// localStorage can throw (private mode, blocked storage); the quiz still works without it.
function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function createSession(): Promise<string | null> {
  const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
  try {
    const res = await fetch('/api/opsscore/sessions', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ attribution: { referrer } }),
    });
    const body = await res.json().catch(() => ({}));
    return res.ok && body.ok ? (body.id as string) : null;
  } catch {
    return null;
  }
}

const firstName = (name?: string) => (name ?? '').trim().split(/\s+/)[0] ?? '';

const optionsFor = (step: Step): Option[] | null =>
  step.kind === 'question'
    ? QUESTION_BY_ID[step.id].options
    : step.kind === 'profile'
      ? (PROFILE_OPTIONS[step.field] ?? null)
      : null;

function isStepDone(step: Step, answers: Answers, profile: Profile) {
  if (step.kind === 'question') return isAnswered(QUESTION_BY_ID[step.id], answers[step.id]);
  if (step.kind === 'profile') return isProfileOptional(step.field) || isProfileAnswered(step.field, profile);
  return true;
}

function profilePrompt(field: ProfileField, profile: Profile) {
  const brand = profile.brand?.trim() || undefined;
  switch (field) {
    case 'name':
      return PROFILE_COPY.name.prompt;
    case 'brand':
      return PROFILE_COPY.brand.prompt;
    case 'industry':
      return PROFILE_COPY.industry.prompt(brand);
    case 'revenue':
      return PROFILE_COPY.revenue.prompt(brand);
    case 'employees':
      return PROFILE_COPY.employees.prompt(brand);
    case 'website':
      return PROFILE_COPY.website.prompt(brand);
  }
}

export function Quiz() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('loading');
  const [answers, setAnswers] = useState<Answers>({});
  const [profile, setProfile] = useState<Profile>({});
  const [current, setCurrent] = useState('');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Refs for timers, animations, and async calls that must see the latest values.
  const answersRef = useRef(answers);
  const profileRef = useRef(profile);
  const currentRef = useRef(current);
  const sessionIdRef = useRef<string | null>(null);
  const sessionPromise = useRef<Promise<string | null> | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const exitAnimation = useRef<Animation | null>(null);
  const transitioning = useRef(false);
  const unsaved = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const steps = useMemo(() => buildSteps(answers), [answers]);
  const index = steps.findIndex((s) => stepKey(s) === current);
  const step: Step | undefined = steps[index];
  const sections = useMemo(() => progressSections(), []);

  // Restore saved progress once. Ads may link here directly, so attribution is captured here too.
  useEffect(() => {
    captureAttribution();
    const saved = readStorage<Saved>(STORAGE_KEY);
    setLastResult(readStorage<string>(LAST_RESULT_KEY));
    const savedAnswers = sanitizeAnswers(saved?.answers);
    const savedProfile = sanitizeProfile(saved?.profile);
    if (saved && (Object.keys(savedAnswers).length || Object.keys(savedProfile).length)) {
      sessionIdRef.current = saved.sessionId;
      answersRef.current = savedAnswers;
      profileRef.current = savedProfile;
      setAnswers(savedAnswers);
      setProfile(savedProfile);
      setCurrent(saved.step);
      setScreen('resume');
    } else {
      setScreen('intro');
    }
  }, []);

  // Local autosave on every change while answering.
  useEffect(() => {
    if (screen !== 'step') return;
    writeStorage(STORAGE_KEY, { sessionId: sessionIdRef.current, answers, profile, step: current } satisfies Saved);
  }, [screen, answers, profile, current]);

  // Enter: slide the new screen in and stagger its options; focus the input or the heading.
  useEffect(() => {
    const panel = panelRef.current;
    exitAnimation.current?.cancel();
    exitAnimation.current = null;
    if (panel && !prefersReducedMotion()) {
      panel.animate(
        [
          { opacity: 0, transform: `translateX(${direction * 24}px)` },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 180, easing: EASE_OUT },
      );
      panel.querySelectorAll<HTMLElement>('[data-option]').forEach((option, i) => {
        option.animate(
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 180, delay: 40 + i * 25, easing: EASE_OUT, fill: 'backwards' },
        );
      });
    }
    const input = panel?.querySelector<HTMLInputElement>('input[data-autofocus]');
    if (input) input.focus({ preventScroll: true });
    else headingRef.current?.focus({ preventScroll: true });
    // Direction is set together with the step; animating on it alone would replay the slide.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, screen]);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const ensureSession = useCallback((): Promise<string | null> => {
    if (sessionIdRef.current) return Promise.resolve(sessionIdRef.current);
    if (!sessionPromise.current) {
      sessionPromise.current = createSession().then((id) => {
        sessionIdRef.current = id;
        if (!id) sessionPromise.current = null;
        return id;
      });
    }
    return sessionPromise.current;
  }, []);

  /** Silent server save of answers and profile. Failed saves are retried at the next section or on tab hide. */
  const save = useCallback(
    async (keepalive = false) => {
      const id = keepalive ? sessionIdRef.current : await ensureSession();
      if (!id) return;
      unsaved.current = false;
      try {
        const res = await fetch(`/api/opsscore/sessions/${id}`, {
          method: 'PUT',
          headers: JSON_HEADERS,
          body: JSON.stringify({ answers: answersRef.current, profile: profileRef.current }),
          keepalive,
        });
        if (!res.ok) unsaved.current = true;
      } catch {
        unsaved.current = true;
      }
    },
    [ensureSession],
  );

  // Leaving mid-section (tab switch, app switch, close) still saves what was answered.
  useEffect(() => {
    const flush = () => {
      if (unsaved.current) void save(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [save]);

  /** Exit: slide the current screen out, then apply the change; the enter effect takes over. */
  const transition = useCallback(async (dir: 1 | -1, apply: () => void) => {
    if (transitioning.current) return;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    const panel = panelRef.current;
    if (panel && !prefersReducedMotion()) {
      transitioning.current = true;
      const exit = panel.animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: `translateX(${-dir * 24}px)` },
        ],
        { duration: 110, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
      );
      exitAnimation.current = exit;
      await exit.finished.catch(() => undefined);
      transitioning.current = false;
    }
    setDirection(dir);
    apply();
    // If nothing re-rendered, never leave the panel hidden.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        exitAnimation.current?.cancel();
        exitAnimation.current = null;
      }),
    );
  }, []);

  const finish = useCallback(async () => {
    setDirection(1);
    setScreen('finishing');
    const minVisible = new Promise<void>((resolve) =>
      window.setTimeout(resolve, prefersReducedMotion() ? 0 : CONSOLE_MIN_MS),
    );
    const id = await ensureSession();
    if (id) {
      try {
        const [res] = await Promise.all([
          fetch(`/api/opsscore/sessions/${id}/complete`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ answers: answersRef.current, profile: profileRef.current }),
          }),
          minVisible,
        ]);
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.ok) {
          unsaved.current = false;
          removeStorage(STORAGE_KEY);
          writeStorage(LAST_RESULT_KEY, id);
          router.push(productPath(`/hasil/${id}`));
          return;
        }
        if (res.status === 422 && Array.isArray(body.missing) && body.missing.length) {
          setDirection(-1);
          setCurrent(`q:${body.missing[0]}`);
          setScreen('step');
          return;
        }
        if (res.status === 404) {
          // Session is gone (e.g. cleaned up); the retry starts a new one with the same answers.
          sessionIdRef.current = null;
          sessionPromise.current = null;
        }
      } catch {}
    }
    setScreen('error');
  }, [ensureSession, router]);

  const goNext = useCallback(() => {
    const list = buildSteps(answersRef.current);
    const i = list.findIndex((s) => stepKey(s) === currentRef.current);
    const here = list[i];
    if (!here || !isStepDone(here, answersRef.current, profileRef.current)) return;
    const next = list[i + 1];
    if (!next) {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      void finish();
      return;
    }
    if (closesSection(list, i)) void save();
    if (next.kind === 'feedback') {
      // Events stay per scoring area (brief §8), even though the quiz shows them per section.
      // The index follows the order areas are shown in, so it keeps rising through a funnel.
      const shown = shownAreas(list);
      for (const area of next.areas) track('assessment_area_done', { area, index: shown.indexOf(area) + 1 });
    }
    void transition(1, () => setCurrent(stepKey(next)));
  }, [finish, save, transition]);

  const goBack = useCallback(() => {
    const list = buildSteps(answersRef.current);
    const i = list.findIndex((s) => stepKey(s) === currentRef.current);
    for (let j = i - 1; j >= 0; j--) {
      if (list[j].kind !== 'feedback') {
        const key = stepKey(list[j]);
        void transition(-1, () => setCurrent(key));
        return;
      }
    }
    void transition(-1, () => setScreen('intro'));
  }, [transition]);

  const choose = useCallback(
    (target: Step, optionId: string) => {
      if (transitioning.current) return;
      if ('vibrate' in navigator) navigator.vibrate(8);
      unsaved.current = true;

      if (target.kind === 'profile') {
        const updated = { ...profileRef.current, [target.field]: optionId };
        profileRef.current = updated;
        setProfile(updated);
      } else if (target.kind === 'question') {
        const q = QUESTION_BY_ID[target.id];
        if (q.type === 'multi') {
          const picked = Array.isArray(answersRef.current[q.id]) ? (answersRef.current[q.id] as string[]) : [];
          let next: string[];
          if (picked.includes(optionId)) next = picked.filter((id) => id !== optionId);
          else if (q.exclusive?.includes(optionId)) next = [optionId];
          else next = [...picked.filter((id) => !q.exclusive?.includes(id)), optionId];
          const updated = { ...answersRef.current };
          if (next.length) updated[q.id] = next;
          else delete updated[q.id];
          answersRef.current = updated;
          setAnswers(updated);
          return;
        }
        const updated = { ...answersRef.current, [q.id]: optionId };
        answersRef.current = updated;
        setAnswers(updated);
        if (q.type === 'volume') return;
      } else {
        return;
      }

      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(goNext, ADVANCE_DELAY_MS);
    },
    [goNext],
  );

  const typeProfile = useCallback((field: ProfileField, value: string) => {
    unsaved.current = true;
    const updated = { ...profileRef.current, [field]: value };
    profileRef.current = updated;
    setProfile(updated);
  }, []);

  const start = useCallback(() => {
    void transition(1, () => {
      removeStorage(STORAGE_KEY);
      sessionIdRef.current = null;
      sessionPromise.current = null;
      answersRef.current = {};
      profileRef.current = {};
      setAnswers({});
      setProfile({});
      setCurrent(stepKey(buildSteps({})[0]));
      setScreen('step');
      void ensureSession().then((id) => track('assessment_start', { session_id: id }));
    });
  }, [ensureSession, transition]);

  // Intro after "Kembali" on the first screen: keep what was already filled in.
  const begin = useCallback(() => {
    if (!Object.keys(answersRef.current).length && !Object.keys(sanitizeProfile(profileRef.current)).length) {
      start();
      return;
    }
    void transition(1, () => {
      setCurrent(stepKey(buildSteps(answersRef.current)[0]));
      setScreen('step');
    });
  }, [start, transition]);

  const resume = useCallback(() => {
    const list = buildSteps(answersRef.current);
    const valid = list.some((s) => stepKey(s) === currentRef.current);
    void transition(1, () => {
      if (!valid) {
        const firstOpen = list.find((s) => !isStepDone(s, answersRef.current, profileRef.current));
        setCurrent(stepKey(firstOpen ?? list[0]));
      }
      setScreen('step');
    });
  }, [transition]);

  // Keyboard: 1–9 picks an option, Enter continues, Esc goes back. Typing in a field is left alone.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen !== 'step' || !step || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
        return;
      }
      if (e.key === 'Enter' || (step.kind === 'feedback' && e.key === ' ')) {
        e.preventDefault();
        goNext();
        return;
      }
      const options = optionsFor(step);
      const n = Number(e.key);
      if (options && Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault();
        choose(step, options[n - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, step, goBack, goNext, choose]);

  /* ---------------------------------------------------------------- */
  /* Progress                                                          */
  /* ---------------------------------------------------------------- */

  const activeSection: SectionId | null = step
    ? step.section
    : screen === 'finishing'
      ? (sections[sections.length - 1]?.id ?? null)
      : null;
  const activeIndex = activeSection ? sections.findIndex((s) => s.id === activeSection) : -1;
  const showProgress = (screen === 'step' || screen === 'finishing') && activeIndex >= 0;
  const inSection = step ? steps.filter((s) => s.section === step.section && s.kind !== 'feedback') : [];
  const doneInSection =
    step?.kind === 'feedback' ? inSection.length : inSection.findIndex((s) => stepKey(s) === current);
  const activeFill =
    screen === 'finishing' ? 1 : inSection.length ? Math.max(0.08, doneInSection / inSection.length) : 0.08;
  // About seven seconds per remaining screen, rounded up to whole minutes.
  const remainingScreens = step ? steps.slice(index).filter((s) => s.kind !== 'feedback').length : 0;
  const remainingMinutes = Math.ceil((remainingScreens * 7) / 60);

  /* ---------------------------------------------------------------- */
  /* Screens                                                           */
  /* ---------------------------------------------------------------- */

  let content: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (screen === 'intro') {
    content = (
      <div className="flex flex-col">
        <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
          <Meta parts={QUIZ_COPY.introMarker} />
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 text-[26px] sm:text-[44px] leading-[1.1] tracking-[-0.025em] font-bold text-balance outline-none"
        >
          {QUIZ_COPY.instruction}
        </h1>
        <ScaleStrip />
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <PrimaryButton onClick={begin}>{QUIZ_COPY.start}</PrimaryButton>
          {lastResult && (
            <a
              href={productPath(`/hasil/${lastResult}`)}
              className="self-center sm:self-auto text-[14px] font-semibold text-mist-600 underline underline-offset-4 decoration-mist-400 hover:text-ink"
            >
              {QUIZ_COPY.lastResult}
            </a>
          )}
        </div>
      </div>
    );
  } else if (screen === 'resume') {
    const saved = steps.find((s) => stepKey(s) === current);
    content = (
      <div className="flex flex-col">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[30px] sm:text-[44px] leading-[1.08] tracking-[-0.025em] font-bold text-balance outline-none"
        >
          {QUIZ_COPY.resumeTitle}
        </h1>
        <p className="mt-4 text-[17px] leading-[1.55] text-mist-600">{QUIZ_COPY.resumeBody}</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <PrimaryButton onClick={resume}>{QUIZ_COPY.resume(SECTION_LABELS[saved?.section ?? 'intro'])}</PrimaryButton>
          <button
            type="button"
            onClick={start}
            className="h-[52px] px-[22px] rounded-md bg-transparent text-ink border border-mist-400 text-[15px] font-semibold inline-flex items-center justify-center hover:bg-ink/[0.04] transition-colors"
          >
            {QUIZ_COPY.restart}
          </button>
        </div>
      </div>
    );
  } else if (screen === 'step' && step) {
    const chip = (
      <SectionChip
        number={activeIndex + 1}
        label={SECTION_LABELS[step.section]}
        position={Math.min(doneInSection + 1, inSection.length)}
        total={inSection.length}
        complete={step.kind === 'feedback'}
      />
    );
    const nextSection = steps.slice(index + 1).find((s) => s.kind !== 'feedback')?.section;
    const nextLabel = nextSection ? QUIZ_COPY.nextUp(SECTION_LABELS[nextSection]) : QUIZ_COPY.seeResult;

    if (step.kind === 'feedback') {
      content = (
        <FeedbackScreen
          chip={chip}
          section={step.section}
          title={SECTION_LABELS[step.section]}
          scores={step.areas.map((area) => ({ area, score: areaScore(area, answers) ?? 0 }))}
          fact={SECTION_FACTS[step.section]}
          headingRef={headingRef}
          onNext={goNext}
        />
      );
    } else if (step.kind === 'profile' && !PROFILE_OPTIONS[step.field]) {
      const field = step.field;
      content = (
        <TextScreen
          chip={chip}
          field={field}
          value={profile[field] ?? ''}
          prompt={profilePrompt(field, profile)}
          hint={field === 'brand' ? PROFILE_COPY.brand.hint : field === 'website' ? PROFILE_COPY.website.hint : undefined}
          greeting={field === 'brand' && profile.name ? PROFILE_COPY.brand.greeting(firstName(profile.name)) : undefined}
          headingRef={headingRef}
          onChange={(value) => typeProfile(field, value)}
          onNext={goNext}
        />
      );
    } else if (step.kind === 'profile') {
      const value = profile[step.field];
      const hints: Partial<Record<ProfileField, string>> = {
        industry: PROFILE_COPY.industry.hint,
        revenue: PROFILE_COPY.revenue.hint,
        employees: PROFILE_COPY.employees.hint,
      };
      content = (
        <ChoiceScreen
          chip={chip}
          id={stepKey(step)}
          prompt={profilePrompt(step.field, profile)}
          hint={hints[step.field]}
          options={PROFILE_OPTIONS[step.field]!}
          layout="grid"
          isSelected={(id) => value === id}
          multi={false}
          headingRef={headingRef}
          onChoose={(id) => choose(step, id)}
        />
      );
    } else {
      const q = QUESTION_BY_ID[step.id];
      const answer = answers[q.id];
      const multi = q.type === 'multi';
      content = (
        <ChoiceScreen
          chip={chip}
          id={stepKey(step)}
          prompt={promptFor(q, profile.industry)}
          hint={multi ? `${q.hint} ${QUIZ_COPY.multiHint}` : q.hint}
          options={q.options}
          layout="list"
          isSelected={(id) => (multi ? Array.isArray(answer) && answer.includes(id) : answer === id)}
          multi={multi}
          headingRef={headingRef}
          onChoose={(id) => choose(step, id)}
        />
      );
    }

    const needsNext =
      step.kind === 'feedback' ||
      (step.kind === 'profile' && !PROFILE_OPTIONS[step.field]) ||
      (step.kind === 'question' && ['multi', 'volume'].includes(QUESTION_BY_ID[step.id].type));
    footer = (
      <>
        <BackButton onClick={goBack} />
        <span className="min-w-0 text-center text-[12px] leading-tight text-mist-600 tabular">
          {/* Score screens name what comes next here; the space under their card holds a quick fact. */}
          {step.kind === 'feedback' ? (
            nextLabel
          ) : (
            <>
              {QUIZ_COPY.remaining(remainingMinutes)}
              {step.kind === 'question' && <span className="max-sm:hidden">, {QUIZ_COPY.keyboardHint}</span>}
            </>
          )}
        </span>
        <NextButton
          ready={isStepDone(step, answers, profile)}
          quiet={!needsNext}
          onClick={goNext}
        />
      </>
    );
  } else if (screen === 'finishing') {
    const scoredAreas = AREAS.filter((a) => !isAreaSkipped(a.id, answers)).length;
    const answered = steps.filter((s) => s.kind === 'question').length;
    content = <ScoringConsole answered={answered} areas={scoredAreas} />;
  } else if (screen === 'error') {
    content = (
      <div className="flex flex-col" role="alert">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[28px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-bold outline-none"
        >
          {QUIZ_COPY.errorTitle}
        </h1>
        <p className="mt-4 text-[17px] leading-[1.55] text-mist-600">{QUIZ_COPY.errorBody}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <PrimaryButton onClick={() => void finish()}>{QUIZ_COPY.retry}</PrimaryButton>
          <BackButton
            onClick={() => {
              setScreen('step');
              goBack();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-paper-100 text-ink overflow-hidden">
      {/* Backdrop: the site's grid, a soft glow, and the octagon motif — texture without content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 bg-cover bg-top"
        style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[340px] rounded-full bg-electric/[0.08] blur-3xl"
      />
      <div aria-hidden className="pointer-events-none absolute -right-28 bottom-16 text-mist-400 opacity-[0.12]">
        <OctagonMark size={340} strokeWidth={1} className="animate-octagon-drift" />
      </div>

      <header className="relative z-10 border-b border-paper-200 bg-paper-100/80 backdrop-blur-md">
        <div className="max-w-[640px] mx-auto px-5 sm:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            <a href={productPath()} className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/coderoach_logo.svg" alt="" className="h-6 w-auto" />
              <span className="text-[14px] font-semibold tracking-[-0.01em]">{QUIZ_COPY.brand}</span>
            </a>
            {showProgress && (
              <span
                key={activeIndex}
                className="ops-fade-up font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular"
              >
                {QUIZ_COPY.sectionCount(activeIndex + 1, sections.length)}
              </span>
            )}
          </div>
          {showProgress && (
            <ol
              aria-label={QUIZ_COPY.progressLabel}
              className="list-none p-0 m-0 pb-3 grid gap-1"
              style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}
            >
              {sections.map((section, i) => {
                const done = i < activeIndex;
                const fill = done ? 1 : i === activeIndex ? activeFill : 0;
                return (
                  <li key={section.id} aria-current={i === activeIndex ? 'step' : undefined} className="min-w-0">
                    <span
                      key={`${section.id}-${done ? 'done' : 'open'}`}
                      aria-hidden
                      className={`block h-1 rounded-full bg-paper-200 overflow-hidden ${
                        done && i === activeIndex - 1 ? 'ops-pulse' : ''
                      }`}
                    >
                      <span
                        className={`block h-full rounded-full origin-left transition-transform duration-300 ease-out ${
                          done ? 'bg-ink' : 'bg-electric'
                        }`}
                        style={{ transform: `scaleX(${fill})` }}
                      />
                    </span>
                    <span
                      className={`max-md:sr-only block mt-1.5 text-[10px] leading-tight truncate transition-colors duration-200 ${
                        i === activeIndex ? 'text-ink font-semibold' : 'text-mist-600'
                      }`}
                    >
                      {section.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex w-full max-w-[640px] mx-auto px-5 sm:px-8">
        {/* Content sits in the middle of the free space, so tall phones do not end in a blank strip. */}
        <div ref={panelRef} className="flex-1 flex flex-col justify-center py-2 sm:py-10">
          {content}
        </div>
      </main>

      {footer && (
        <footer className="relative z-10 border-t border-paper-200 bg-paper-100/85 backdrop-blur-md">
          <div className="max-w-[640px] mx-auto px-5 sm:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}

/** Section number and name, with one dot per screen in the section. */
function SectionChip({
  number,
  label,
  position,
  total,
  complete,
}: {
  number: number;
  label: string;
  position: number;
  total: number;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 h-7 pl-1 pr-2.5 rounded-full bg-paper-50/90 border border-paper-200 font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular min-w-0">
        <span className="h-5 min-w-5 px-1 rounded-full bg-ink text-paper grid place-items-center text-[10px]">
          {String(number).padStart(2, '0')}
        </span>
        <span className="truncate">{label}</span>
      </span>
      <span
        className="flex items-center gap-1 shrink-0"
        role="img"
        aria-label={QUIZ_COPY.questionPosition(complete ? total : position, total)}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              complete || i < position - 1
                ? 'w-1.5 bg-ink'
                : i === position - 1
                  ? 'w-4 bg-electric'
                  : 'w-1.5 bg-paper-200'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

/** Example or analogy under a question. */
function Hint({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex gap-2.5 items-start rounded-lg bg-electric/[0.06] border border-electric/15 px-3 py-1.5 sm:py-2 ${className}`}>
      <BulbIcon />
      <p className="m-0 text-[13px] leading-[1.45] text-shadow-700">{children}</p>
    </div>
  );
}

function BulbIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[1px] shrink-0 text-electric"
      aria-hidden
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.74V16h8v-1.26A7 7 0 0 0 12 2z" />
    </svg>
  );
}

/** The one idea behind most questions, shown once before starting: where does the data live. */
function ScaleStrip() {
  return (
    <div className="mt-6 rounded-xl border border-paper-200 bg-paper-50/80 backdrop-blur p-4 sm:p-5">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">{QUIZ_COPY.scaleTitle}</p>
      <p className="m-0 mt-1.5 text-[17px] font-semibold tracking-[-0.01em]">{QUIZ_COPY.scaleQuestion}</p>
      <ol className="list-none p-0 m-0 mt-4 relative grid grid-cols-5 gap-1">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[18px] h-px bg-paper-200" />
        {SCALE_OPTIONS.map((option) => (
          <li key={option.id} className="relative flex flex-col items-center gap-1.5 text-center min-w-0">
            <span className="w-9 h-9 rounded-lg grid place-items-center bg-paper-100 border border-paper-200 text-shadow-700">
              <Icon name={option.icon!} size={18} />
            </span>
            <span className="text-[10.5px] leading-tight text-mist-600 break-words">{option.short}</span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-3 text-[13px] leading-[1.45] text-mist-600">{QUIZ_COPY.scaleNote}</p>
    </div>
  );
}

function TextScreen({
  chip,
  field,
  value,
  prompt,
  hint,
  greeting,
  headingRef,
  onChange,
  onNext,
}: {
  chip: React.ReactNode;
  field: ProfileField;
  value: string;
  prompt: string;
  hint?: string;
  greeting?: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const inputId = `profile-${field}`;
  const text = {
    name: { placeholder: PROFILE_COPY.name.placeholder, autoComplete: 'name', capitalize: 'words', max: 80 },
    brand: { placeholder: PROFILE_COPY.brand.placeholder, autoComplete: 'organization', capitalize: 'words', max: 120 },
    website: { placeholder: PROFILE_COPY.website.placeholder, autoComplete: 'url', capitalize: 'none', max: WEBSITE_MAX },
  }[field as 'name' | 'brand' | 'website'];

  return (
    <>
      {chip}
      {greeting && (
        <p
          className="ops-fade-up mt-6 mb-0 text-[20px] sm:text-[24px] font-semibold tracking-[-0.01em] text-electric"
          style={{ '--ops-delay': '80ms' } as CSSProperties}
        >
          {greeting}
        </p>
      )}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`${greeting ? 'mt-1' : 'mt-6'} text-[28px] sm:text-[38px] leading-[1.12] tracking-[-0.025em] font-bold text-balance outline-none`}
      >
        <label htmlFor={inputId}>{prompt}</label>
      </h1>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {/* Conversational underline input, as in the site's brief form. */}
        <input
          id={inputId}
          data-autofocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Implicit form submission is not dependable across keyboards; handle Enter directly.
            if (e.key === 'Enter') {
              e.preventDefault();
              onNext();
            }
          }}
          placeholder={text.placeholder}
          autoComplete={text.autoComplete}
          autoCapitalize={text.capitalize}
          inputMode={field === 'website' ? 'url' : 'text'}
          enterKeyHint="next"
          maxLength={text.max}
          className="block w-full bg-transparent border-0 border-b-2 border-paper-200 focus:border-electric px-0 py-2 text-[24px] sm:text-[30px] font-semibold tracking-[-0.015em] text-ink placeholder:text-mist-400 caret-electric outline-none transition-colors duration-200"
        />
      </form>
      {hint && <Hint className="mt-5">{hint}</Hint>}
    </>
  );
}

function ChoiceScreen({
  chip,
  id,
  prompt,
  hint,
  options,
  layout,
  isSelected,
  multi,
  headingRef,
  onChoose,
}: {
  chip: React.ReactNode;
  id: string;
  prompt: string;
  hint?: string;
  options: Option[];
  layout: 'list' | 'grid';
  isSelected: (id: string) => boolean;
  multi: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChoose: (id: string) => void;
}) {
  const headingId = `h-${id.replace(':', '-')}`;
  return (
    <>
      {chip}
      <h1
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 sm:mt-4 text-[21px] sm:text-[30px] leading-[1.22] tracking-[-0.02em] font-bold text-balance outline-none"
      >
        {prompt}
      </h1>
      {hint && <Hint className="mt-2.5 sm:mt-3">{hint}</Hint>}
      <div
        role={multi ? 'group' : 'radiogroup'}
        aria-labelledby={headingId}
        className={`mt-3 sm:mt-6 ${layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1 sm:gap-2'}`}
      >
        {options.map((option, i) => {
          const selected = isSelected(option.id);
          return (
            <button
              key={option.id}
              data-option
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => onChoose(option.id)}
              className={`group relative w-full min-h-[44px] px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2.5 transition-[border-color,background-color,box-shadow,transform] duration-150 active:scale-[0.98] ${
                selected
                  ? 'border-electric bg-electric/[0.07] shadow-[0_0_0_3px_rgba(44,112,254,0.14)]'
                  : 'border-paper-200 bg-paper-50/90 shadow-[0_1px_2px_rgba(8,9,10,0.04)] hover:border-mist-400 hover:-translate-y-px hover:shadow-[0_8px_18px_-12px_rgba(8,9,10,0.3)]'
              }`}
            >
              {option.icon ? (
                <span
                  data-icon={option.icon}
                  className={`ops-icon ${
                    selected ? 'is-on text-paper bg-electric border-electric' : 'text-shadow-700 border-paper-200 bg-paper-100'
                  } w-8 h-8 rounded-md grid place-items-center shrink-0 border transition-colors duration-150`}
                >
                  <Icon name={option.icon} size={18} />
                </span>
              ) : layout === 'list' ? (
                <span
                  aria-hidden
                  className={`w-7 h-7 shrink-0 grid place-items-center border font-mono text-[12px] tabular transition-colors duration-150 ${
                    multi ? 'rounded-md' : 'rounded-full'
                  } ${selected ? 'border-electric bg-electric text-paper' : 'border-paper-200 bg-paper-100 text-mist-600'}`}
                >
                  {selected && multi ? <CheckIcon size={12} /> : i + 1}
                </span>
              ) : null}
              <span className="flex-1 min-w-0 text-[15px] leading-[1.3] font-medium">{option.label}</span>
              {selected && !multi && (
                <span className="ops-pop w-5 h-5 shrink-0 rounded-full bg-electric text-paper grid place-items-center" aria-hidden>
                  <CheckIcon size={11} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FeedbackScreen({
  chip,
  section,
  title,
  scores,
  fact,
  headingRef,
  onNext,
}: {
  chip: React.ReactNode;
  section: SectionId;
  title: string;
  scores: Array<{ area: AreaId; score: number }>;
  fact?: { text: string; source: string };
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
}) {
  const [only] = scores;
  const sceneScores = Object.fromEntries(scores.map(({ area, score }) => [area, score]));
  return (
    // Tapping anywhere continues (brief §7); the footer buttons stay for keyboard and screen readers.
    <div className="flex flex-col cursor-pointer" onClick={onNext}>
      {chip}
      <div className="mt-3 sm:mt-5 relative overflow-hidden rounded-2xl bg-ink text-paper pb-4 sm:pb-7 shadow-[0_30px_60px_-30px_rgba(8,9,10,0.65)]">
        {/* The scene is the card's cover: its own lit panel, with the section's quick fact as its caption. */}
        <div
          className="relative px-5 sm:px-8 pt-3 sm:pt-5 pb-3 sm:pb-4 bg-shadow-900 border-b border-shadow-700"
          style={SCENE_PANEL_GRID}
        >
          <SectionScene section={section} scores={sceneScores} className="block w-full h-auto sm:max-h-[132px]" />
          {fact && (
            <p
              className="ops-fade-up mt-2 mb-0 flex items-start gap-2 text-[12px] sm:text-[14px] leading-[1.4] text-paper/80"
              style={{ '--ops-delay': '700ms' } as CSSProperties}
            >
              <BulbIcon />
              <span>
                {fact.text}{' '}
                <span className="font-mono text-[10px] sm:text-[11px] text-mist-500 whitespace-nowrap">{fact.source}</span>
              </span>
            </p>
          )}
        </div>
        <div className="px-5 sm:px-8">
          {/* The chip above already names a combined section, so its card gives the room to the area rows. */}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className={
              scores.length === 1
                ? 'mt-3 sm:mt-5 text-[24px] sm:text-[36px] leading-[1.08] tracking-[-0.025em] font-bold outline-none'
                : 'sr-only'
            }
          >
            {title}
          </h1>
          {scores.length === 1 ? (
            <>
              <div className="mt-2 sm:mt-4 flex items-baseline gap-2">
                <span className="text-[56px] sm:text-[80px] font-bold leading-none tracking-[-0.04em] tabular">
                  <AnimatedCount value={String(only.score)} duration={700} />
                </span>
                <span className="text-[15px] text-mist-500 tabular">/100</span>
              </div>
              <ScoreBar value={only.score} className="mt-3 sm:mt-4" animate tone="dark" />
              <p
                className="ops-fade-up mt-3 sm:mt-5 mb-0 text-[15px] sm:text-[18px] leading-[1.45] text-paper/80 text-pretty"
                style={{ '--ops-delay': '450ms' } as CSSProperties}
              >
                {AREA_FEEDBACK[only.area][bandFor(only.score)]}
              </p>
            </>
          ) : (
            // Combined section: one row per scoring area, revealed one after the other.
            <ul className="list-none p-0 m-0 mt-2.5 sm:mt-4 flex flex-col divide-y divide-shadow-700">
              {scores.map(({ area, score }, i) => (
                <li key={area} className="py-2.5 sm:py-3 first:pt-1 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="m-0 text-[15px] sm:text-[18px] font-semibold text-paper/90">{AREA_LABELS[area]}</h2>
                    <span className="shrink-0 text-[28px] sm:text-[44px] font-bold leading-none tracking-[-0.03em] tabular">
                      <AnimatedCount value={String(score)} duration={700} />
                      <span className="ml-1 text-[12px] font-normal tracking-normal text-mist-500">/100</span>
                    </span>
                  </div>
                  <ScoreBar value={score} className="mt-1.5 sm:mt-2" animate index={i * 4} tone="dark" />
                  <p
                    className="ops-fade-up mt-1.5 sm:mt-2 mb-0 text-[12px] sm:text-[14px] leading-[1.45] text-paper/70 text-pretty"
                    style={{ '--ops-delay': `${450 + i * 250}ms` } as CSSProperties}
                  >
                    {AREA_FEEDBACK[area][bandFor(score)]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#2562E0] active:scale-[0.98] transition-[background-color,transform]"
    >
      {children}
      <Arrow />
    </button>
  );
}

/**
 * Footer "Lanjut". Lights up once the screen has an answer. `quiet` is for screens that already
 * advance on tap; it still helps when coming back to a question that was answered before.
 */
function NextButton({ ready, quiet = false, onClick }: { ready: boolean; quiet?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={!ready}
      className={`h-11 px-4 rounded-md text-[14px] font-semibold inline-flex items-center gap-2 transition-[background-color,color,box-shadow,border-color,transform] duration-200 ${
        !ready
          ? 'bg-paper-200/70 text-mist-500 cursor-not-allowed'
          : quiet
            ? 'bg-paper-50 text-ink border border-paper-200 hover:border-mist-400 active:scale-[0.98]'
            : 'bg-electric text-paper shadow-[0_8px_24px_-10px_rgba(44,112,254,0.7)] hover:bg-[#2562E0] active:scale-[0.98]'
      }`}
    >
      {QUIZ_COPY.next}
      <Arrow />
    </button>
  );
}

function BackButton({ onClick }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 -ml-2 px-2 rounded-md text-[14px] font-semibold text-mist-600 hover:text-ink inline-flex items-center gap-1.5 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5M11 19l-7-7 7-7" />
      </svg>
      {QUIZ_COPY.back}
    </button>
  );
}

function CheckIcon({ size, className = '' }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
