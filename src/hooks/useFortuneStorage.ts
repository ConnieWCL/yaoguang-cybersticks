import { useState, useEffect } from 'react';

export interface ArchiveEntry {
  fortuneId: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
  dates: string[];
}

const ARCHIVE_KEY = 'yaoguang_archive_v2';
const TODAY_KEY   = 'yaoguang_today_v2';
const MAX_ATTEMPTS = 3;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function loadRaw<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveRaw(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

interface TodayData { date: string; attemptsUsed: number; lastFortuneId: number; }

export function useFortuneStorage() {
  const [archive, setArchive]   = useState<Record<number, ArchiveEntry>>({});
  const [attemptsUsed, setUsed] = useState(0);

  useEffect(() => {
    setArchive(loadRaw(ARCHIVE_KEY, {}));
    const t: TodayData = loadRaw(TODAY_KEY, { date: '', attemptsUsed: 0, lastFortuneId: -1 });
    setUsed(t.date === todayStr() ? t.attemptsUsed : 0);
  }, []);

  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;
  const todayLocked  = attemptsLeft <= 0;

  const recordFortune = (fortune: {
    id: number; hexagramName: string; gradeLabel: string;
    gradeColor: string; hexagram: string; dailyTip: string;
  }) => {
    const today = todayStr();
    const newUsed = attemptsUsed + 1;

    // 每次抽签都存入签册
    const newArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
    const existing = newArchive[fortune.id];
    newArchive[fortune.id] = {
      fortuneId:    fortune.id,
      hexagramName: fortune.hexagramName,
      gradeLabel:   fortune.gradeLabel,
      gradeColor:   fortune.gradeColor,
      hexagram:     fortune.hexagram,
      dailyTip:     fortune.dailyTip,
      dates: existing
        ? [...new Set([...existing.dates, today])]
        : [today],
    };
    saveRaw(ARCHIVE_KEY, newArchive);
    setArchive({ ...newArchive });

    // 更新今日记录
    const todayData: TodayData = { date: today, attemptsUsed: newUsed, lastFortuneId: fortune.id };
    saveRaw(TODAY_KEY, todayData);
    setUsed(newUsed);
  };

  return { archive, attemptsLeft, todayLocked, recordFortune };
}
