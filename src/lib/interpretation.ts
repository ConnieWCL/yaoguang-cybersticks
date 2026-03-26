/**
 * 解签逻辑：基于用户提供的八字+天时+五行生克推算
 */

import type { UserInfo, Fortune } from './fortune';

export interface Interpretation {
  bazi: string;           // 八字日主
  tianshi: string;        // 今日天时
  liuzhuan: string;       // 五行流转
  jieshi: string;         // 运势解释
  qianwen: string;        // 签文原文
  poemMeaning: string;    // 签文白话
}

// 年份尾数 → 天干
const TIANGAN_BY_YEAR = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];

// 月份 → 季节
const SEASON_BY_MONTH = ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬'];

// 月份 → 五行
const WUXING_BY_MONTH = ['水', '水', '木', '木', '木', '火', '火', '火', '金', '金', '金', '土'];

// 月份 → 月支
const YUEZHI_BY_MONTH = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

// 月份 → 当令五行
const YUN_BY_MONTH = ['木', '木', '土', '火', '火', '土', '金', '金', '土', '水', '水', '土'];

// 五行生克关系
const SHENGKE: Record<string, { s: string; k: string; b: string }> = {
  '木': { s: '火', k: '土', b: '金' },
  '火': { s: '土', k: '金', b: '水' },
  '土': { s: '金', k: '水', b: '木' },
  '金': { s: '水', k: '木', b: '火' },
  '水': { s: '木', k: '火', b: '土' },
};

// 运势等级解释
const LEVEL_JIESHI: Record<string, string> = {
  '大吉': '天时地利，诸事皆宜',
  '吉': '气运通畅，宜主动',
  '中吉': '稳中求进，不宜冒进',
  '平': '平淡是真，宜静',
  '需注意': '暂避锋芒，以守为攻',
};

// 签文白话解释（扩展）
const POEM_MEANINGS = [
  '此签寓意时来运转，当下正是大展宏图之际，莫要犹豫观望。机会稍纵即逝，当果断出击。',
  '此签暗示虽眼前困顿，但转机就在不远处。山重水复之后必有柳暗花明，守得云开见月明。',
  '此签鼓励自信与豁达，天赋异禀者终将绽放光芒。千金散尽还复来，不必为一时得失忧心。',
  '此签提醒珍惜人际缘分，真挚的情谊跨越山海。身边之人即是最珍贵的财富，当好好珍惜。',
  '此签预示愿望终将达成，但需耐心等待与坚持。长风破浪会有时，水到渠成方为上策。',
  '此签劝人随遇而安，山穷水尽之处自有别样风景。行至水穷处，坐看云起时，放下执念反得自在。',
  '此签歌颂淡泊宁静的生活态度，远离喧嚣方能看清内心所向。采菊东篱下，悠然自得。',
  '此签暗示新的机遇正在萌芽，虽小却充满生机。小荷初露，当细心呵护，未来可期。',
  '此签寓意默默耕耘终有回报，润物无声的努力最为可贵。不必急于求成，时间会给出答案。',
  '此签预示即将迎来人生高光时刻。大鹏展翅，蓄势待发，一飞冲天指日可待。',
  '此签告诫轻装前行，放下过往包袱。轻舟已过万重山，当向前看。',
  '此签鼓励志存高远，脚踏实地。会当凌绝顶，一览众山小，胸怀决定格局。',
  '此签暗示旧事将了，新局将开。沉舟侧畔千帆过，病树前头万木春，革新是大势。',
  '此签劝勿忧前路，自有贵人相助。莫愁前路无知己，天下谁人不识君。',
  '此签寓意奉献精神终得善果。落红化泥更护花，善行自有回响。',
];

function getBaziInfo(birthDate: string) {
  const year = parseInt(birthDate.split('-')[0], 10);
  const month = parseInt(birthDate.split('-')[1], 10);
  const tiangan = TIANGAN_BY_YEAR[year % 10];
  const season = SEASON_BY_MONTH[month - 1];
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

  let liuzhuan: string;
  if (todayWX === sk.s) {
    liuzhuan = `${bazi.wuxing}生${todayWX}，气运流通，精力外泄宜收敛`;
  } else if (todayWX === sk.k) {
    liuzhuan = `${bazi.wuxing}克${todayWX}，主动出击可得财`;
  } else if (todayWX === sk.b) {
    liuzhuan = `${todayWX}克${bazi.wuxing}，外力压制宜守不宜攻`;
  } else if (todayWX === bazi.wuxing) {
    liuzhuan = `${bazi.wuxing}遇${todayWX}，比和相助，同气连枝`;
  } else {
    liuzhuan = '五行平稳中和，无明显冲克';
  }

  const jieshi = LEVEL_JIESHI[fortune.level] || '平稳中和';

  // 哈希选签文解释
  const s = user.birthDate + user.birthTime + new Date().toISOString().split('T')[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  h = Math.abs(h);

  const poemMeaning = POEM_MEANINGS[h % POEM_MEANINGS.length];

  return {
    bazi: `${bazi.rizhu}日主，生于${bazi.season}月`,
    tianshi: `今日${todayInfo.yuezhi}月，${todayWX}气当令`,
    liuzhuan,
    jieshi,
    qianwen: fortune.poem,
    poemMeaning,
  };
}
