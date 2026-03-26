/**
 * 解签逻辑：将哈希包装为"八字+天时+五行"的专业解释
 */

import type { UserInfo, Fortune } from './fortune';

export interface Interpretation {
  baziSummary: string;    // 你的八字
  tianshiSummary: string; // 今日天时
  wuxingFlow: string;     // 五行流转
  poemMeaning: string;    // 签文深意
}

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const SEASON_WUXING: Record<string, { name: string; element: string }> = {
  '1': { name: '孟春', element: '木' },
  '2': { name: '仲春', element: '木' },
  '3': { name: '季春', element: '木' },
  '4': { name: '孟夏', element: '火' },
  '5': { name: '仲夏', element: '火' },
  '6': { name: '季夏', element: '土' },
  '7': { name: '孟秋', element: '金' },
  '8': { name: '仲秋', element: '金' },
  '9': { name: '季秋', element: '金' },
  '10': { name: '孟冬', element: '水' },
  '11': { name: '仲冬', element: '水' },
  '12': { name: '季冬', element: '土' },
};

const WUXING_RELATIONS: Record<string, Record<string, string>> = {
  '木': { '木': '比和相助', '火': '生发有力', '土': '克伐得财', '金': '受制有压', '水': '得生有源' },
  '火': { '木': '得生旺盛', '火': '比和相助', '土': '生发有力', '金': '克伐得财', '水': '受制有压' },
  '土': { '木': '受制有压', '火': '得生旺盛', '土': '比和相助', '金': '生发有力', '水': '克伐得财' },
  '金': { '木': '克伐得财', '火': '受制有压', '土': '得生旺盛', '金': '比和相助', '水': '生发有力' },
  '水': { '木': '生发有力', '火': '克伐得财', '土': '受制有压', '金': '得生旺盛', '水': '比和相助' },
};

const LEVEL_EXPLANATIONS: Record<string, string> = {
  '大吉': '日主与天时五行相生相合，气场顺畅，万事亨通之象。宜积极进取，把握时机。',
  '吉': '日主得天时之助，运势平顺向好。行事稳健，自有佳音。',
  '中吉': '天时与命局虽有小碍，但总体趋吉。谨慎行事，可化险为夷。',
  '平': '五行流转平和，无大起大落。宜守不宜攻，韬光养晦。',
  '需注意': '日主与天时五行有冲克之象，需谨慎行事。退一步海阔天空，忍一时风平浪静。',
};

const POEM_INTERPRETATIONS = [
  '此签寓意时来运转，当下正是大展宏图之际，莫要犹豫观望。',
  '此签暗示虽眼前困顿，但转机就在不远处，守得云开见月明。',
  '此签鼓励自信与豁达，天赋异禀者终将绽放光芒，不必为一时得失忧心。',
  '此签提醒珍惜人际缘分，真挚的友情跨越山海，是最珍贵的财富。',
  '此签预示愿望终将达成，但需耐心等待与坚持，水到渠成方为上策。',
  '此签劝人随遇而安，山穷水尽之处自有别样风景，放下执念反得自在。',
  '此签歌颂淡泊宁静的生活态度，远离喧嚣，方能看清内心所向。',
  '此签暗示新的机遇正在萌芽，虽小却充满生机，当细心呵护。',
  '此签寓意默默耕耘终有回报，润物无声的努力最为可贵。',
  '此签预示即将迎来人生高光时刻，蓄势待发，一飞冲天。',
];

export function getInterpretation(user: UserInfo, fortune: Fortune): Interpretation {
  // 从出生年份推算天干
  const birthYear = parseInt(user.birthDate.split('-')[0], 10);
  const birthMonth = parseInt(user.birthDate.split('-')[1], 10);
  const ganIndex = birthYear % 10;
  const dayGan = TIANGAN[ganIndex];
  const dayWuxing = WUXING_MAP[dayGan];

  // 今日月份推算天时
  const today = new Date();
  const todayMonth = String(today.getMonth() + 1);
  const season = SEASON_WUXING[todayMonth];

  // 五行关系
  const relation = WUXING_RELATIONS[dayWuxing]?.[season.element] || '相互作用';

  // 简单哈希选签文解释
  const s = user.birthDate + user.birthTime + today.toISOString().split('T')[0];
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  h = Math.abs(h);

  const baziSummary = `${dayGan}${dayWuxing}日主，生于${birthMonth}月（${SEASON_WUXING[String(birthMonth)]?.name || ''}），${dayWuxing}气${birthMonth >= 1 && birthMonth <= 3 ? '生发' : birthMonth >= 4 && birthMonth <= 6 ? '旺盛' : birthMonth >= 7 && birthMonth <= 9 ? '收敛' : '潜藏'}`;

  const tianshiSummary = `今值${season.name}，${season.element}气当令，天时${season.element === dayWuxing ? '与命局相合' : '流转变化'}`;

  const wuxingFlow = `你的日主${dayWuxing}遇今日${season.element}气，二者${relation}。${LEVEL_EXPLANATIONS[fortune.level]}`;

  const poemMeaning = POEM_INTERPRETATIONS[h % POEM_INTERPRETATIONS.length];

  return { baziSummary, tianshiSummary, wuxingFlow, poemMeaning };
}
