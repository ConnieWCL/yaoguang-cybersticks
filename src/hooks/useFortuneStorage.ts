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
  const { user } = useAuth();
  const [archive, setArchive] = useState<Record<number, ArchiveEntry>>({});
  const [attemptsUsed, setUsed] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const usedRef = useRef(0);

  const loadGuestState = useCallback(() => {
    const savedArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
    const today = loadRaw<TodayData>(TODAY_KEY, { date: '', attemptsUsed: 0, lastFortuneId: -1 });
    const used = today.date === todayStr() ? today.attemptsUsed : 0;
    setArchive(savedArchive);
    setUsed(used);
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
        setSyncing(false);
        return;
      }

      const rows = (data ?? []) as FortuneDrawRow[];
      const cloudArchive = rowsToArchive(rows);
      const used = rows.filter((row) => row.drawn_on === todayStr()).length;
      setArchive(cloudArchive);
      setUsed(used);
      usedRef.current = used;
      saveRaw(ARCHIVE_KEY, cloudArchive);
      setSyncing(false);
    }

    void loadCloudState();
    return () => { active = false; };
  }, [loadGuestState, user]);

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsUsed);
  const todayLocked = attemptsLeft <= 0;

  const recordFortune = useCallback((fortune: FortuneSnapshot) => {
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

    if (user && supabase) {
      void supabase.from('fortune_draws').insert({
        user_id: user.id,
        source_key: crypto.randomUUID(),
        fortune_id: fortune.id,
        drawn_on: today,
        snapshot: {
          hexagramName: fortune.hexagramName,
          gradeLabel: fortune.gradeLabel,
          gradeColor: fortune.gradeColor,
          hexagram: fortune.hexagram,
          dailyTip: fortune.dailyTip,
        },
      });
    }
  }, [user]);

  return { archive, attemptsLeft, todayLocked, recordFortune, syncing };
}
