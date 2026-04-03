export interface Fortune {
  id: number;
  hexagram: string;       // 卦象符号
  hexagramName: string;   // 卦名
  grade: 'supreme' | 'great' | 'middle' | 'caution' | 'warning';
  gradeLabel: string;
  gradeColor: string;     // CSS variable name
  poem: string[];         // 4 lines
  interpretation: string;
  career: number;
  wealth: number;
  love: number;
  health: number;
  luckyColor: string;
  luckyNumber: number;
  doList: string[];
  dontList: string[];
  nobleSign: string;
}

export const FORTUNES: Fortune[] = [
  {
    id: 1,
    hexagram: '䷀',
    hexagramName: '乾',
    grade: 'supreme',
    gradeLabel: '大吉',
    gradeColor: '#C8A96E',
    poem: ['天行健，君子以自强不息', '云开日出万象新', '贵人相助步步高', '时来运转福连绵'],
    interpretation: '乾卦纯阳，天道运行。今日诸事顺遂，内心所求皆有转机。主动出击，把握机遇，万事可期。',
    career: 92, wealth: 85, love: 78, health: 95,
    luckyColor: '金色', luckyNumber: 9,
    doList: ['签约合作', '主动拜访贵人', '开始新项目'],
    dontList: ['优柔寡断', '拒绝邀约'],
    nobleSign: '属马、属龙',
  },
  {
    id: 8,
    hexagram: '䷇',
    hexagramName: '比',
    grade: 'great',
    gradeLabel: '中吉',
    gradeColor: '#7EB8A0',
    poem: ['比者，辅也，下顺从也', '众志成城共前行', '和合之象生贵气', '守望相助福自来'],
    interpretation: '比卦主联合，人际和谐。今日适合团队协作，广结善缘。友情与合作能带来意想不到的收获。',
    career: 75, wealth: 68, love: 88, health: 72,
    luckyColor: '青色', luckyNumber: 6,
    doList: ['团队协作', '联络旧友', '参加聚会'],
    dontList: ['独断专行', '拒绝合作'],
    nobleSign: '属兔、属牛',
  },
  {
    id: 14,
    hexagram: '䷍',
    hexagramName: '大有',
    grade: 'supreme',
    gradeLabel: '财运大吉',
    gradeColor: '#C8A96E',
    poem: ['大有，柔得尊位大中', '财星高照入门来', '有意栽花花自开', '无心插柳柳成荫'],
    interpretation: '大有卦主丰盛富足。今日财运旺盛，意外之财有望。留意投资机会，旧友叙旧或带来惊喜。',
    career: 80, wealth: 95, love: 65, health: 70,
    luckyColor: '橙色', luckyNumber: 8,
    doList: ['理财规划', '拓展人脉', '接受馈赠'],
    dontList: ['大额借出', '冲动消费'],
    nobleSign: '属猪、属鸡',
  },
  {
    id: 31,
    hexagram: '䷞',
    hexagramName: '咸',
    grade: 'great',
    gradeLabel: '桃花旺',
    gradeColor: '#D4849A',
    poem: ['咸，感也，柔上而刚下', '桃花烂漫满枝开', '有情人终成眷属', '红线牵出千里缘'],
    interpretation: '咸卦主感应相通，情感共鸣。今日感情运势大旺，单身者有望邂逅，有伴者关系升温。多出门走动。',
    career: 65, wealth: 60, love: 96, health: 75,
    luckyColor: '粉色', luckyNumber: 2,
    doList: ['约会表白', '参加社交', '送出心意'],
    dontList: ['发脾气', '说重话', '独处宅家'],
    nobleSign: '属羊、属蛇',
  },
  {
    id: 39,
    hexagram: '䷦',
    hexagramName: '蹇',
    grade: 'caution',
    gradeLabel: '宜谨慎',
    gradeColor: '#8B9EC8',
    poem: ['蹇，难也，险在前也', '乌云蔽日暂难明', '且行且慢莫轻行', '山重水复疑无路，柳暗花明又一村'],
    interpretation: '蹇卦主艰难阻滞。今日运势稍有阻力，凡事三思而后行。低调行事，养精蓄锐，静待时机。',
    career: 40, wealth: 35, love: 52, health: 58,
    luckyColor: '白色', luckyNumber: 4,
    doList: ['静思冥想', '检视计划', '照顾身体'],
    dontList: ['签重要合同', '与人争执', '熬夜透支'],
    nobleSign: '属鼠、属虎',
  },
  {
    id: 52,
    hexagram: '䷳',
    hexagramName: '艮',
    grade: 'middle',
    gradeLabel: '平稳',
    gradeColor: '#A0957A',
    poem: ['艮，止也，时止则止', '平湖秋月映长空', '波澜不惊自从容', '守得云开见月明'],
    interpretation: '艮卦主静止守本。今日平稳，不宜大动作。积蓄能量，沉淀思考，守本分，待时丰。',
    career: 62, wealth: 55, love: 68, health: 80,
    luckyColor: '米色', luckyNumber: 5,
    doList: ['学习充电', '整理思路', '早睡早起'],
    dontList: ['轻率决策', '过度消耗'],
    nobleSign: '属马、属狗',
  },
  {
    id: 17,
    hexagram: '䷐',
    hexagramName: '随',
    grade: 'great',
    gradeLabel: '顺势吉',
    gradeColor: '#7EB8A0',
    poem: ['随，随时之义大矣哉', '顺水行舟不费力', '因时而变天地宽', '随缘自在福相随'],
    interpretation: '随卦主顺时而动。今日顺势而为，切勿逆势强行。随和灵活，能获得意料之外的帮助与机遇。',
    career: 78, wealth: 72, love: 80, health: 76,
    luckyColor: '蓝色', luckyNumber: 3,
    doList: ['灵活应变', '接受建议', '顺势调整'],
    dontList: ['固执己见', '强行推进'],
    nobleSign: '属龙、属猴',
  },
  {
    id: 63,
    hexagram: '䷾',
    hexagramName: '既济',
    grade: 'great',
    gradeLabel: '成事吉',
    gradeColor: '#C8A96E',
    poem: ['既济，亨小，利贞', '功成名就莫骄矜', '水火相济事竟成', '守正持续福悠长'],
    interpretation: '既济卦主事已完成。今日有收尾、结果之兆。已进行的事项将有好的结果，但需防止松懈。',
    career: 85, wealth: 78, love: 72, health: 82,
    luckyColor: '红色', luckyNumber: 7,
    doList: ['收尾项目', '总结复盘', '庆祝小成'],
    dontList: ['骄傲自满', '放松警惕'],
    nobleSign: '属牛、属虎',
  },
];

