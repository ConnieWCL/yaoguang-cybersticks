import { useState, useEffect, useRef } from 'react';

export interface ArchiveEntry {
  fortuneId: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
  dates: string[];
}

const ARCHIVE_KEY  = 'yaoguang_archive_v2';
const TODAY_KEY    = 'yaoguang_today_v2';
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
  const [archive,      setArchive] = useState<Record<number, ArchiveEntry>>({});
  const [attemptsUsed, setUsed]    = useState(0);
  // 用 ref 跟踪"本次会话内的真实已用次数"，防止闭包读到旧值
  const usedRef = useRef(0);

  useEffect(() => {
    const savedArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
    setArchive(savedArchive);

    const t = loadRaw<TodayData>(TODAY_KEY, { date:'', attemptsUsed:0, lastFortuneId:-1 });
    const used = t.date === todayStr() ? t.attemptsUsed : 0;
    setUsed(used);
    usedRef.current = used;
  }, []);

  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;
  const todayLocked  = attemptsLeft <= 0;

  const recordFortune = (fortune: {
    id: number; hexagramName: string; gradeLabel: string;
    gradeColor: string; hexagram: string; dailyTip: string;
  }) => {
    const today   = todayStr();
    // 用 ref 读取最新值，避免闭包捕获旧的 attemptsUsed
    const newUsed = usedRef.current + 1;
    usedRef.current = newUsed;

    // 存签册
    const newArchive = loadRaw<Record<number, ArchiveEntry>>(ARCHIVE_KEY, {});
    const existing   = newArchive[fortune.id];
    newArchive[fortune.id] = {
      fortuneId:    fortune.id,
      hexagramName: fortune.hexagramName,
      gradeLabel:   fortune.gradeLabel,
      gradeColor:   fortune.gradeColor,
      hexagram:     fortune.hexagram,
      dailyTip:     fortune.dailyTip,
      dates: existing ? [...new Set([...existing.dates, today])] : [today],
    };
    saveRaw(ARCHIVE_KEY, newArchive);
    setArchive({ ...newArchive });

    // 存今日记录
    saveRaw(TODAY_KEY, { date:today, attemptsUsed:newUsed, lastFortuneId:fortune.id } as TodayData);
    setUsed(newUsed);
  };

  return { archive, attemptsLeft, todayLocked, recordFortune };
}
