/**
 * 解签逻辑：完整四柱八字 + 五行生克 + 时辰个性化
 */

import type { UserInfo, Fortune } from '@/lib/fortune';

/* ── Types ── */

export interface FullBazi {
  year: string;
  month: string;
  day: string;
  time: string;
  riZhu: string;
  riZhi: string;
  shiZhu: string;
  shiZhi: string;
}

export interface Interpretation {
  bazi: FullBazi;
  riZhuDesc: string;        // e.g. "甲日主（木）"
  shiZhuDesc: string;       // e.g. "丙时（食神）"
  shiChenAdvice: string;    // 时辰影响建议
  tianshi: string;
  userWuxing: string;
  todayWuxing: string;
  relation: 'sheng' | 'ke' | 'bei' | 'bi' | 'neutral';
  poeticFlow: string;
  flowExplain: string;
  flowAdvice: string;
  xingdong: string;         // 行动建议（吉凶不同）
  poemKeyword: string;
  poemImagery: string;
  poemGuide: string;
  qianwen: string;
}

/* ── Constants ── */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// Shichen value → dizhi index mapping
const SHICHEN_TO_INDEX: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

const MONTH_GAN = ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'];
const MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const SEASON_NAMES = ['严冬', '严冬', '初春', '仲春', '暮春', '初夏', '盛夏', '暮夏', '初秋', '仲秋', '暮秋', '初冬'];

const YUEZHI_BY_MONTH = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const YUN_BY_MONTH = ['木', '木', '土', '火', '火', '土', '金', '金', '土', '水', '水', '土'];

const SHENGKE: Record<string, { sheng: string; ke: string; beiKe: string }> = {
  '木': { sheng: '火', ke: '土', beiKe: '金' },
  '火': { sheng: '土', ke: '金', beiKe: '水' },
  '土': { sheng: '金', ke: '水', beiKe: '木' },
  '金': { sheng: '水', ke: '木', beiKe: '火' },
  '水': { sheng: '木', ke: '火', beiKe: '土' },
};

// 十神关系
const SHISHEN: Record<string, Record<string, string>> = {
  '木': { '木': '比肩', '火': '食神', '土': '正财', '金': '正官', '水': '正印' },
  '火': { '木': '正印', '火': '比肩', '土': '食神', '金': '正财', '水': '正官' },
  '土': { '木': '正官', '火': '正印', '土': '比肩', '金': '食神', '水': '正财' },
  '金': { '木': '正财', '火': '正官', '土': '正印', '金': '比肩', '水': '食神' },
  '水': { '木': '食神', '火': '正财', '土': '正官', '金': '正印', '水': '比肩' },
};

const SHICHEN_ADVICE: Record<string, string> = {
  '比肩': '得时助力，同行相帮，宜合作',
  '食神': '才华流露，表达顺畅，宜创作',
  '正财': '财机显现，宜把握，防贪多',
  '正官': '规矩当头，宜守正，防束缚',
  '正印': '贵人暗助，思虑清晰，宜谋划',
};

// 五行意象
const WUXING_IMAGERY: Record<string, string> = {
  '木': '林中清风',
  '火': '烈焰灼天',
  '土': '厚土承载',
  '金': '秋霜肃杀',
  '水': '深渊静流',
};

