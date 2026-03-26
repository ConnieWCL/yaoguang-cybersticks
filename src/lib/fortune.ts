export interface UserInfo {
  nickname: string;
  birthDate: string;
  birthTime: string;
}

export interface Fortune {
  level: string;
  poem: string;
  yi: string[];
  ji: string[];
  color: { name: string; hex: string };
  number: number;
  direction: string;
}

export interface FortuneRecord {
  date: string;
  nickname: string;
  level: string;
  poem: string;
  savedAt: string;
}

const STORAGE_KEY = 'yaoguang_user';
const HISTORY_KEY = 'yaoguang_history';

export function saveUser(info: UserInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export function loadUser(): UserInfo | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveFortune(fortune: Fortune): void {
  const user = loadUser();
  const record: FortuneRecord = {
    date: new Date().toISOString().split('T')[0],
    nickname: user?.nickname || '',
    level: fortune.level,
    poem: fortune.poem,
    savedAt: new Date().toISOString(),
  };

  let history: FortuneRecord[] = [];
  try {
    history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { /* empty */ }

  // Don't duplicate same date
  if (history.length > 0 && history[0].date === record.date) {
    history[0] = record;
  } else {
    history.unshift(record);
  }
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadHistory(): FortuneRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function getHash(birthDate: string, birthTime: string, today: string): number {
  const s = birthDate + birthTime + today;
  let num = 0;
  for (let i = 0; i < s.length; i++) num += s.charCodeAt(i);
  return num;
}

const levels = ['大吉', '吉', '中吉', '平', '小凶', '凶'];

const poemsByLevel: Record<string, string[]> = {
  '大吉': ['云开见月，诸事皆宜', '时来天地皆同力', '鸿运当头'],
  '吉': ['春风入怀，小步快进', '柳暗花明', '贵人暗助'],
  '中吉': ['静水流深，稳中求进', '细水长流', '守得云开'],
  '平': ['平平淡淡', '宜静不宜动', '韬光养晦'],
  '小凶': ['暂避锋芒', '以守为攻', '不宜强求'],
  '凶': ['乌云遮月，暂宜守静', '风浪渐起，回港为安', '行路坎坷'],
};

const yiAll = ['签约', '出行', '会友', '置业', '开业', '纳财'];
const jiAll = ['借贷', '争吵', '熬夜', '投资', '诉讼', '远行'];

const colors = [
  { name: '青碧', hex: '#5B8A72' },
  { name: '朱砂', hex: '#9D6656' },
  { name: '藤黄', hex: '#C9A037' },
  { name: '墨黑', hex: '#2C2C2C' },
  { name: '月白', hex: '#E8E8E8' },
];

const directions = ['东南', '西北', '正南', '正北', '东北', '西南'];

export const SHICHEN = [
  { value: '子', label: '子时（23:00-01:00）' },
  { value: '丑', label: '丑时（01:00-03:00）' },
  { value: '寅', label: '寅时（03:00-05:00）' },
  { value: '卯', label: '卯时（05:00-07:00）' },
  { value: '辰', label: '辰时（07:00-09:00）' },
  { value: '巳', label: '巳时（09:00-11:00）' },
  { value: '午', label: '午时（11:00-13:00）' },
  { value: '未', label: '未时（13:00-15:00）' },
  { value: '申', label: '申时（15:00-17:00）' },
  { value: '酉', label: '酉时（17:00-19:00）' },
  { value: '戌', label: '戌时（19:00-21:00）' },
  { value: '亥', label: '亥时（21:00-23:00）' },
];

export function getFortune(user: UserInfo): Fortune {
  const today = new Date().toISOString().split('T')[0];
  const h = getHash(user.birthDate, user.birthTime, today);

  const level = levels[h % 6];
  const levelPoems = poemsByLevel[level];

  return {
    level,
    poem: levelPoems[h % levelPoems.length],
    yi: [yiAll[h % 6], yiAll[(h + 1) % 6], yiAll[(h + 2) % 6]],
    ji: [jiAll[(h + 3) % 6], jiAll[(h + 4) % 6], jiAll[(h + 5) % 6]],
    color: colors[h % 5],
    number: (h % 9) + 1,
    direction: directions[h % 6],
  };
}
