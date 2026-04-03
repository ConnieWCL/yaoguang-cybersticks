/**
 * 用户信息 & 运势生成（哈希算法）
 */

export interface UserInfo {
  birthDate: string;   // 'YYYY-MM-DD'
  birthTime: string;   // 地支: '子','丑','寅',...
}

export interface Fortune {
  level: string;
  poem: string;
  career: string;
  love: string;
  health: string;
  yi: string[];
  ji: string[];
  color: { name: string; hex: string };
  number: number;
  direction: string;
}

const USER_KEY = 'yaoguang_user';

export function saveUser(user: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Hash helper ── */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

/* ── Fortune generation ── */
const LEVELS = ['大吉', '吉', '中吉', '平', '小凶', '凶'];

const POEMS: Record<string, string[]> = {
  '大吉': ['云开见月明', '龙腾九天外', '紫气东来时'],
  '吉':   ['春风入怀来', '桃花映日开', '顺水行舟畅'],
  '中吉': ['静水流深处', '守得云开见', '磨石出锋芒'],
  '平':   ['平湖秋月静', '无风自安然', '淡中有真味'],
  '小凶': ['暂避锋芒时', '风浪渐起处', '且行且慢行'],
  '凶':   ['乌云遮月暗', '逆水行舟难', '山重水复疑'],
};

const YI_POOL = ['签约', '出行', '会友', '求学', '祭祀', '动土', '开业', '纳财', '嫁娶', '种植'];
const JI_POOL = ['借贷', '争吵', '熬夜', '远行', '动怒', '冒险', '诉讼', '搬迁', '手术', '赌博'];

const COLORS = [
  { name: '青碧', hex: '#5A7A6A' },
  { name: '朱砂', hex: '#B85C4A' },
  { name: '藤黄', hex: '#C9A86C' },
  { name: '靛蓝', hex: '#2C3E50' },
  { name: '素白', hex: '#E8E8E8' },
  { name: '胭脂', hex: '#D4849A' },
];

const DIRECTIONS = ['正东', '正南', '正西', '正北', '东南', '东北', '西南', '西北'];

const CAREER_TEXTS = [
  '事业运势高涨，宜主动出击，贵人相助',
  '工作平稳推进，守正待时，不宜冒进',
  '职场暗流涌动，谨慎应对人际关系',
  '适合沉淀积累，学习新技能充电',
  '团队协作顺畅，宜合作共赢',
  '独当一面之时，信任自己的判断',
];

const LOVE_TEXTS = [
  '桃花运旺，单身者宜主动社交',
  '感情平稳，有伴者宜用心经营',
  '情感波动，宜冷静沟通避免争执',
  '缘分将至，保持开放心态',
  '旧情难断，需做出决断',
  '内心宁静，享受独处时光',
];

const HEALTH_TEXTS = [
  '精力充沛，适合运动锻炼',
  '注意休息，防止过度劳累',
  '饮食清淡，养护脾胃',
  '早睡早起，调整作息规律',
  '适当放松，缓解精神压力',
  '多饮水，注意保暖防寒',
];

export function getFortune(user: UserInfo): Fortune {
  const today = new Date().toISOString().split('T')[0];
  const seed = hash(user.birthDate + user.birthTime + today);

  const level = LEVELS[seed % 6];
  const poems = POEMS[level];
  const poem = poems[seed % poems.length];

  // Pick 3 yi, 3 ji (non-overlapping via offset)
  const yi = [0, 1, 2].map(i => YI_POOL[(seed + i * 3) % YI_POOL.length]);
  const ji = [0, 1, 2].map(i => JI_POOL[(seed + i * 3) % JI_POOL.length]);

  return {
    level,
    poem,
    career: CAREER_TEXTS[seed % CAREER_TEXTS.length],
    love: LOVE_TEXTS[(seed >> 3) % LOVE_TEXTS.length],
    health: HEALTH_TEXTS[(seed >> 5) % HEALTH_TEXTS.length],
    yi,
    ji,
    color: COLORS[seed % COLORS.length],
    number: (seed % 9) + 1,
    direction: DIRECTIONS[seed % DIRECTIONS.length],
  };
}