// 签解三层
const POEM_LAYERS = [
  { keyword: '破局', imagery: '乌云裂缝中的一线天光，预示困境将解', guide: '今日宜打破常规，用新的方式处理旧问题。哪怕只是换一条路上班，也能带来新的视角。' },
  { keyword: '静水', imagery: '水面平静，深处涌动。看似无波，实则暗藏生机', guide: '今日宜藏锋守拙，静待时机。最好的猎手往往以猎物的姿态出现。' },
  { keyword: '归途', imagery: '远方的灯火渐近，旅人的脚步不自觉加快', guide: '你离目标比想象中更近。今日宜坚持当前方向，不要被岔路迷惑。' },
  { keyword: '种子', imagery: '泥土之下，一粒种子正在无声地裂开壳', guide: '今日适合播种——无论是一个想法、一段关系，还是一个新习惯。不要急着看到结果。' },
  { keyword: '风起', imagery: '山顶的风总是最先到达，而山谷中的人尚未察觉', guide: '你比周围人更早感知到变化。今日宜提前布局，占据有利位置。' },
  { keyword: '磨石', imagery: '刀刃与磨石的摩擦，每一次都在去除多余', guide: '今日的困难都是在打磨你。感到阻力恰恰说明你在成长。保持耐心。' },
  { keyword: '渡口', imagery: '两岸之间，渡船正在缓缓靠岸', guide: '你正处在一个过渡期。今日不必急于做出重大决定，先到对岸再说。' },
  { keyword: '明镜', imagery: '一面擦拭干净的铜镜，映出真实的面容', guide: '今日宜自省，诚实面对自己的真实想法。自欺是最大的内耗。' },
  { keyword: '春雷', imagery: '惊蛰之后，万物苏醒。沉睡已久的事物即将复活', guide: '你搁置已久的计划，今日可以重新启动了。时机已到。' },
  { keyword: '云游', imagery: '白云无心出岫，飘向不可知的远方', guide: '今日宜放下控制欲，让事情自然发展。有时候不干预就是最好的干预。' },
  { keyword: '焚香', imagery: '一缕青烟袅袅升起，空间被净化', guide: '今日宜清理——无论是桌面、手机相册还是心中的杂念。轻装才能远行。' },
  { keyword: '对弈', imagery: '棋盘上黑白交错，每一步都在改变全局', guide: '今日做决定前多想一步。不是犹豫不决，而是深思熟虑。全局观是今日的关键。' },
  { keyword: '拾遗', imagery: '路边一朵被忽略的野花，其实是珍贵的药草', guide: '今日留意那些被你忽略的细节和人。意外之喜往往来自不经意处。' },
  { keyword: '铸剑', imagery: '烈火中反复锤炼，只为那一刻的锋芒', guide: '今日适合集中精力做一件事，做到极致。散兵游勇不如一剑封喉。' },
  { keyword: '听雨', imagery: '夜雨敲窗，独坐灯下，万籁中只有此刻', guide: '今日宜慢下来，给自己留一段独处时光。灵感和答案往往在安静中浮现。' },
];

/* ── Bazi Calculation ── */

export function getFullBazi(birthDate: string, birthTime: string): FullBazi {
  const [year, month, day] = birthDate.split('-').map(Number);

  // 年柱
  const yearGan = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'][year % 10];
  const yearZhi = DIZHI[(year - 4) % 12];

  // 月柱
  const monthGan = MONTH_GAN[month - 1];
  const monthZhi = MONTH_ZHI[month - 1];

  // 日柱（简化）
  const dayGan = TIANGAN[(year + month + day) % 10];
  const dayZhi = DIZHI[(year + month + day) % 12];

  // 时柱（关键差异化！）
  const timeIndex = SHICHEN_TO_INDEX[birthTime] ?? 0;
  const dayGanIndex = TIANGAN.indexOf(dayGan);
  const timeGanIndex = (dayGanIndex * 2 + timeIndex) % 10;
  const timeGan = TIANGAN[timeGanIndex];
  const timeZhi = DIZHI[timeIndex];

  return {
    year: yearGan + yearZhi,
    month: monthGan + monthZhi,
    day: dayGan + dayZhi,
    time: timeGan + timeZhi,
    riZhu: dayGan,
    riZhi: dayZhi,
    shiZhu: timeGan,
    shiZhi: timeZhi,
  };
}

/* ── Today Info ── */

function getTodayInfo() {
  const month = new Date().getMonth() + 1;
  return {
    yuezhi: YUEZHI_BY_MONTH[month - 1],
    yun: YUN_BY_MONTH[month - 1],
    season: SEASON_NAMES[month - 1],
  };
}

/* ── Poetic Flow ── */

