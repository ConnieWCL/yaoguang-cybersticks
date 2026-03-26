export interface UserInfo {
  nickname: string;
  birthDate: string;
  birthTime: string;
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

const STORAGE_KEY = 'yaoguang_user';

export function saveUser(info: UserInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export function loadUser(): UserInfo | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function getHash(birthDate: string, birthTime: string, today: string): number {
  const s = birthDate + birthTime + today;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

const poems = [
  '春风得意马蹄疾，一日看尽长安花',
  '山重水复疑无路，柳暗花明又一村',
  '天生我材必有用，千金散尽还复来',
  '海内存知己，天涯若比邻',
  '长风破浪会有时，直挂云帆济沧海',
  '行到水穷处，坐看云起时',
  '采菊东篱下，悠然见南山',
  '小荷才露尖尖角，早有蜻蜓立上头',
  '随风潜入夜，润物细无声',
  '大鹏一日同风起，扶摇直上九万里',
  '两岸猿声啼不住，轻舟已过万重山',
  '会当凌绝顶，一览众山小',
  '沉舟侧畔千帆过，病树前头万木春',
  '莫愁前路无知己，天下谁人不识君',
  '落红不是无情物，化作春泥更护花',
  '千磨万击还坚劲，任尔东西南北风',
  '不识庐山真面目，只缘身在此山中',
  '问渠那得清如许，为有源头活水来',
  '纸上得来终觉浅，绝知此事要躬行',
  '宝剑锋从磨砺出，梅花香自苦寒来',
  '博观而约取，厚积而薄发',
  '不畏浮云遮望眼，自缘身在最高层',
  '苟利国家生死以，岂因祸福避趋之',
  '我自横刀向天笑，去留肝胆两昆仑',
  '寄意寒星荃不察，我以我血荐轩辕',
  '横眉冷对千夫指，俯首甘为孺子牛',
  '度尽劫波兄弟在，相逢一笑泯恩仇',
  '雄关漫道真如铁，而今迈步从头越',
  '红军不怕远征难，万水千山只等闲',
  '为有牺牲多壮志，敢教日月换新天',
  '牢骚太盛防肠断，风物长宜放眼量',
  '天若有情天亦老，人间正道是沧桑',
  '一万年太久，只争朝夕',
  '世上无难事，只要肯登攀',
  '业精于勤，荒于嬉；行成于思，毁于随',
  '锲而舍之，朽木不折；锲而不舍，金石可镂',
  '不积跬步，无以至千里；不积小流，无以成江海',
  '千里之行，始于足下',
  '路漫漫其修远兮，吾将上下而求索',
  '天行健，君子以自强不息',
  '地势坤，君子以厚德载物',
  '穷则独善其身，达则兼济天下',
  '生于忧患，死于安乐',
  '得道多助，失道寡助',
  '天时不如地利，地利不如人和',
  '己所不欲，勿施于人',
  '学而不思则罔，思而不学则殆',
  '温故而知新，可以为师矣',
  '三人行，必有我师焉',
  '知之为知之，不知为不知，是知也',
  '敏而好学，不耻下问',
  '学如不及，犹恐失之',
  '朝闻道，夕死可矣',
  '君子和而不同，小人同而不和',
  '君子坦荡荡，小人长戚戚',
  '君子喻于义，小人喻于利',
  '君子成人之美，不成人之恶',
  '欲速则不达，见小利则大事不成',
  '人无远虑，必有近忧',
  '工欲善其事，必先利其器',
  '己欲立而立人，己欲达而达人',
  '小不忍，则乱大谋',
  '过而不改，是谓过矣',
  '学而不厌，诲人不倦',
  '发愤忘食，乐以忘忧',
  '如切如磋，如琢如磨',
  '投我以桃，报之以李',
  '满招损，谦受益',
  '从善如登，从恶如崩',
  '多行不义，必自毙',
  '辅车相依，唇亡齿寒',
  '皮之不存，毛将焉附',
  '欲加之罪，何患无辞',
  '物以类聚，人以群分',
  '千里之堤，溃于蚁穴',
  '言必信，行必果',
  '知人者智，自知者明',
  '胜人者有力，自胜者强',
  '大直若屈，大巧若拙',
  '祸兮福之所倚，福兮祸之所伏',
  '合抱之木，生于毫末',
  '九层之台，起于累土',
  '千里之行，始于足下',
  '信言不美，美言不信',
  '善者不辩，辩者不善',
  '知者不博，博者不知',
  '上善若水，水善利万物而不争',
  '大方无隅，大器晚成',
  '大音希声，大象无形',
  '道可道，非常道；名可名，非常名',
  '无为而无不为',
  '治大国若烹小鲜',
  '天下难事，必作于易；天下大事，必作于细',
  '轻诺必寡信，多易必多难',
  '其安易持，其未兆易谋',
  '慎终如始，则无败事',
  '江海所以能为百谷王者，以其善下之',
  '天下莫柔弱于水，而攻坚强者莫之能胜',
];

const careerLines = [
  '今日事业运势旺盛，宜主动出击',
  '贵人相助，工作中有意外收获',
  '稳扎稳打为上策，不宜冒进',
  '灵感迸发，适合创意类工作',
  '注意人际关系，团队协作是关键',
  '财运与事业相辅相成，把握机会',
  '宜低调行事，默默积蓄力量',
  '转机将至，耐心等待即可',
  '学习新技能的好时机',
  '今日适合总结复盘，规划未来',
];

const loveLines = [
  '桃花朵朵开，单身者留意身边人',
  '感情升温，适合表达心意',
  '相处需多一份耐心与包容',
  '旧友重逢，或有意外惊喜',
  '适合与伴侣一同做一件小事',
  '独处也是一种修行，享受当下',
  '真诚待人，自有回响',
  '今日宜倾听，少说多做',
  '小浪漫胜过大惊喜',
  '家人是最温暖的港湾',
];

const healthLines = [
  '注意作息规律，早睡早起',
  '适合户外运动，呼吸新鲜空气',
  '饮食宜清淡，忌辛辣油腻',
  '多饮水，身体通畅心情好',
  '冥想或瑜伽可助舒缓压力',
  '注意颈椎腰椎，久坐需起身活动',
  '今日精力充沛，可安排高强度活动',
  '泡一壶好茶，静心养神',
  '注意保暖，防止受凉',
  '睡前放下手机，给眼睛一点休息',
];

const yiAll = ['签约', '出行', '会友', '置业', '开业', '嫁娶', '搬家', '动土', '纳财', '求医', '祭祀', '入学', '裁衣', '竖柱', '上梁'];
const jiAll = ['借贷', '争吵', '熬夜', '投资', '诉讼', '远行', '动土', '搬迁', '开业', '签约', '嫁娶', '安葬', '开仓', '出货', '破土'];

const colors = [
  { name: '青碧', hex: '#5B8A72' },
  { name: '朱砂', hex: '#9D6656' },
  { name: '藤黄', hex: '#C9B037' },
  { name: '墨黑', hex: '#2C2C2C' },
  { name: '月白', hex: '#E8E8E8' },
  { name: '靛蓝', hex: '#3B5998' },
  { name: '胭脂', hex: '#C45A65' },
  { name: '竹青', hex: '#789262' },
];

const directions = ['东南', '西北', '正南', '正北', '东北', '西南', '正东', '正西'];
const levels = ['大吉', '吉', '中吉', '平', '小凶', '凶'];

export function getFortune(user: UserInfo): Fortune {
  const today = new Date().toISOString().split('T')[0];
  const h = getHash(user.birthDate, user.birthTime, today);

  return {
    level: levels[h % 6],
    poem: poems[h % poems.length],
    career: careerLines[h % careerLines.length],
    love: loveLines[(h + 3) % loveLines.length],
    health: healthLines[(h + 7) % healthLines.length],
    yi: [yiAll[h % 15], yiAll[(h + 1) % 15], yiAll[(h + 2) % 15]],
    ji: [jiAll[(h + 50) % 15], jiAll[(h + 51) % 15], jiAll[(h + 52) % 15]],
    color: colors[h % colors.length],
    number: (h % 9) + 1,
    direction: directions[h % directions.length],
  };
}

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
