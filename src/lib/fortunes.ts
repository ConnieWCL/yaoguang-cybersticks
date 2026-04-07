// ═══════════════════════════════════════════════
// 爻光 · 签文数据库  v2.0
// 24条签 · 覆盖大吉/中吉/平/谨慎/凶五个等级
// 今日主题系统 · 每日随机风格
// ═══════════════════════════════════════════════

export type Wuxing = '木' | '火' | '土' | '金' | '水';

export type ThemeStyle = 'gold' | 'jade' | 'rose' | 'frost' | 'ember';

export interface DailyTheme {
  style: ThemeStyle;
  label: string;
  primaryColor: string;
  accentColor: string;
  bgTint: string;
  desc: string;
}

export const DAILY_THEMES: Record<ThemeStyle, DailyTheme> = {
  gold: {
    style: 'gold',
    label: '金运日',
    primaryColor: '#C8A96E',
    accentColor: '#E8C88A',
    bgTint: 'rgba(200,169,110,0.04)',
    desc: '今日金气旺盛，万事可期',
  },
  jade: {
    style: 'jade',
    label: '木华日',
    primaryColor: '#7EB8A0',
    accentColor: '#A8D4C0',
    bgTint: 'rgba(126,184,160,0.04)',
    desc: '今日生机勃发，宜求进取',
  },
  rose: {
    style: 'rose',
    label: '桃花日',
    primaryColor: '#D4849A',
    accentColor: '#EAA8B8',
    bgTint: 'rgba(212,132,154,0.04)',
    desc: '今日感情旺盛，缘分自来',
  },
  frost: {
    style: 'frost',
    label: '水明日',
    primaryColor: '#7EA8C8',
    accentColor: '#A0C4E0',
    bgTint: 'rgba(126,168,200,0.04)',
    desc: '今日智慧通达，宜思谋划',
  },
  ember: {
    style: 'ember',
    label: '火炽日',
    primaryColor: '#C87E50',
    accentColor: '#E89A70',
    bgTint: 'rgba(200,126,80,0.04)',
    desc: '今日热情高涨，行动力强',
  },
};

export function getTodayTheme(): DailyTheme {
  const styles: ThemeStyle[] = ['gold', 'jade', 'rose', 'frost', 'ember'];
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return DAILY_THEMES[styles[seed % styles.length]];
}

export interface Fortune {
  id: number;
  hexagram: string;
  hexagramName: string;
  grade: 'supreme' | 'great' | 'middle' | 'caution' | 'warning';
  gradeLabel: string;
  gradeColor: string;
  poem: string[];
  interpretation: string;
  career: number;
  wealth: number;
  love: number;
  health: number;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  doList: string[];
  dontList: string[];
  nobleSign: string;
}

