import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface ArchiveEntry {
  fortuneId: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
  dates: string[];
}

interface FortuneSnapshot {
  id: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
}

interface FortuneDrawRow {
  id?: number;
  fortune_id: number;
  drawn_on: string;
  snapshot: Omit<FortuneSnapshot, 'id'>;
}

const ARCHIVE_KEY = 'yaoguang_archive_v2';
const TODAY_KEY = 'yaoguang_today_v2';
const MAX_ATTEMPTS = 3;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveRaw(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage is an optional guest-mode fallback.
  }
}

function rowsToArchive(rows: FortuneDrawRow[]): Record<number, ArchiveEntry> {
  return rows.reduce<Record<number, ArchiveEntry>>((result, row) => {
    const existing = result[row.fortune_id];
    result[row.fortune_id] = {
      fortuneId: row.fortune_id,
      ...row.snapshot,
      dates: existing ? [...new Set([...existing.dates, row.drawn_on])] : [row.drawn_on],
    };
    return result;
  }, {});
}

interface TodayData {
  date: string;
  attemptsUsed: number;
  lastFortuneId: number;
}

export function useFortuneStorage() {
  const { user, isGuest } = useAuth();
  const [archive, setArchive] = useState<Record<number, ArchiveEntry>>({});
  const [attemptsUsed, setUsed] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [totalDraws, setTotalDraws] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const usedRef = useRef(0);

  const loadGuestState = useCallback(() => {
    const savedArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
    const today = loadRaw<TodayData>(TODAY_KEY, { date: '', attemptsUsed: 0, lastFortuneId: -1 });
    const used = today.date === todayStr() ? today.attemptsUsed : 0;
    setArchive(savedArchive);
    setUsed(used);
    setTotalDraws(Object.values(savedArchive).reduce((sum, entry) => sum + entry.dates.length, 0));
    usedRef.current = used;
  }, []);

  useEffect(() => {
    let active = true;
    if (!user || !supabase) {
      loadGuestState();
      return;
    }

    async function loadCloudState() {
      setSyncing(true);
      setError(null);
      const localArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
      const localRows = Object.values(localArchive).flatMap((entry) => entry.dates.map((date) => ({
        user_id: user.id,
        source_key: `legacy-${date}-${entry.fortuneId}`,
        fortune_id: entry.fortuneId,
        drawn_on: date,
        snapshot: {
          hexagramName: entry.hexagramName,
          gradeLabel: entry.gradeLabel,
          gradeColor: entry.gradeColor,
          hexagram: entry.hexagram,
          dailyTip: entry.dailyTip,
        },
      })));

      if (localRows.length > 0) {
        await supabase.from('fortune_draws').upsert(localRows, {
          onConflict: 'user_id,source_key',
          ignoreDuplicates: true,
        });
      }

      const { data, error } = await supabase
        .from('fortune_draws')
        .select('fortune_id, drawn_on, snapshot')
        .order('drawn_at', { ascending: false });

      if (!active) return;
      if (error) {
        loadGuestState();
        setError('云端命册暂时无法读取，请检查网络后重试。');
        setSyncing(false);
        return;
      }

      const rows = (data ?? []) as FortuneDrawRow[];
      const cloudArchive = rowsToArchive(rows);
      const used = rows.filter((row) => row.drawn_on === todayStr()).length;
      setArchive(cloudArchive);
      setUsed(used);
      setTotalDraws(rows.length);
      usedRef.current = used;
      saveRaw(ARCHIVE_KEY, cloudArchive);
      setSyncing(false);
    }

    void loadCloudState();
    return () => { active = false; };
  }, [loadGuestState, user]);

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
  const todayLocked = attemptsLeft <= 0;

  const recordFortune = useCallback(async (fortune: FortuneSnapshot): Promise<boolean> => {
    if (isGuest) {
      if (usedRef.current >= MAX_ATTEMPTS) {
        setError('今日三签已定，可以进入签文册回看收藏。');
        return false;
      }
      const today = todayStr();
      const newUsed = usedRef.current + 1;
      usedRef.current = newUsed;
      setArchive((current) => {
        const existing = current[fortune.id];
        const next = {
          ...current,
          [fortune.id]: {
            fortuneId: fortune.id,
            hexagramName: fortune.hexagramName,
            gradeLabel: fortune.gradeLabel,
            gradeColor: fortune.gradeColor,
            hexagram: fortune.hexagram,
            dailyTip: fortune.dailyTip,
            dates: existing ? [...new Set([...existing.dates, today])] : [today],
          },
        };
        saveRaw(ARCHIVE_KEY, next);
        return next;
      });
      saveRaw(TODAY_KEY, { date: today, attemptsUsed: newUsed, lastFortuneId: fortune.id } satisfies TodayData);
      setUsed(newUsed);
      setTotalDraws((current) => current + 1);
      return true;
    }

    if (!user || !supabase) {
      setError('请先登录命册，或选择游客体验。');
      return false;
    }

    const today = todayStr();
    setError(null);
    const { data, error: insertError } = await supabase.rpc('record_fortune_draw', {
      p_source_key: crypto.randomUUID(),
      p_fortune_id: fortune.id,
      p_snapshot: {
        hexagramName: fortune.hexagramName,
        gradeLabel: fortune.gradeLabel,
        gradeColor: fortune.gradeColor,
        hexagram: fortune.hexagram,
        dailyTip: fortune.dailyTip,
      },
    });

    if (insertError) {
      if (insertError.message.includes('daily_limit_reached')) {
        usedRef.current = MAX_ATTEMPTS;
        setUsed(MAX_ATTEMPTS);
        setError('今日三签已定，可以进入签文册回看收藏。');
      } else {
        setError('这次签文没有保存成功，请稍后再试。');
      }
      return false;
    }

    const savedRow = (Array.isArray(data) ? data[0] : data) as FortuneDrawRow | null;
    const savedDate = savedRow?.drawn_on ?? today;
    const newUsed = usedRef.current + 1;
    usedRef.current = newUsed;

    setArchive((current) => {
      const existing = current[fortune.id];
      const next = {
        ...current,
        [fortune.id]: {
          fortuneId: fortune.id,
          hexagramName: fortune.hexagramName,
          gradeLabel: fortune.gradeLabel,
          gradeColor: fortune.gradeColor,
          hexagram: fortune.hexagram,
          dailyTip: fortune.dailyTip,
          dates: existing ? [...new Set([...existing.dates, savedDate])] : [savedDate],
        },
      };
      saveRaw(ARCHIVE_KEY, next);
      return next;
    });

    saveRaw(TODAY_KEY, { date: today, attemptsUsed: newUsed, lastFortuneId: fortune.id } satisfies TodayData);
    setUsed(newUsed);
    setTotalDraws(current => current + 1);
    return true;
  }, [isGuest, user]);

  return { archive, attemptsLeft, todayLocked, recordFortune, syncing, totalDraws, error };
}