export function getTodayFortune(): Fortune {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return FORTUNES[seed % FORTUNES.length];
}

export function getRandomFortune(exclude?: number): Fortune {
  const pool = exclude !== undefined ? FORTUNES.filter(f => f.id !== exclude) : FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── User Info & Page Fortune bridge ── */

export interface UserInfo {
  birthDate: string;   // 'YYYY-MM-DD'
  birthTime: string;   // dizhi e.g. '子','丑',...
}

const USER_KEY = 'yaoguang_user';

export function saveUser(info: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(info));
}

export function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Fortune view used by Fortune.tsx page */
export interface PageFortune {
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
  hexagram: string;
  hexagramName: string;
  guaIndex: number;
}

const COLOR_MAP: { name: string; hex: string }[] = [
  { name: '青碧', hex: '#5A7A6A' },
  { name: '朱砂', hex: '#B85C4A' },
  { name: '藤黄', hex: '#C9A86C' },
  { name: '靛蓝', hex: '#2C3E50' },
  { name: '胭脂', hex: '#D4849A' },
];

const DIRECTIONS = ['正东', '东南', '正南', '西南', '正西', '西北', '正北', '东北'];

export function getFortune(user: UserInfo): PageFortune {
  const today = new Date().toISOString().split('T')[0];
  const s = user.birthDate + user.birthTime + today;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  h = Math.abs(h);

  const base = FORTUNES[h % FORTUNES.length];

  const LEVELS = ['大吉', '吉', '中吉', '平', '小凶', '凶'];
  const level = LEVELS[h % 6];

  return {
    level,
    poem: base.poem[h % base.poem.length],
    career: base.interpretation.slice(0, 20),
    love: base.interpretation.slice(10, 30),
    health: base.interpretation.slice(20, 40),
    yi: base.doList,
    ji: base.dontList,
    color: COLOR_MAP[h % COLOR_MAP.length],
    number: base.luckyNumber,
    direction: DIRECTIONS[h % DIRECTIONS.length],
    hexagram: base.hexagram,
    hexagramName: base.hexagramName,
    guaIndex: h % 8,
  };
}