export const FORTUNES: Fortune[] = [
  // ── 大吉 ──
  {
    id: 1, hexagram: '䷀', hexagramName: '乾',
    grade: 'supreme', gradeLabel: '大吉', gradeColor: '#C8A96E',
    poem: ['天行健，君子以自强不息', '云开日出万象新', '贵人相助步步高', '时来运转福连绵'],
    interpretation: '乾卦纯阳，天道运行。今日诸事顺遂，内心所求皆有转机。主动出击，把握机遇，万事可期。',
    career: 92, wealth: 85, love: 78, health: 95,
    luckyColor: '金色', luckyNumber: 9, luckyDirection: '西北',
    doList: ['签约合作', '主动拜访贵人', '开始新项目'],
    dontList: ['优柔寡断', '拒绝邀约'],
    nobleSign: '属马、属龙',
  },
  {
    id: 14, hexagram: '䷍', hexagramName: '大有',
    grade: 'supreme', gradeLabel: '财运大吉', gradeColor: '#C8A96E',
    poem: ['大有，柔得尊位大中', '财星高照入门来', '有意栽花花自开', '无心插柳柳成荫'],
    interpretation: '大有卦主丰盛富足。今日财运旺盛，意外之财有望。留意投资机会，旧友叙旧或带来惊喜。',
    career: 80, wealth: 95, love: 65, health: 70,
    luckyColor: '橙色', luckyNumber: 8, luckyDirection: '正南',
    doList: ['理财规划', '拓展人脉', '接受馈赠'],
    dontList: ['大额借出', '冲动消费'],
    nobleSign: '属猪、属鸡',
  },
  {
    id: 11, hexagram: '䷊', hexagramName: '泰',
    grade: 'supreme', gradeLabel: '泰运亨通', gradeColor: '#C8A96E',
    poem: ['泰，小往大来，吉亨', '天地交泰万象生', '上下相通运势旺', '阴阳和合大吉祥'],
    interpretation: '泰卦天地交融，万物通泰。今日内外和谐，事业与生活双双顺遂，把握天时地利人和之机。',
    career: 90, wealth: 88, love: 85, health: 88,
    luckyColor: '绿色', luckyNumber: 3, luckyDirection: '东方',
    doList: ['谈判协商', '团队合作', '家庭聚会'],
    dontList: ['独断专行', '忽视他人意见'],
    nobleSign: '属牛、属羊',
  },
  {
    id: 16, hexagram: '䷏', hexagramName: '豫',
    grade: 'supreme', gradeLabel: '喜悦大吉', gradeColor: '#C8A96E',
    poem: ['豫，利建侯行师', '欢欣鼓舞天地动', '顺势而为万事成', '喜气洋洋福自来'],
    interpretation: '豫卦主喜悦顺动。今日心情愉快，能量充沛。适合展示才华，参与社交，感染力极强。',
    career: 85, wealth: 78, love: 90, health: 82,
    luckyColor: '黄色', luckyNumber: 6, luckyDirection: '西南',
    doList: ['展示才能', '社交活动', '表达心意'],
    dontList: ['过度放纵', '忽视细节'],
    nobleSign: '属虎、属马',
  },

  // ── 中吉 ──
  {
    id: 8, hexagram: '䷇', hexagramName: '比',
    grade: 'great', gradeLabel: '中吉', gradeColor: '#7EB8A0',
    poem: ['比者，辅也，下顺从也', '众志成城共前行', '和合之象生贵气', '守望相助福自来'],
    interpretation: '比卦主联合，人际和谐。今日适合团队协作，广结善缘。友情与合作能带来意想不到的收获。',
    career: 75, wealth: 68, love: 88, health: 72,
    luckyColor: '青色', luckyNumber: 6, luckyDirection: '正北',
    doList: ['团队协作', '联络旧友', '参加聚会'],
    dontList: ['独断专行', '拒绝合作'],
    nobleSign: '属兔、属牛',
  },
  {
    id: 31, hexagram: '䷞', hexagramName: '咸',
    grade: 'great', gradeLabel: '桃花旺', gradeColor: '#D4849A',
    poem: ['咸，感也，柔上而刚下', '桃花烂漫满枝开', '有情人终成眷属', '红线牵出千里缘'],
    interpretation: '咸卦主感应相通，情感共鸣。今日感情运势大旺，单身者有望邂逅，有伴者关系升温。',
    career: 65, wealth: 60, love: 96, health: 75,
    luckyColor: '粉色', luckyNumber: 2, luckyDirection: '正西',
    doList: ['约会表白', '参加社交', '送出心意'],
    dontList: ['发脾气', '说重话'],
    nobleSign: '属羊、属蛇',
  },
  {
    id: 17, hexagram: '䷐', hexagramName: '随',
    grade: 'great', gradeLabel: '顺势吉', gradeColor: '#7EB8A0',
    poem: ['随，随时之义大矣哉', '顺水行舟不费力', '因时而变天地宽', '随缘自在福相随'],
    interpretation: '随卦主顺时而动。今日顺势而为，切勿逆势强行。随和灵活，能获得意料之外的帮助。',
    career: 78, wealth: 72, love: 80, health: 76,
    luckyColor: '蓝色', luckyNumber: 3, luckyDirection: '东南',
    doList: ['灵活应变', '接受建议', '顺势调整'],
    dontList: ['固执己见', '强行推进'],
    nobleSign: '属龙、属猴',
  },
  {
    id: 63, hexagram: '䷾', hexagramName: '既济',
    grade: 'great', gradeLabel: '成事吉', gradeColor: '#C8A96E',
    poem: ['既济，亨小，利贞', '功成名就莫骄矜', '水火相济事竟成', '守正持续福悠长'],
    interpretation: '既济卦主事已完成。今日有收尾、结果之兆。已进行的事项将有好的结果，但需防止松懈。',
    career: 85, wealth: 78, love: 72, health: 82,
    luckyColor: '红色', luckyNumber: 7, luckyDirection: '东北',
    doList: ['收尾项目', '总结复盘', '庆祝小成'],
    dontList: ['骄傲自满', '放松警惕'],
    nobleSign: '属牛、属虎',
  },
  {
    id: 45, hexagram: '䷬', hexagramName: '萃',
    grade: 'great', gradeLabel: '聚气吉', gradeColor: '#7EB8A0',
    poem: ['萃，聚也，顺以说', '群英荟萃聚一堂', '众人拾柴火焰高', '合力同心福运旺'],
    interpretation: '萃卦主聚集。今日人气旺盛，适合召集团队，开展需要多方协作的事务，集体力量超乎预期。',
    career: 82, wealth: 75, love: 78, health: 70,
    luckyColor: '紫色', luckyNumber: 5, luckyDirection: '西南',
    doList: ['召开会议', '发起活动', '广结人缘'],
    dontList: ['孤立行动', '排斥异见'],
    nobleSign: '属鼠、属兔',
  },
  {
    id: 55, hexagram: '䷶', hexagramName: '丰',
    grade: 'great', gradeLabel: '丰收吉', gradeColor: '#C8A96E',
    poem: ['丰，大也，明以动', '丰收在望稻花香', '光明磊落天地宽', '盛极之时守其正'],
    interpretation: '丰卦主丰盛光明。今日成果显著，努力得到认可。正值巅峰，保持谦逊，勿因盛而骄。',
    career: 88, wealth: 82, love: 70, health: 78,
    luckyColor: '金黄', luckyNumber: 9, luckyDirection: '正南',
    doList: ['展示成果', '接受认可', '感恩付出'],
    dontList: ['得意忘形', '忽视根基'],
    nobleSign: '属马、属狗',
  },

  // ── 平稳 ──
  {
    id: 52, hexagram: '䷳', hexagramName: '艮',
    grade: 'middle', gradeLabel: '平稳', gradeColor: '#A0957A',
    poem: ['艮，止也，时止则止', '平湖秋月映长空', '波澜不惊自从容', '守得云开见月明'],
    interpretation: '艮卦主静止守本。今日平稳，不宜大动作。积蓄能量，沉淀思考，守本分，待时丰。',
    career: 62, wealth: 55, love: 68, health: 80,
    luckyColor: '米色', luckyNumber: 5, luckyDirection: '东北',
    doList: ['学习充电', '整理思路', '早睡早起'],
    dontList: ['轻率决策', '过度消耗'],
    nobleSign: '属马、属狗',
  },
  {
    id: 20, hexagram: '䷓', hexagramName: '观',
    grade: 'middle', gradeLabel: '静观其变', gradeColor: '#A0957A',
    poem: ['观，盥而不荐，有孚颙若', '高台望远观天下', '静待时机不妄动', '洞察先机自从容'],
    interpretation: '观卦主观察审视。今日宜旁观多于参与，观察局势再做决策。信息收集比行动更重要。',
    career: 60, wealth: 58, love: 62, health: 75,
    luckyColor: '灰色', luckyNumber: 4, luckyDirection: '西北',
    doList: ['收集信息', '观察局势', '暂缓决策'],
    dontList: ['仓促行动', '轻信流言'],
    nobleSign: '属蛇、属鸡',
  },
  {
    id: 29, hexagram: '䷜', hexagramName: '坎',
    grade: 'middle', gradeLabel: '处险有节', gradeColor: '#7EA8C8',
    poem: ['坎，险也，水洊至习坎', '险中求稳莫惊慌', '心诚志坚渡难关', '守信持正自无忧'],
    interpretation: '坎卦主险难重重。今日可能遭遇阻碍，保持内心坚定，诚信处事，险境终将过去。',
    career: 55, wealth: 50, love: 58, health: 65,
    luckyColor: '深蓝', luckyNumber: 1, luckyDirection: '正北',
    doList: ['保持诚信', '稳扎稳打', '寻求支援'],
    dontList: ['冒险投机', '独自硬撑'],
    nobleSign: '属猪、属鼠',
  },
  {
    id: 56, hexagram: '䷷', hexagramName: '旅',
    grade: 'middle', gradeLabel: '旅途平稳', gradeColor: '#A0957A',
    poem: ['旅，小亨，旅贞吉', '行走天涯自在身', '过客匆匆莫贪恋', '随遇而安是真人'],
    interpretation: '旅卦主行旅在外。今日有变动之象，可能需要离开舒适圈。保持灵活，不强求，随遇而安。',
    career: 65, wealth: 60, love: 55, health: 70,
    luckyColor: '棕色', luckyNumber: 5, luckyDirection: '西方',
    doList: ['适应变化', '保持灵活', '轻装前行'],
    dontList: ['过于执着', '强留不去'],
    nobleSign: '属马、属猴',
  },

  // ── 谨慎 ──
  {
    id: 39, hexagram: '䷦', hexagramName: '蹇',
    grade: 'caution', gradeLabel: '宜谨慎', gradeColor: '#8B9EC8',
    poem: ['蹇，难也，险在前也', '乌云蔽日暂难明', '且行且慢莫轻行', '山重水复疑无路，柳暗花明又一村'],
    interpretation: '蹇卦主艰难阻滞。今日运势稍有阻力，凡事三思而后行。低调行事，养精蓄锐，静待时机。',
    career: 40, wealth: 35, love: 52, health: 58,
    luckyColor: '白色', luckyNumber: 4, luckyDirection: '西南',
    doList: ['静思冥想', '检视计划', '照顾身体'],
    dontList: ['签重要合同', '与人争执'],
    nobleSign: '属鼠、属虎',
  },
  {
    id: 47, hexagram: '䷮', hexagramName: '困',
    grade: 'caution', gradeLabel: '处困待时', gradeColor: '#8B9EC8',
    poem: ['困，刚掩也', '困境之中藏生机', '君子处困守其志', '静待花开自有时'],
    interpretation: '困卦主困境压抑。今日感到受限或疲惫，不必强行突破。保存实力，等待时机，困境自会化解。',
    career: 38, wealth: 32, love: 48, health: 55,
    luckyColor: '灰白', luckyNumber: 2, luckyDirection: '正西',
    doList: ['保存体力', '整理内心', '寻找出路'],
    dontList: ['急于求成', '与人争斗'],
    nobleSign: '属龙、属牛',
  },
  {
    id: 12, hexagram: '䷋', hexagramName: '否',
    grade: 'caution', gradeLabel: '否极泰来', gradeColor: '#8B9EC8',
    poem: ['否之匪人，不利君子贞', '天地不交否之时', '小人道长君子退', '忍耐待时终必通'],
    interpretation: '否卦主闭塞不通。今日外部环境不顺，沟通受阻。退而求其次，修身养性，否极必泰来。',
    career: 35, wealth: 38, love: 42, health: 60,
    luckyColor: '黑色', luckyNumber: 6, luckyDirection: '西北',
    doList: ['修身养性', '积累实力', '沉默观察'],
    dontList: ['强行沟通', '轻易表态'],
    nobleSign: '属虎、属猪',
  },
  {
    id: 23, hexagram: '䷖', hexagramName: '剥',
    grade: 'caution', gradeLabel: '剥落谨守', gradeColor: '#8B9EC8',
    poem: ['剥，剥也，柔变刚也', '秋风落叶各自归', '剥落之后见本心', '守正不移待春归'],
    interpretation: '剥卦主剥落消减。今日有失去或减损之象，不宜新增负担。守住核心，减少损耗，等待转机。',
    career: 42, wealth: 30, love: 45, health: 52,
    luckyColor: '米白', luckyNumber: 8, luckyDirection: '东北',
    doList: ['守护现有', '减少支出', '反思总结'],
    dontList: ['新增投资', '轻易放弃底线'],
    nobleSign: '属蛇、属狗',
  },

  // ── 凶中有转机 ──
  {
    id: 36, hexagram: '䷣', hexagramName: '明夷',
    grade: 'warning', gradeLabel: '韬光养晦', gradeColor: '#9880B0',
    poem: ['明夷，利艰贞', '光明暂隐入地中', '韬光养晦待时机', '暗夜终将迎黎明'],
    interpretation: '明夷卦主光明受伤。今日处境艰难，不宜显露锋芒。低调隐忍，保存实力，黎明前的黑暗最深。',
    career: 30, wealth: 28, love: 38, health: 50,
    luckyColor: '深紫', luckyNumber: 4, luckyDirection: '正南',
    doList: ['低调行事', '暗中积蓄', '保护自己'],
    dontList: ['显露锋芒', '与强权对抗'],
    nobleSign: '属兔、属羊',
  },
  {
    id: 28, hexagram: '䷛', hexagramName: '大过',
    grade: 'warning', gradeLabel: '过则需省', gradeColor: '#9880B0',
    poem: ['大过，栋桡，利有攸往', '栋梁弯曲需支撑', '过犹不及需收敛', '知止方能长久行'],
    interpretation: '大过卦主过载超负。今日可能面临超出能力的压力。学会说不，适度减负，不要强撑超额负担。',
    career: 35, wealth: 32, love: 40, health: 45,
    luckyColor: '深棕', luckyNumber: 3, luckyDirection: '西南',
    doList: ['量力而为', '主动减压', '寻求帮助'],
    dontList: ['死撑硬扛', '接受超额任务'],
    nobleSign: '属鼠、属龙',
  },
  {
    id: 51, hexagram: '䷲', hexagramName: '震',
    grade: 'warning', gradeLabel: '震后自省', gradeColor: '#9880B0',
    poem: ['震，亨，震来虩虩', '雷声震动天地间', '惊而后省得安然', '恐惧修省福自来'],
    interpretation: '震卦主震动惊醒。今日可能遭遇突发情况，以惊为戒，冷静应对。惊后反省，往往是成长契机。',
    career: 40, wealth: 35, love: 42, health: 48,
    luckyColor: '暗红', luckyNumber: 1, luckyDirection: '正东',
    doList: ['冷静应对', '事后反思', '做好备案'],
    dontList: ['慌乱决策', '逃避问题'],
    nobleSign: '属虎、属马',
  },
  {
    id: 4, hexagram: '䷃', hexagramName: '蒙',
    grade: 'middle', gradeLabel: '启蒙求知', gradeColor: '#A0957A',
    poem: ['蒙，亨，匪我求童蒙', '蒙昧之中有灵光', '谦虚求教得真知', '循序渐进必有成'],
    interpretation: '蒙卦主蒙昧初开。今日适合学习新事物，保持谦逊求教之心。不懂就问，循序渐进自有收获。',
    career: 65, wealth: 55, love: 60, health: 72,
    luckyColor: '浅蓝', luckyNumber: 7, luckyDirection: '东方',
    doList: ['虚心学习', '请教前辈', '循序渐进'],
    dontList: ['不懂装懂', '跳跃冒进'],
    nobleSign: '属兔、属猴',
  },
  {
    id: 48, hexagram: '䷯', hexagramName: '井',
    grade: 'middle', gradeLabel: '涵养积累', gradeColor: '#7EA8C8',
    poem: ['井，改邑不改井，无丧无得', '井水长清润四方', '涵养深厚自持正', '取之不竭源头活'],
    interpretation: '井卦主涵养根源。今日适合深耕积累，修炼内功。外在变化不影响内心根基，厚积方能薄发。',
    career: 68, wealth: 62, love: 65, health: 80,
    luckyColor: '深绿', luckyNumber: 6, luckyDirection: '正北',
    doList: ['深耕专业', '修炼内功', '稳固根基'],
    dontList: ['急功近利', '忽视基础'],
    nobleSign: '属牛、属猪',
  },
];

export function getTodayFortune(): Fortune {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return FORTUNES[seed % FORTUNES.length];
}

export function getRandomFortune(excludeId?: number): Fortune {
  const pool = excludeId !== undefined
    ? FORTUNES.filter(f => f.id !== excludeId)
    : FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Legacy types & functions for Fortune/Interpretation pages ──

export interface UserInfo {
  birthDate: string;
  birthTime: string;
}

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
  todayWuxing: Wuxing;
}

const USER_KEY = 'yaoguang_user';

export function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getFortune(user: UserInfo): PageFortune {
  const f = getTodayFortune();
  const todayWuxing = (['木', '火', '土', '金', '水'] as Wuxing[])[
    (new Date().getFullYear() * 400 + (new Date().getMonth() + 1) * 31 + new Date().getDate()) % 5
  ];
  return {
    level: f.gradeLabel,
    poem: f.poem.join('\n'),
    career: f.interpretation,
    love: f.interpretation,
    health: f.interpretation,
    yi: f.doList,
    ji: f.dontList,
    color: { name: f.luckyColor, hex: f.gradeColor },
    number: f.luckyNumber,
    direction: f.luckyDirection,
    todayWuxing,
  };
}
}
