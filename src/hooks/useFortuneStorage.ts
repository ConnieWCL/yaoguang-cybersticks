// ═══════════════════════════════════════════
// 爻光 · 本地存储 Hook
// ═══════════════════════════════════════════

import { useState, useEffect } from 'react';

export interface DayRecord {
  date: string;        // "2026-04-16"
  fortuneId: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
  attemptsUsed: number; // 今日已用次数
}

export interface ArchiveEntry {
  fortuneId: number;
  hexagramName: string;
  gradeLabel: string;
  gradeColor: string;
  hexagram: string;
  dailyTip: string;
  dates: string[]; // 所有抽到的日期
}

const STORAGE_KEY = 'yaoguang_archive';
const TODAY_KEY = 'yaoguang_today';
const MAX_ATTEMPTS = 3;

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadArchive(): Record<number, ArchiveEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveArchive(archive: Record<number, ArchiveEntry>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(archive)); } catch {}
}

function loadToday(): DayRecord | null {
  try {
    const raw = localStorage.getItem(TODAY_KEY);
    if (!raw) return null;
    const record: DayRecord = JSON.parse(raw);
    if (record.date !== getTodayStr()) return null; // 过期
    return record;
  } catch { return null; }
}

function saveToday(record: DayRecord) {
  try { localStorage.setItem(TODAY_KEY, JSON.stringify(record)); } catch {}
}

export function useFortuneStorage() {
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [archive, setArchive] = useState<Record<number, ArchiveEntry>>({});

  useEffect(() => {
    setTodayRecord(loadToday());
    setArchive(loadArchive());
  }, []);

  const attemptsUsed = todayRecord?.date === getTodayStr() ? (todayRecord.attemptsUsed ?? 0) : 0;
  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;
  const todayLocked = attemptsLeft <= 0;

  // 每次抽签后调用，保存当前签（始终覆盖为最新一次）
  const recordFortune = (fortune: {
    id: number; hexagramName: string; gradeLabel: string;
    gradeColor: string; hexagram: string; dailyTip: string;
  }) => {
    const today = getTodayStr();
    const used = attemptsUsed + 1;

    const record: DayRecord = {
      date: today,
      fortuneId: fortune.id,
      hexagramName: fortune.hexagramName,
      gradeLabel: fortune.gradeLabel,
      gradeColor: fortune.gradeColor,
      hexagram: fortune.hexagram,
      dailyTip: fortune.dailyTip,
      attemptsUsed: used,
    };
    saveToday(record);
    setTodayRecord(record);

    // 只有用完3次（最后一签）才存入签册
    if (used >= MAX_ATTEMPTS) {
      const newArchive = loadArchive();
      const existing = newArchive[fortune.id];
      newArchive[fortune.id] = {
        fortuneId: fortune.id,
        hexagramName: fortune.hexagramName,
        gradeLabel: fortune.gradeLabel,
        gradeColor: fortune.gradeColor,
        hexagram: fortune.hexagram,
        dailyTip: fortune.dailyTip,
        dates: existing ? [...new Set([...existing.dates, today])] : [today],
      };
      saveArchive(newArchive);
      setArchive({ ...newArchive });
    }
  };

  return { todayRecord, archive, attemptsLeft, todayLocked, recordFortune };
}
