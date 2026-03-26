/**
 * 解签逻辑：基于八字+天时+五行生克，输出诗意语言
 */

import type { UserInfo, Fortune } from './fortune';

export interface Interpretation {
  bazi: string;
  tianshi: string;
  userWuxing: string;      // 用户日主五行
  todayWuxing: string;     // 今日当令五行
  relation: 'sheng' | 'ke' | 'bei' | 'bi' | 'neutral';
  poeticFlow: string;      // 诗意流转描述
  flowExplain: string;     // 人话解释
  flowAdvice: string;      // 具体建议
  poemKeyword: string;     // 签解关键词
  poemImagery: string;     // 签解意象
  poemGuide: string;       // 签解指引
  qianwen: string;
}

const TIANGAN_BY_YEAR = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
const SEASON_NAMES = ['严冬', '严冬', '初春', '仲春', '暮春', '初夏', '盛夏', '暮夏', '初秋', '仲秋', '暮秋', '初冬'];
const WUXING_BY_MONTH = ['水', '水', '木', '木', '木', '火', '火', '火', '金', '金', '金', '土'];
const YUEZHI_BY_MONTH = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const YUN_BY_MONTH = ['木', '木', '土', '火', '火', '土', '金', '金', '土', '水', '水', '土'];

const SHENGKE: Record<string, { s: string; k: string; b: string }> = {
  '木': { s: '火', k: '土', b: '金' },
  '火': { s: '土', k: '金', b: '水' },
  '土': { s: '金', k: '水', b: '木' },
  '金': { s: '水', k: '木', b: '火' },
  '水': { s: '木', k: '火', b: '土' },
};

// 五行意象
const WUXING_IMAGERY: Record<string, string> = {
  '木': '林中清风',
  '火': '烈焰灼天',
  '土': '厚土承载',
  '金': '秋霜肃杀',
  '水': '深渊静流',
};

// 诗意流转模板
function getPoetry(userWX: string, todayWX: string, rel: string): { poetic: string; explain: string; advice: string } {
  switch (rel) {
    case 'sheng':
      return {
        poetic: `你的${userWX}气，正逢${WUXING_IMAGERY[todayWX]}之势\n${userWX}生${todayWX}，如薪助火，能量自然流转而出`,
        explain: `你的力量正在向外输出，精气化为行动力。顺势而为则如水行舟，逆之则如木枯于火。`,
        advice: `宜顺势，不宜强求\n强求则${userWX}枯，顺势则根深`,
      };
    case 'ke':
      return {
        poetic: `你的${userWX}气，正压${WUXING_IMAGERY[todayWX]}之场\n${userWX}克${todayWX}，如虎踞山，主动之象`,
        explain: `你对当前局势有掌控力，气场强于环境。此时出击，阻力最小。`,
        advice: `宜主动出击，把握先机\n犹豫则势散，果断则功成`,
      };
    case 'bei':
      return {
        poetic: `${WUXING_IMAGERY[todayWX]}之气，正压你的${userWX}势\n${todayWX}克${userWX}，如风摧木，外力压制之象`,
        explain: `环境气场强于你的日主，硬碰硬只会徒耗心力。守拙藏锋，方为上策。`,
        advice: `宜守不宜攻，藏锋待时\n退一步海阔天空，进一步荆棘满途`,
      };
    case 'bi':
      return {
        poetic: `你的${userWX}气，正遇同气之场\n${userWX}遇${todayWX}，如龙入海，比和相助`,
        explain: `天地同气，你与今日气场同频共振。万事和谐，阻力极小。`,
        advice: `宜大胆行动，天时在我\n同气连枝，事半功倍`,
      };
    default:
      return {
        poetic: `你的${userWX}气，行于${WUXING_IMAGERY[todayWX]}之间\n五行流转平稳，无明显冲克`,
        explain: `今日气场平和，无大起大落。适合按部就班地推进事务。`,
        advice: `宜平常心，稳步前行\n不急不躁，自有节奏`,
      };
  }
}

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

function getBaziInfo(birthDate: string) {
  const year = parseInt(birthDate.split('-')[0], 10);
  const month = parseInt(birthDate.split('-')[1], 10);
  const tiangan = TIANGAN_BY_YEAR[year % 10];
  const season = SEASON_NAMES[month - 1];
  const wuxing = WUXING_BY_MONTH[month - 1];
  const rizhu = tiangan + wuxing;
  return { tiangan, season, wuxing, rizhu };
}

function getTodayInfo() {
  const month = new Date().getMonth() + 1;
  return {
    yuezhi: YUEZHI_BY_MONTH[month - 1],
    yun: YUN_BY_MONTH[month - 1],
  };
}

export function getInterpretation(user: UserInfo, fortune: Fortune): Interpretation {
  const bazi = getBaziInfo(user.birthDate);
  const todayInfo = getTodayInfo();
  const sk = SHENGKE[bazi.wuxing];
  const todayWX = todayInfo.yun;

  let relation: Interpretation['relation'];
  if (todayWX === sk.s) relation = 'sheng';
  else if (todayWX === sk.k) relation = 'ke';
  else if (todayWX === sk.b) relation = 'bei';
  else if (todayWX === bazi.wuxing) relation = 'bi';
  else relation = 'neutral';

  const poetry = getPoetry(bazi.wuxing, todayWX, relation);

  // hash for poem layer selection
  const s = user.birthDate + user.birthTime + new Date().toISOString().split('T')[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  h = Math.abs(h);
  const layer = POEM_LAYERS[h % POEM_LAYERS.length];

  return {
    bazi: `${bazi.rizhu}日主，生于${bazi.season}`,
    tianshi: `今日${todayInfo.yuezhi}月，${todayWX}气当令`,
    userWuxing: bazi.wuxing,
    todayWuxing: todayWX,
    relation,
    poeticFlow: poetry.poetic,
    flowExplain: poetry.explain,
    flowAdvice: poetry.advice,
    poemKeyword: layer.keyword,
    poemImagery: layer.imagery,
    poemGuide: layer.guide,
    qianwen: fortune.poem,
  };
}

// Wuxing ring data for visualization
export const WUXING_RING = [
  { name: '木', color: '#5A7A6A', angle: 270 },  // top
  { name: '火', color: '#B85C4A', angle: 342 },   // top-right
  { name: '土', color: '#C9A86C', angle: 54 },    // bottom-right
  { name: '金', color: '#E8E8E8', angle: 126 },   // bottom-left
  { name: '水', color: '#2C3E50', angle: 198 },   // top-left
] as const;