function getPoetry(
  userWX: string, todayWX: string, rel: string, level: string
): { poetic: string; explain: string; advice: string; xingdong: string } {
  const isBad = level === '凶' || level === '小凶';

  let xingdong: string;

  switch (rel) {
    case 'sheng':
      xingdong = isBad
        ? '然今日过耗，宜缓行，防精力枯竭'
        : '宜主动进取，顺势而为，事半功倍';
      return {
        poetic: `你的${userWX}气，正逢${WUXING_IMAGERY[todayWX]}之势\n${userWX}生${todayWX}，如薪助火，能量自然流转而出`,
        explain: `你的力量正在向外输出，精气化为行动力。顺势而为则如水行舟，逆之则如木枯于火。`,
        advice: `宜顺势，不宜强求\n强求则${userWX}枯，顺势则根深`,
        xingdong,
      };
    case 'ke':
      xingdong = isBad
        ? '今日阻力暗藏，宜守成，不宜强攻'
        : '宜决断，速战速决，把握主动权';
      return {
        poetic: `你的${userWX}气，正压${WUXING_IMAGERY[todayWX]}之场\n${userWX}克${todayWX}，如虎踞山，主动之象`,
        explain: `你对当前局势有掌控力，气场强于环境。此时出击，阻力最小。`,
        advice: `宜主动出击，把握先机\n犹豫则势散，果断则功成`,
        xingdong,
      };
    case 'bei':
      xingdong = '宜退守，避其锋芒，回港为安';
      return {
        poetic: `${WUXING_IMAGERY[todayWX]}之气，正压你的${userWX}势\n${todayWX}克${userWX}，如风摧木，外力压制之象`,
        explain: `环境气场强于你的日主，硬碰硬只会徒耗心力。守拙藏锋，方为上策。`,
        advice: `宜守不宜攻，藏锋待时\n退一步海阔天空，进一步荆棘满途`,
        xingdong,
      };
    case 'bi':
      xingdong = isBad
        ? '同气虽助，今日暗流涌动，宜稳不宜急'
        : '宜大胆行动，天时在我，同气连枝';
      return {
        poetic: `你的${userWX}气，正遇同气之场\n${userWX}遇${todayWX}，如龙入海，比和相助`,
        explain: `天地同气，你与今日气场同频共振。万事和谐，阻力极小。`,
        advice: `宜大胆行动，天时在我\n同气连枝，事半功倍`,
        xingdong,
      };
    default:
      xingdong = '宜稳进，不宜激进';
      return {
        poetic: `你的${userWX}气，行于${WUXING_IMAGERY[todayWX]}之间\n五行流转平稳，无明显冲克`,
        explain: `今日气场平和，无大起大落。适合按部就班地推进事务。`,
        advice: `宜平常心，稳步前行\n不急不躁，自有节奏`,
        xingdong,
      };
  }
}

/* ── Main ── */

export function getInterpretation(user: UserInfo, fortune: Fortune): Interpretation {
  const bazi = getFullBazi(user.birthDate, user.birthTime);
  const todayInfo = getTodayInfo();

  const riWuxing = GAN_WUXING[bazi.riZhu];
  const shiWuxing = GAN_WUXING[bazi.shiZhu];
  const todayWX = todayInfo.yun;

  // 十神关系
  const shiZhuRelation = SHISHEN[riWuxing][shiWuxing];
  const shiChenAdvice = SHICHEN_ADVICE[shiZhuRelation] || '平稳安定，顺其自然';

  // 日主与今日五行关系
  const sk = SHENGKE[riWuxing];
  let relation: Interpretation['relation'];
  if (todayWX === sk.sheng) relation = 'sheng';
  else if (todayWX === sk.ke) relation = 'ke';
  else if (todayWX === sk.beiKe) relation = 'bei';
  else if (todayWX === riWuxing) relation = 'bi';
  else relation = 'neutral';

  const poetry = getPoetry(riWuxing, todayWX, relation, fortune.level);

  // Hash for poem layer — includes birthTime for differentiation
  const s = user.birthDate + user.birthTime + new Date().toISOString().split('T')[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  h = Math.abs(h);
  const layer = POEM_LAYERS[h % POEM_LAYERS.length];

  return {
    bazi,
    riZhuDesc: `${bazi.riZhu}日主（${riWuxing}）`,
    shiZhuDesc: `${bazi.shiZhu}时（${shiZhuRelation}）`,
    shiChenAdvice: shiChenAdvice,
    tianshi: `今日${todayInfo.yuezhi}月，${todayWX}气当令`,
    userWuxing: riWuxing,
    todayWuxing: todayWX,
    relation,
    poeticFlow: poetry.poetic,
    flowExplain: poetry.explain,
    flowAdvice: poetry.advice,
    xingdong: poetry.xingdong,
    poemKeyword: layer.keyword,
    poemImagery: layer.imagery,
    poemGuide: layer.guide,
    qianwen: fortune.poem,
  };
}

// Wuxing ring data for visualization
export const WUXING_RING = [
  { name: '木', color: '#5A7A6A', angle: 270 },
  { name: '火', color: '#B85C4A', angle: 342 },
  { name: '土', color: '#C9A86C', angle: 54 },
  { name: '金', color: '#E8E8E8', angle: 126 },
  { name: '水', color: '#2C3E50', angle: 198 },
] as const;
