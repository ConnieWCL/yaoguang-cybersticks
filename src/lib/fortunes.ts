// ═══════════════════════════════════════════════
// 爻光 · 签文数据库  v4.0  ·  完整64卦 + 白话指引
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
  gold:  { style: 'gold',  label: '金运日', primaryColor: '#C8A96E', accentColor: '#E8C88A', bgTint: 'rgba(200,169,110,0.04)', desc: '今日金气旺盛，万事可期' },
  jade:  { style: 'jade',  label: '木华日', primaryColor: '#7EB8A0', accentColor: '#A8D4C0', bgTint: 'rgba(126,184,160,0.04)', desc: '今日生机勃发，宜求进取' },
  rose:  { style: 'rose',  label: '桃花日', primaryColor: '#D4849A', accentColor: '#EAA8B8', bgTint: 'rgba(212,132,154,0.04)', desc: '今日感情旺盛，缘分自来' },
  frost: { style: 'frost', label: '水明日', primaryColor: '#7EA8C8', accentColor: '#A0C4E0', bgTint: 'rgba(126,168,200,0.04)', desc: '今日智慧通达，宜思谋划' },
  ember: { style: 'ember', label: '火炽日', primaryColor: '#C87E50', accentColor: '#E89A70', bgTint: 'rgba(200,126,80,0.04)',  desc: '今日热情高涨，行动力强' },
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
  dailyTip: string;       // 新增：白话指引，一句话
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
  { id:1,  hexagram:'䷀', hexagramName:'乾',   grade:'supreme', gradeLabel:'大吉',     gradeColor:'#C8A96E',
    dailyTip: '今天你就是那个天选之人，想干啥干啥去🐉',
    poem:['天行健，君子以自强不息','龙德在天万象新','贵人相助步步高','时来运转福连绵'],
    interpretation:'乾卦纯阳，天道运行。今日诸事顺遂，内心所求皆有转机。主动出击，把握机遇，万事可期。',
    career:92, wealth:85, love:78, health:95, luckyColor:'金色', luckyNumber:9, luckyDirection:'西北',
    doList:['签约合作','拜访贵人','开始新项目'], dontList:['优柔寡断','拒绝邀约'], nobleSign:'属马、属龙' },

  { id:2,  hexagram:'䷁', hexagramName:'坤',   grade:'great',   gradeLabel:'厚德吉',   gradeColor:'#A0957A',
    dailyTip: '今天别冲，配合别人反而能捡到大便宜🌾',
    poem:['地势坤，君子以厚德载物','大地无言育万物','柔顺承载自有功','积厚流光福绵长'],
    interpretation:'坤卦主柔顺承载，今日宜包容待人，以厚德处事。不争不抢，顺势而为，自有贵人来助。',
    career:78, wealth:72, love:85, health:82, luckyColor:'黄色', luckyNumber:2, luckyDirection:'西南',
    doList:['包容他人','服务助人','稳健行事'], dontList:['强出头','与人争锋'], nobleSign:'属牛、属羊' },

  { id:3,  hexagram:'䷂', hexagramName:'屯',   grade:'caution', gradeLabel:'初创谨慎', gradeColor:'#8B9EC8',
    dailyTip: '刚开始很难很正常，别因为第一步卡壳就放弃🌱',
    poem:['屯，刚柔始交而难生','草木初萌破土难','万事开头勿急躁','蓄势待发时机来'],
    interpretation:'屯卦主初创艰难。今日事务处于起步阶段，不可操之过急。耐心积累，打好基础，前途光明。',
    career:45, wealth:42, love:55, health:65, luckyColor:'深绿', luckyNumber:3, luckyDirection:'正东',
    doList:['打好基础','耐心积累','寻求指导'], dontList:['急于求成','仓促决策'], nobleSign:'属龙、属马' },

  { id:4,  hexagram:'䷃', hexagramName:'蒙',   grade:'middle',  gradeLabel:'启蒙求知', gradeColor:'#A0957A',
    dailyTip: '今天不懂就问，装懂才是最大的坑📚',
    poem:['蒙，亨，匪我求童蒙','蒙昧之中有灵光','谦虚求教得真知','循序渐进必有成'],
    interpretation:'蒙卦主蒙昧初开。今日适合学习新事物，保持谦逊求教之心。不懂就问，循序渐进自有收获。',
    career:65, wealth:55, love:60, health:72, luckyColor:'浅蓝', luckyNumber:7, luckyDirection:'正东',
    doList:['虚心学习','请教前辈','循序渐进'], dontList:['不懂装懂','跳跃冒进'], nobleSign:'属兔、属猴' },

  { id:5,  hexagram:'䷄', hexagramName:'需',   grade:'middle',  gradeLabel:'等待时机', gradeColor:'#A0957A',
    dailyTip: '今天最好的动作就是等，急也没用，真的⏳',
    poem:['需，须也，险在前也','云行雨施天泽降','等待时机勿强行','饮食宴乐养精神'],
    interpretation:'需卦主等待。今日时机未到，不宜强行推进。保持耐心，养精蓄锐，时机一到自然水到渠成。',
    career:58, wealth:55, love:62, health:75, luckyColor:'天蓝', luckyNumber:5, luckyDirection:'正西',
    doList:['耐心等待','养精蓄锐','享受当下'], dontList:['强行推进','焦虑躁动'], nobleSign:'属鼠、属猪' },

  { id:6,  hexagram:'䷅', hexagramName:'讼',   grade:'caution', gradeLabel:'慎防争讼', gradeColor:'#8B9EC8',
    dailyTip: '今天遇到杠精直接绕道，赢了也没意思🙅',
    poem:['讼，有孚窒惕中吉','争讼之事宜慎思','半途而废反为吉','和气生财是上策'],
    interpretation:'讼卦主争讼纠纷。今日避免争执与纷争，有矛盾宜寻求调解而非对抗。退一步海阔天空。',
    career:40, wealth:38, love:42, health:60, luckyColor:'白色', luckyNumber:1, luckyDirection:'西北',
    doList:['息事宁人','寻求调解','保持克制'], dontList:['与人争执','坚持己见'], nobleSign:'属虎、属狗' },

  { id:7,  hexagram:'䷆', hexagramName:'师',   grade:'great',   gradeLabel:'统帅吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天你说话最有分量，该拍板就拍板💪',
    poem:['师，众也，贞正也','统帅三军威凛凛','纪律严明方致胜','以正御众福自来'],
    interpretation:'师卦主领导统率。今日适合担任领导角色，以正道率众。团队管理、组织协调皆有佳绩。',
    career:82, wealth:70, love:65, health:75, luckyColor:'墨绿', luckyNumber:7, luckyDirection:'正北',
    doList:['领导团队','制定规则','以身作则'], dontList:['独断专行','忽视团队'], nobleSign:'属鸡、属牛' },

  { id:8,  hexagram:'䷇', hexagramName:'比',   grade:'great',   gradeLabel:'中吉',     gradeColor:'#7EB8A0',
    dailyTip: '今天单打独斗效率最低，找人搭把手才是正解🤝',
    poem:['比者，辅也，下顺从也','众志成城共前行','和合之象生贵气','守望相助福自来'],
    interpretation:'比卦主联合，人际和谐。今日适合团队协作，广结善缘。友情与合作能带来意想不到的收获。',
    career:75, wealth:68, love:88, health:72, luckyColor:'青色', luckyNumber:6, luckyDirection:'正北',
    doList:['团队协作','联络旧友','参加聚会'], dontList:['独断专行','拒绝合作'], nobleSign:'属兔、属牛' },

  { id:9,  hexagram:'䷈', hexagramName:'小畜', grade:'middle',  gradeLabel:'蓄势待发', gradeColor:'#A0957A',
    dailyTip: '今天没有大突破很正常，踏实积累就够了🌙',
    poem:['小畜，柔得位而上下应','小积渐成大事业','密云不雨自我西','蓄而待发时自来'],
    interpretation:'小畜卦主小有积蓄。今日积累多于收获，暂时尚无大突破，但每一步积累都在为未来蓄力。',
    career:62, wealth:60, love:65, health:70, luckyColor:'淡黄', luckyNumber:4, luckyDirection:'西方',
    doList:['积累资源','完善细节','持续耕耘'], dontList:['急于收获','好高骛远'], nobleSign:'属蛇、属鸡' },

  { id:10, hexagram:'䷉', hexagramName:'履',   grade:'middle',  gradeLabel:'谨慎前行', gradeColor:'#A0957A',
    dailyTip: '今天说话做事都小心一点，不是怂，是稳🐾',
    poem:['履虎尾，不咥人，亨','履礼而行步步稳','虎尾之前须谨慎','守正履礼自无忧'],
    interpretation:'履卦主谨慎行事。今日如履薄冰，需格外注意言行举止。守礼守正，小心翼翼，可化险为夷。',
    career:65, wealth:60, love:68, health:72, luckyColor:'灰色', luckyNumber:3, luckyDirection:'正南',
    doList:['谨言慎行','守礼待人','步步为营'], dontList:['冒险行事','口无遮拦'], nobleSign:'属虎、属鸡' },

  { id:11, hexagram:'䷊', hexagramName:'泰',   grade:'supreme', gradeLabel:'泰运亨通', gradeColor:'#C8A96E',
    dailyTip: '今天什么事都顺，大胆去做就对了✨',
    poem:['泰，小往大来，吉亨','天地交泰万象生','上下相通运势旺','阴阳和合大吉祥'],
    interpretation:'泰卦天地交融，万物通泰。今日内外和谐，事业与生活双双顺遂，把握天时地利人和之机。',
    career:90, wealth:88, love:85, health:88, luckyColor:'绿色', luckyNumber:3, luckyDirection:'正东',
    doList:['谈判协商','团队合作','家庭聚会'], dontList:['独断专行','忽视他人'], nobleSign:'属牛、属羊' },

  { id:12, hexagram:'䷋', hexagramName:'否',   grade:'warning', gradeLabel:'否极泰来', gradeColor:'#9880B0',
    dailyTip: '今天推什么都推不动，躺着等一等也是一种智慧🌧',
    poem:['否之匪人，不利君子贞','天地不交否之时','小人道长君子退','忍耐待时终必通'],
    interpretation:'否卦主闭塞不通。今日外部环境不顺，沟通受阻。退而求其次，修身养性，否极必泰来。',
    career:35, wealth:38, love:42, health:60, luckyColor:'黑色', luckyNumber:6, luckyDirection:'西北',
    doList:['修身养性','积累实力','沉默观察'], dontList:['强行沟通','轻易表态'], nobleSign:'属虎、属猪' },

  { id:13, hexagram:'䷌', hexagramName:'同人', grade:'great',   gradeLabel:'同心吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天找到同频的人一起干，比自己单干香多了🔥',
    poem:['同人于野，亨，利涉大川','同心同德共事业','志同道合聚良朋','携手并进福运来'],
    interpretation:'同人卦主志同道合。今日适合与志同道合之人携手合作，共同的目标让力量倍增。',
    career:80, wealth:75, love:82, health:78, luckyColor:'橙色', luckyNumber:5, luckyDirection:'正南',
    doList:['寻找同伴','分享理想','携手合作'], dontList:['独行其是','排斥异见'], nobleSign:'属马、属狗' },

  { id:14, hexagram:'䷍', hexagramName:'大有', grade:'supreme', gradeLabel:'财运大吉', gradeColor:'#C8A96E',
    dailyTip: '今天财运爆棚，留意身边藏着的小惊喜💰',
    poem:['大有，柔得尊位大中','财星高照入门来','有意栽花花自开','无心插柳柳成荫'],
    interpretation:'大有卦主丰盛富足。今日财运旺盛，意外之财有望。留意投资机会，旧友叙旧或带来惊喜。',
    career:80, wealth:95, love:65, health:70, luckyColor:'橙色', luckyNumber:8, luckyDirection:'正南',
    doList:['理财规划','拓展人脉','接受馈赠'], dontList:['大额借出','冲动消费'], nobleSign:'属猪、属鸡' },

  { id:15, hexagram:'䷎', hexagramName:'谦',   grade:'great',   gradeLabel:'谦逊吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天越低调越有收获，锋芒毕露反而减分🌿',
    poem:['谦，亨，君子有终','谦谦君子光华著','低调行事反得誉','谦受益满招损'],
    interpretation:'谦卦主谦虚获益。今日越低调越有收获，谦逊的态度能赢得他人尊重与帮助，切勿骄傲自满。',
    career:78, wealth:72, love:80, health:82, luckyColor:'浅绿', luckyNumber:6, luckyDirection:'西南',
    doList:['谦虚待人','主动请教','低调做事'], dontList:['自吹自擂','盛气凌人'], nobleSign:'属牛、属蛇' },

  { id:16, hexagram:'䷏', hexagramName:'豫',   grade:'supreme', gradeLabel:'喜悦大吉', gradeColor:'#C8A96E',
    dailyTip: '今天能量满满，把这份好心情传染给身边人吧🎉',
    poem:['豫，利建侯行师','欢欣鼓舞天地动','顺势而为万事成','喜气洋洋福自来'],
    interpretation:'豫卦主喜悦顺动。今日心情愉快，能量充沛。适合展示才华，参与社交，感染力极强。',
    career:85, wealth:78, love:90, health:82, luckyColor:'黄色', luckyNumber:6, luckyDirection:'西南',
    doList:['展示才能','社交活动','表达心意'], dontList:['过度放纵','忽视细节'], nobleSign:'属虎、属马' },

  { id:17, hexagram:'䷐', hexagramName:'随',   grade:'great',   gradeLabel:'顺势吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天跟着感觉走，别跟自己较劲🍃',
    poem:['随，随时之义大矣哉','顺水行舟不费力','因时而变天地宽','随缘自在福相随'],
    interpretation:'随卦主顺时而动。今日顺势而为，切勿逆势强行。随和灵活，能获得意料之外的帮助。',
    career:78, wealth:72, love:80, health:76, luckyColor:'蓝色', luckyNumber:3, luckyDirection:'东南',
    doList:['灵活应变','接受建议','顺势调整'], dontList:['固执己见','强行推进'], nobleSign:'属龙、属猴' },

  { id:18, hexagram:'䷑', hexagramName:'蛊',   grade:'caution', gradeLabel:'革旧图新', gradeColor:'#8B9EC8',
    dailyTip: '今天适合大扫除，物理上和精神上都可以🧹',
    poem:['蛊，元亨，利涉大川','腐朽之中生新机','整饬旧弊须果断','革故鼎新自有成'],
    interpretation:'蛊卦主整饬腐败。今日适合清理积弊，革除旧习，整理混乱的状况。改革需要勇气和决心。',
    career:55, wealth:50, love:52, health:62, luckyColor:'棕红', luckyNumber:5, luckyDirection:'东北',
    doList:['清理积弊','革除旧习','整理秩序'], dontList:['因循守旧','拖延不决'], nobleSign:'属蛇、属狗' },

  { id:19, hexagram:'䷒', hexagramName:'临',   grade:'great',   gradeLabel:'临事吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天亲力亲为效果最好，别只动嘴🎯',
    poem:['临，元亨，利贞','大人临下威仪著','悦而顺行事功成','二月将至须防变'],
    interpretation:'临卦主亲临监督。今日适合亲力亲为，监督执行。领导者下沉一线，能发现问题及时调整。',
    career:82, wealth:75, love:70, health:78, luckyColor:'深蓝', luckyNumber:8, luckyDirection:'正南',
    doList:['亲力亲为','监督执行','深入一线'], dontList:['高高在上','放任不管'], nobleSign:'属虎、属羊' },

  { id:20, hexagram:'䷓', hexagramName:'观',   grade:'middle',  gradeLabel:'静观其变', gradeColor:'#A0957A',
    dailyTip: '今天先观察，收集到足够信息再出手👀',
    poem:['观，盥而不荐，有孚颙若','高台望远观天下','静待时机不妄动','洞察先机自从容'],
    interpretation:'观卦主观察审视。今日宜旁观多于参与，观察局势再做决策。信息收集比行动更重要。',
    career:60, wealth:58, love:62, health:75, luckyColor:'灰色', luckyNumber:4, luckyDirection:'西北',
    doList:['收集信息','观察局势','暂缓决策'], dontList:['仓促行动','轻信流言'], nobleSign:'属蛇、属鸡' },

  { id:21, hexagram:'䷔', hexagramName:'噬嗑', grade:'caution', gradeLabel:'明断是非', gradeColor:'#8B9EC8',
    dailyTip: '今天有个事得直接说清楚，别憋着🗣',
    poem:['噬嗑，亨，利用狱','明察秋毫除障碍','当机立断是非明','雷电相薄威自显'],
    interpretation:'噬嗑卦主明断决策。今日可能遇到需要做出裁决的情况。保持公正，当机立断，不可优柔寡断。',
    career:60, wealth:55, love:50, health:65, luckyColor:'红色', luckyNumber:9, luckyDirection:'正南',
    doList:['当机立断','明辨是非','公正处理'], dontList:['优柔寡断','徇私舞弊'], nobleSign:'属虎、属鸡' },

  { id:22, hexagram:'䷕', hexagramName:'贲',   grade:'great',   gradeLabel:'文采吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天打扮好一点出门，颜值即正义💅',
    poem:['贲，亨，小利有攸往','文质彬彬君子风','装饰得宜增光彩','内外兼修自有美'],
    interpretation:'贲卦主文采修饰。今日形象、表达、创意方面有佳绩。适合创作、演讲、优化外在呈现。',
    career:75, wealth:65, love:78, health:72, luckyColor:'白色', luckyNumber:2, luckyDirection:'东北',
    doList:['创意创作','优化形象','精心表达'], dontList:['忽视外表','言语粗糙'], nobleSign:'属兔、属蛇' },

  { id:23, hexagram:'䷖', hexagramName:'剥',   grade:'warning', gradeLabel:'剥落谨守', gradeColor:'#9880B0',
    dailyTip: '今天可能会有点小损失，别慌，守住核心就行🍂',
    poem:['剥，不利有攸往','秋风落叶各自归','剥落之后见本心','守正不移待春归'],
    interpretation:'剥卦主剥落消减。今日有失去或减损之象，不宜新增负担。守住核心，减少损耗，等待转机。',
    career:35, wealth:30, love:42, health:52, luckyColor:'米白', luckyNumber:8, luckyDirection:'东北',
    doList:['守护现有','减少支出','反思总结'], dontList:['新增投资','轻易放弃底线'], nobleSign:'属蛇、属狗' },

  { id:24, hexagram:'䷗', hexagramName:'复',   grade:'great',   gradeLabel:'否极复来', gradeColor:'#7EB8A0',
    dailyTip: '低谷期结束了，新的开始就是今天🌅',
    poem:['复，亨，出入无疾','一阳来复冬至日','万物复苏生机旺','归根复命自有时'],
    interpretation:'复卦主回归复苏。今日有重新开始之象，过去的困境正在转化。新的周期开始，把握新机遇。',
    career:75, wealth:70, love:72, health:80, luckyColor:'嫩绿', luckyNumber:1, luckyDirection:'正北',
    doList:['重新出发','把握新机','回归初心'], dontList:['沉溺过去','错失时机'], nobleSign:'属鼠、属龙' },

  { id:25, hexagram:'䷘', hexagramName:'无妄', grade:'great',   gradeLabel:'无妄纯正', gradeColor:'#7EB8A0',
    dailyTip: '今天走正路，别投机，老实人今天最有福报💫',
    poem:['无妄，元亨，利贞','至诚无妄天道应','心正行端福自来','无故之灾自消散'],
    interpretation:'无妄卦主真实纯正。今日以诚心行事，不投机取巧。真诚的付出必有回报，天道酬勤。',
    career:78, wealth:72, love:76, health:82, luckyColor:'白色', luckyNumber:9, luckyDirection:'正东',
    doList:['诚心诚意','脚踏实地','按规律行事'], dontList:['投机取巧','心存侥幸'], nobleSign:'属马、属鸡' },

  { id:26, hexagram:'䷙', hexagramName:'大畜', grade:'great',   gradeLabel:'大蓄厚积', gradeColor:'#C8A96E',
    dailyTip: '你攒的那些东西，迟早都会用上的，继续攒📦',
    poem:['大畜，利贞，不家食吉','大山蓄势厚积薄发','良才积德待时用','刚健笃实光辉日新'],
    interpretation:'大畜卦主厚积薄发。今日积累的知识、能量终将有用武之地。沉淀越久，爆发越强。',
    career:80, wealth:78, love:68, health:85, luckyColor:'深棕', luckyNumber:6, luckyDirection:'西北',
    doList:['深厚积累','修炼内功','广学博识'], dontList:['浅尝辄止','急于变现'], nobleSign:'属牛、属狗' },

  { id:27, hexagram:'䷚', hexagramName:'颐',   grade:'middle',  gradeLabel:'颐养身心', gradeColor:'#A0957A',
    dailyTip: '今天好好吃饭好好睡觉，身体是最大的本钱🍜',
    poem:['颐，贞吉，观颐','饮食有节养天年','颐养正气身心健','慎言慎食福寿长'],
    interpretation:'颐卦主养护滋养。今日注重身心健康，饮食有节，言语谨慎。适当休息，为长远发展养精蓄锐。',
    career:62, wealth:58, love:65, health:88, luckyColor:'米色', luckyNumber:4, luckyDirection:'正东',
    doList:['养生保健','节制饮食','休息充电'], dontList:['暴饮暴食','过度劳累'], nobleSign:'属牛、属羊' },

  { id:28, hexagram:'䷛', hexagramName:'大过', grade:'warning', gradeLabel:'过则需省', gradeColor:'#9880B0',
    dailyTip: '今天你承受的已经超载了，学会说"不"🛑',
    poem:['大过，栋桡，利有攸往','栋梁弯曲需支撑','过犹不及需收敛','知止方能长久行'],
    interpretation:'大过卦主过载超负。今日可能面临超出能力的压力。学会说不，适度减负，不要强撑超额负担。',
    career:38, wealth:35, love:42, health:48, luckyColor:'深棕', luckyNumber:3, luckyDirection:'西南',
    doList:['量力而为','主动减压','寻求帮助'], dontList:['死撑硬扛','超额承诺'], nobleSign:'属鼠、属龙' },

  { id:29, hexagram:'䷜', hexagramName:'坎',   grade:'caution', gradeLabel:'处险有节', gradeColor:'#7EA8C8',
    dailyTip: '今天有点难，但你扛过去了就是新的起点🌊',
    poem:['坎，险也，水洊至习坎','险中求稳莫惊慌','心诚志坚渡难关','守信持正自无忧'],
    interpretation:'坎卦主险难重重。今日可能遭遇阻碍，保持内心坚定，诚信处事，险境终将过去。',
    career:48, wealth:45, love:52, health:60, luckyColor:'深蓝', luckyNumber:1, luckyDirection:'正北',
    doList:['保持诚信','稳扎稳打','寻求支援'], dontList:['冒险投机','独自硬撑'], nobleSign:'属猪、属鼠' },

  { id:30, hexagram:'䷝', hexagramName:'离',   grade:'great',   gradeLabel:'光明吉',   gradeColor:'#C87E50',
    dailyTip: '今天你的想法特别清晰，适合表达输出🌟',
    poem:['离，利贞，亨，畜牝牛吉','离火光明照四方','文明柔顺功业成','相互依附自光辉'],
    interpretation:'离卦主光明文明。今日思维清晰，表达力极强。适合展示、演讲、创作，光芒难以掩盖。',
    career:85, wealth:72, love:75, health:78, luckyColor:'红色', luckyNumber:9, luckyDirection:'正南',
    doList:['展示才华','清晰表达','创作输出'], dontList:['遮掩实力','过于低调'], nobleSign:'属马、属鸡' },

  { id:31, hexagram:'䷞', hexagramName:'咸',   grade:'supreme', gradeLabel:'桃花大吉', gradeColor:'#D4849A',
    dailyTip: '今天感情运爆表，单身的出门可能有惊喜🌸',
    poem:['咸，感也，柔上而刚下','桃花烂漫满枝开','有情人终成眷属','红线牵出千里缘'],
    interpretation:'咸卦主感应相通，情感共鸣。今日感情运势大旺，单身者有望邂逅，有伴者关系升温。',
    career:65, wealth:60, love:96, health:75, luckyColor:'粉色', luckyNumber:2, luckyDirection:'正西',
    doList:['约会表白','参加社交','送出心意'], dontList:['发脾气','说重话'], nobleSign:'属羊、属蛇' },

  { id:32, hexagram:'䷟', hexagramName:'恒',   grade:'great',   gradeLabel:'恒久吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天适合做需要长期坚持的事，恒心是超能力⚡',
    poem:['恒，亨，无咎，利贞','恒心毅力成大事','持之以恒日日新','雷风相与久而成'],
    interpretation:'恒卦主持久不变。今日适合需要长期坚持的事务。恒心是最大的武器，不要半途而废。',
    career:80, wealth:75, love:82, health:78, luckyColor:'深绿', luckyNumber:4, luckyDirection:'东南',
    doList:['坚持计划','长期投入','稳步推进'], dontList:['三天打鱼','轻易放弃'], nobleSign:'属蛇、属鸡' },

  { id:33, hexagram:'䷠', hexagramName:'遁',   grade:'middle',  gradeLabel:'适时退守', gradeColor:'#A0957A',
    dailyTip: '今天主动退一步，不是输，是留力气以后赢🦊',
    poem:['遁，亨，小利贞','明哲保身非懦弱','善退以图后进步','以退为进显智慧'],
    interpretation:'遁卦主退隐保全。今日局势不利于进，适合主动退守，保存实力。以退为进，是智慧之举。',
    career:55, wealth:52, love:55, health:72, luckyColor:'灰色', luckyNumber:6, luckyDirection:'西北',
    doList:['主动退让','保存实力','修身养性'], dontList:['强行硬撑','与时局抗争'], nobleSign:'属猴、属鼠' },

  { id:34, hexagram:'䷡', hexagramName:'大壮', grade:'great',   gradeLabel:'阳刚吉',   gradeColor:'#C87E50',
    dailyTip: '今天精力充沛状态炸，但别莽，带脑子冲💥',
    poem:['大壮，利贞','雷天大壮气势宏','刚健有力勿妄动','壮而守正方为吉'],
    interpretation:'大壮卦主阳刚壮盛。今日精力充沛，行动力强。但壮盛需守正，不可鲁莽行事，以免因过刚而折。',
    career:82, wealth:75, love:70, health:90, luckyColor:'橙红', luckyNumber:9, luckyDirection:'正东',
    doList:['发挥干劲','主动出击','坚守原则'], dontList:['鲁莽冲动','恃强凌弱'], nobleSign:'属虎、属马' },

  { id:35, hexagram:'䷢', hexagramName:'晋',   grade:'great',   gradeLabel:'进升吉',   gradeColor:'#C8A96E',
    dailyTip: '今天努力会被看见，大胆秀出来🏆',
    poem:['晋，康侯用锡马蕃庶','日出东方光明升','功勋显赫受赏识','进德修业步步高'],
    interpretation:'晋卦主上升进展。今日有晋升、被认可之象。努力终得回报，贵人相助，可大胆展示实力。',
    career:88, wealth:80, love:72, health:78, luckyColor:'金黄', luckyNumber:5, luckyDirection:'正南',
    doList:['展示成果','接受赏识','积极进取'], dontList:['谦虚过度','错失机遇'], nobleSign:'属马、属猴' },

  { id:36, hexagram:'䷣', hexagramName:'明夷', grade:'warning', gradeLabel:'韬光养晦', gradeColor:'#9880B0',
    dailyTip: '今天先藏着点实力，黎明前的黑暗快过去了🌑',
    poem:['明夷，利艰贞','光明暂隐入地中','韬光养晦待时机','暗夜终将迎黎明'],
    interpretation:'明夷卦主光明受伤。今日处境艰难，不宜显露锋芒。低调隐忍，保存实力，黎明前的黑暗最深。',
    career:32, wealth:28, love:38, health:52, luckyColor:'深紫', luckyNumber:4, luckyDirection:'正南',
    doList:['低调行事','暗中积蓄','保护自己'], dontList:['显露锋芒','与强权对抗'], nobleSign:'属兔、属羊' },

  { id:37, hexagram:'䷤', hexagramName:'家人', grade:'great',   gradeLabel:'家和吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天回家陪陪家人，或者给爸妈发条消息🏠',
    poem:['家人，利女贞','家和万事兴百福','正位于内爱融融','家人相守自天成'],
    interpretation:'家人卦主家庭和谐。今日家庭事务顺遂，亲情温暖。处理家事、修复关系，皆有好结果。',
    career:70, wealth:72, love:88, health:82, luckyColor:'暖黄', luckyNumber:4, luckyDirection:'正东',
    doList:['陪伴家人','修复关系','处理家事'], dontList:['忽视家庭','与家人争吵'], nobleSign:'属狗、属鸡' },

  { id:38, hexagram:'䷥', hexagramName:'睽',   grade:'caution', gradeLabel:'求同存异', gradeColor:'#8B9EC8',
    dailyTip: '今天可能跟人意见不合，先不要吵，求同存异🔀',
    poem:['睽，小事吉','火泽相违各异趣','求同存异化干戈','小事可为大事难'],
    interpretation:'睽卦主乖违分歧。今日意见分歧较多，不宜推进大事，但处理小事还是可以。求同存异，化解矛盾。',
    career:48, wealth:45, love:45, health:65, luckyColor:'橙色', luckyNumber:3, luckyDirection:'西南',
    doList:['求同存异','处理小事','化解分歧'], dontList:['强求一致','推进大项目'], nobleSign:'属鼠、属蛇' },

  { id:39, hexagram:'䷦', hexagramName:'蹇',   grade:'caution', gradeLabel:'宜谨慎',   gradeColor:'#8B9EC8',
    dailyTip: '今天阻力有点多，慢下来反而比硬冲强🐢',
    poem:['蹇，难也，险在前也','乌云蔽日暂难明','且行且慢莫轻行','柳暗花明又一村'],
    interpretation:'蹇卦主艰难阻滞。今日运势稍有阻力，凡事三思而后行。低调行事，养精蓄锐，静待时机。',
    career:40, wealth:35, love:52, health:58, luckyColor:'白色', luckyNumber:4, luckyDirection:'西南',
    doList:['静思冥想','检视计划','照顾身体'], dontList:['签重要合同','与人争执'], nobleSign:'属鼠、属虎' },

  { id:40, hexagram:'䷧', hexagramName:'解',   grade:'great',   gradeLabel:'解脱吉',   gradeColor:'#7EB8A0',
    dailyTip: '之前那些憋着的事，今天可以放下了🕊',
    poem:['解，利西南，无所往','雷雨解散万物舒','困境解除新生机','宽宥过错自轻松'],
    interpretation:'解卦主解脱困境。今日之前的束缚、压力得以松解。宽恕他人也解放自己，新的开始到来。',
    career:75, wealth:70, love:78, health:80, luckyColor:'浅绿', luckyNumber:7, luckyDirection:'西南',
    doList:['解决积压问题','宽恕他人','轻装上阵'], dontList:['计较得失','揪住过去'], nobleSign:'属龙、属猴' },

  { id:41, hexagram:'䷨', hexagramName:'损',   grade:'middle',  gradeLabel:'损而有益', gradeColor:'#A0957A',
    dailyTip: '今天付出比收获多，但这笔账长远来看是赚的🌱',
    poem:['损，有孚，元吉','损下益上有诚信','减损过度终有益','忠信之道自光明'],
    interpretation:'损卦主减损以益。今日可能有所牺牲或付出，但这种损是值得的。舍小取大，长远来看是收益。',
    career:62, wealth:55, love:68, health:72, luckyColor:'浅棕', luckyNumber:3, luckyDirection:'东北',
    doList:['甘于付出','舍小取大','真诚奉献'], dontList:['斤斤计较','贪求回报'], nobleSign:'属牛、属狗' },

  { id:42, hexagram:'䷩', hexagramName:'益',   grade:'supreme', gradeLabel:'增益大吉', gradeColor:'#C8A96E',
    dailyTip: '今天出手做事都有加成，机不可失💎',
    poem:['益，利有攸往，利涉大川','损上益下民心归','顺风顺水百事宜','增益之时勤耕耘'],
    interpretation:'益卦主增益收获。今日诸事皆有增益，适合大胆行动、拓展版图。上天庇佑，努力皆有回报。',
    career:88, wealth:90, love:80, health:85, luckyColor:'金绿', luckyNumber:5, luckyDirection:'东南',
    doList:['大胆行动','拓展资源','抓住机遇'], dontList:['保守退缩','错失良机'], nobleSign:'属龙、属蛇' },

  { id:43, hexagram:'䷪', hexagramName:'夬',   grade:'great',   gradeLabel:'果断吉',   gradeColor:'#C87E50',
    dailyTip: '今天那个一直没下决心的事，就现在做决定✂️',
    poem:['夬，扬于王庭，孚号有厉','当机立断除积弊','果决行事不优柔','泽天夬卦扬庭决'],
    interpretation:'夬卦主果断决绝。今日需要做出决断，不可优柔寡断。坦诚面对问题，果断处置，方能突破。',
    career:82, wealth:78, love:65, health:78, luckyColor:'橙红', luckyNumber:9, luckyDirection:'正西',
    doList:['果断决策','坦诚沟通','清除积弊'], dontList:['优柔寡断','姑息养奸'], nobleSign:'属马、属虎' },

  { id:44, hexagram:'䷫', hexagramName:'姤',   grade:'caution', gradeLabel:'防患未然', gradeColor:'#8B9EC8',
    dailyTip: '今天遇到太好的机会先别急，仔细看看有没有坑⚠️',
    poem:['姤，女壮，勿用取女','偶遇之中含险机','防微杜渐慎初遇','一阴始生万物变'],
    interpretation:'姤卦主偶遇邂逅。今日可能有意外的相遇或机遇，但需谨慎辨别。美丽的外表下可能藏有玄机。',
    career:55, wealth:50, love:58, health:68, luckyColor:'淡紫', luckyNumber:6, luckyDirection:'正西',
    doList:['谨慎甄别','防微杜渐','保持清醒'], dontList:['轻信陌生人','冲动决定'], nobleSign:'属蛇、属羊' },

  { id:45, hexagram:'䷬', hexagramName:'萃',   grade:'great',   gradeLabel:'聚气吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天人气旺，把大家聚在一起能做成大事🎊',
    poem:['萃，聚也，顺以说','群英荟萃聚一堂','众人拾柴火焰高','合力同心福运旺'],
    interpretation:'萃卦主聚集汇合。今日人气旺盛，适合召集团队，开展需要多方协作的事务，集体力量超乎预期。',
    career:82, wealth:75, love:78, health:70, luckyColor:'紫色', luckyNumber:5, luckyDirection:'西南',
    doList:['召开会议','发起活动','广结人缘'], dontList:['孤立行动','排斥异见'], nobleSign:'属鼠、属兔' },

  { id:46, hexagram:'䷭', hexagramName:'升',   grade:'great',   gradeLabel:'升进吉',   gradeColor:'#C8A96E',
    dailyTip: '今天一步一步来，升的是真的升📈',
    poem:['升，元亨，用见大人','地中生木渐升高','推诚见大人有利','循序渐进步步升'],
    interpretation:'升卦主上升进取。今日有逐步上升之象，脚踏实地，循序渐进，拜访上级或贵人效果极好。',
    career:85, wealth:78, love:70, health:78, luckyColor:'草绿', luckyNumber:6, luckyDirection:'正南',
    doList:['循序渐进','拜访贵人','积极进取'], dontList:['急于求成','跳级冒进'], nobleSign:'属牛、属蛇' },

  { id:47, hexagram:'䷮', hexagramName:'困',   grade:'caution', gradeLabel:'处困待时', gradeColor:'#8B9EC8',
    dailyTip: '今天有点被困住了，先停下来，别乱动🔒',
    poem:['困，刚掩也','困境之中藏生机','君子处困守其志','静待花开自有时'],
    interpretation:'困卦主困境压抑。今日感到受限或疲惫，不必强行突破。保存实力，等待时机，困境自会化解。',
    career:38, wealth:32, love:48, health:55, luckyColor:'灰白', luckyNumber:2, luckyDirection:'正西',
    doList:['保存体力','整理内心','寻找出路'], dontList:['急于求成','与人争斗'], nobleSign:'属龙、属牛' },

  { id:48, hexagram:'䷯', hexagramName:'井',   grade:'middle',  gradeLabel:'涵养积累', gradeColor:'#7EA8C8',
    dailyTip: '今天适合打磨内功，你的底子越厚，以后越稳💧',
    poem:['井，改邑不改井','井水长清润四方','涵养深厚自持正','取之不竭源头活'],
    interpretation:'井卦主涵养根源。今日适合深耕积累，修炼内功。外在变化不影响内心根基，厚积方能薄发。',
    career:68, wealth:62, love:65, health:80, luckyColor:'深绿', luckyNumber:6, luckyDirection:'正北',
    doList:['深耕专业','修炼内功','稳固根基'], dontList:['急功近利','忽视基础'], nobleSign:'属牛、属猪' },

  { id:49, hexagram:'䷰', hexagramName:'革',   grade:'great',   gradeLabel:'革新吉',   gradeColor:'#C87E50',
    dailyTip: '今天旧的不去新的不来，大胆变一变🔄',
    poem:['革，已日乃孚，元亨利贞','革故鼎新天命改','顺应时势大变革','水火相息化新机'],
    interpretation:'革卦主变革创新。今日是推动改变的好时机。旧的不去新的不来，敢于改革，顺应时势，大有可为。',
    career:85, wealth:80, love:72, health:78, luckyColor:'橙色', luckyNumber:9, luckyDirection:'正西',
    doList:['推动改变','革除旧习','拥抱新事物'], dontList:['因循守旧','抗拒变化'], nobleSign:'属马、属虎' },

  { id:50, hexagram:'䷱', hexagramName:'鼎',   grade:'supreme', gradeLabel:'鼎盛大吉', gradeColor:'#C8A96E',
    dailyTip: '今天是你的高光时刻，好好发光吧👑',
    poem:['鼎，元吉，亨','鼎新革故文明著','以木巽火养圣贤','功业鼎盛名远播'],
    interpretation:'鼎卦主鼎盛文明。今日事业功成名就，处于鼎盛时期。巩固成果，发挥影响力，名望进一步提升。',
    career:92, wealth:85, love:75, health:82, luckyColor:'金色', luckyNumber:5, luckyDirection:'正南',
    doList:['巩固成果','发挥影响','展示实力'], dontList:['骄傲自满','忽视危机'], nobleSign:'属蛇、属马' },

  { id:51, hexagram:'䷲', hexagramName:'震',   grade:'caution', gradeLabel:'震后自省', gradeColor:'#9880B0',
    dailyTip: '今天可能会被突然吓到，冷静一下，反而是转机⚡',
    poem:['震，亨，震来虩虩','雷声震动天地间','惊而后省得安然','恐惧修省福自来'],
    interpretation:'震卦主震动惊醒。今日可能遭遇突发情况，以惊为戒，冷静应对。惊后反省，往往是成长契机。',
    career:45, wealth:38, love:45, health:52, luckyColor:'暗红', luckyNumber:1, luckyDirection:'正东',
    doList:['冷静应对','事后反思','做好备案'], dontList:['慌乱决策','逃避问题'], nobleSign:'属虎、属马' },

  { id:52, hexagram:'䷳', hexagramName:'艮',   grade:'middle',  gradeLabel:'平稳守正', gradeColor:'#A0957A',
    dailyTip: '今天静下来就好，不是所有事都需要立刻行动🗻',
    poem:['艮，止也，时止则止','平湖秋月映长空','波澜不惊自从容','守得云开见月明'],
    interpretation:'艮卦主静止守本。今日平稳，不宜大动作。积蓄能量，沉淀思考，守本分，待时丰。',
    career:62, wealth:55, love:68, health:80, luckyColor:'米色', luckyNumber:5, luckyDirection:'东北',
    doList:['学习充电','整理思路','早睡早起'], dontList:['轻率决策','过度消耗'], nobleSign:'属马、属狗' },

  { id:53, hexagram:'䷴', hexagramName:'渐',   grade:'great',   gradeLabel:'渐进吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天慢慢来，这件事急不来，但你在进步🦢',
    poem:['渐，女归吉，利贞','鸿雁渐进高处栖','循序渐进终有成','婚嫁迁居皆顺遂'],
    interpretation:'渐卦主渐进有序。今日适合按部就班，循序推进。婚嫁、搬迁、晋升等大事皆有顺遂之兆。',
    career:78, wealth:72, love:85, health:78, luckyColor:'浅蓝', luckyNumber:3, luckyDirection:'东北',
    doList:['循序渐进','按计划行事','稳步推进'], dontList:['跳跃冒进','急于求成'], nobleSign:'属鸡、属狗' },

  { id:54, hexagram:'䷵', hexagramName:'归妹', grade:'caution', gradeLabel:'慎重感情', gradeColor:'#8B9EC8',
    dailyTip: '今天感情上别冲动，名分没搞清楚先别行动💔',
    poem:['归妹，征凶，无攸利','感情之事须慎重','名分不正事难成','以礼相待方无咎'],
    interpretation:'归妹卦主感情需谨慎。今日感情事务需格外注意名分与礼节。名不正则言不顺，以诚以礼为先。',
    career:50, wealth:48, love:45, health:65, luckyColor:'淡粉', luckyNumber:2, luckyDirection:'正西',
    doList:['以礼相待','明确关系','诚实沟通'], dontList:['名分不正','感情冲动'], nobleSign:'属蛇、属兔' },

  { id:55, hexagram:'䷶', hexagramName:'丰',   grade:'great',   gradeLabel:'丰收吉',   gradeColor:'#C8A96E',
    dailyTip: '今天是收获期，你付出的都在今天兑现了🌾',
    poem:['丰，大也，明以动','丰收在望稻花香','光明磊落天地宽','盛极之时守其正'],
    interpretation:'丰卦主丰盛光明。今日成果显著，努力得到认可。正值巅峰，保持谦逊，勿因盛而骄。',
    career:88, wealth:82, love:70, health:78, luckyColor:'金黄', luckyNumber:9, luckyDirection:'正南',
    doList:['展示成果','感恩付出','居安思危'], dontList:['得意忘形','忽视根基'], nobleSign:'属马、属狗' },

  { id:56, hexagram:'䷷', hexagramName:'旅',   grade:'middle',  gradeLabel:'旅途平稳', gradeColor:'#A0957A',
    dailyTip: '今天适合走走看看，换个环境换个心情🧳',
    poem:['旅，小亨，旅贞吉','行走天涯自在身','过客匆匆莫贪恋','随遇而安是真人'],
    interpretation:'旅卦主行旅在外。今日有变动之象，可能需要离开舒适圈。保持灵活，不强求，随遇而安。',
    career:65, wealth:60, love:55, health:70, luckyColor:'棕色', luckyNumber:5, luckyDirection:'西方',
    doList:['适应变化','保持灵活','轻装前行'], dontList:['过于执着','强留不去'], nobleSign:'属马、属猴' },

  { id:57, hexagram:'䷸', hexagramName:'巽',   grade:'middle',  gradeLabel:'柔顺渗透', gradeColor:'#A0957A',
    dailyTip: '今天温柔但坚定，润物细无声反而最有效🌬',
    poem:['巽，小亨，利有攸往','巽风无声透万物','柔顺渗透成大事','重巽以申命令行'],
    interpretation:'巽卦主柔顺渗透。今日以柔克刚，温和而坚定地推进事务。潜移默化，不知不觉达成目标。',
    career:70, wealth:65, love:72, health:75, luckyColor:'浅绿', luckyNumber:4, luckyDirection:'东南',
    doList:['温和推进','以柔克刚','耐心渗透'], dontList:['强硬对抗','急于求成'], nobleSign:'属鸡、属蛇' },

  { id:58, hexagram:'䷹', hexagramName:'兑',   grade:'great',   gradeLabel:'悦泽吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天嘴巴开了光，说什么都有人听😄',
    poem:['兑，亨，利贞','悦泽相和喜气生','口才出众利沟通','和悦处世福无穷'],
    interpretation:'兑卦主喜悦和谐。今日人际关系融洽，口才出众，适合沟通、谈判、演讲。喜悦具有感染力。',
    career:80, wealth:75, love:85, health:80, luckyColor:'湖蓝', luckyNumber:2, luckyDirection:'正西',
    doList:['愉快沟通','表达喜悦','增进感情'], dontList:['言语刻薄','散布负能量'], nobleSign:'属羊、属猴' },

  { id:59, hexagram:'䷺', hexagramName:'涣',   grade:'middle',  gradeLabel:'涣散需聚', gradeColor:'#7EA8C8',
    dailyTip: '今天有点涣散，找一个共同目标把大家凝聚起来🌊',
    poem:['涣，亨，王假有庙','风行水上涣散形','聚合人心化涣散','立庙号令重凝聚'],
    interpretation:'涣卦主涣散离析。今日人心散漫，需要重新凝聚。通过共同目标或精神信仰，把力量集中起来。',
    career:60, wealth:58, love:62, health:70, luckyColor:'天蓝', luckyNumber:7, luckyDirection:'正东',
    doList:['重塑共识','凝聚人心','明确方向'], dontList:['放任散漫','忽视团队'], nobleSign:'属猪、属鼠' },

  { id:60, hexagram:'䷻', hexagramName:'节',   grade:'middle',  gradeLabel:'节制有度', gradeColor:'#A0957A',
    dailyTip: '今天管住自己，别买不需要的，别说不该说的🎋',
    poem:['节，亨，苦节不可贞','水满则溢需有节','节制有度万事宜','甘节乃得中道行'],
    interpretation:'节卦主节制有度。今日凡事适可而止，无论工作、消费还是情感，过犹不及。节制是最大的智慧。',
    career:68, wealth:62, love:65, health:78, luckyColor:'白色', luckyNumber:6, luckyDirection:'正北',
    doList:['适可而止','节制消费','有节有度'], dontList:['过度放纵','走极端'], nobleSign:'属鼠、属猪' },

  { id:61, hexagram:'䷼', hexagramName:'中孚', grade:'great',   gradeLabel:'诚信吉',   gradeColor:'#7EB8A0',
    dailyTip: '今天真诚是最好的策略，装的都没用🕊',
    poem:['中孚，豚鱼吉，利涉大川','至诚感通天地应','内心诚信无欺伪','孚及豚鱼何况人'],
    interpretation:'中孚卦主至诚信实。今日以真诚之心处事，必能打动他人。诚信是今日最大的财富与武器。',
    career:80, wealth:75, love:85, health:80, luckyColor:'白色', luckyNumber:2, luckyDirection:'正东',
    doList:['以诚待人','信守承诺','真诚表达'], dontList:['虚伪欺诈','言而无信'], nobleSign:'属猪、属兔' },

  { id:62, hexagram:'䷽', hexagramName:'小过', grade:'middle',  gradeLabel:'小事可为', gradeColor:'#A0957A',
    dailyTip: '今天先把手边的小事做完，大事等状态好了再说🐦',
    poem:['小过，亨，利贞','飞鸟遗音不宜上','小事可为大事难','过中守正自无咎'],
    interpretation:'小过卦主小事可成。今日不宜谋大，但处理日常小事效果极好。脚踏实地，先完成手边的事情。',
    career:62, wealth:58, love:65, health:72, luckyColor:'浅棕', luckyNumber:4, luckyDirection:'西南',
    doList:['处理日常','完成小事','稳扎稳打'], dontList:['谋划大事','好高骛远'], nobleSign:'属蛇、属兔' },

  { id:63, hexagram:'䷾', hexagramName:'既济', grade:'great',   gradeLabel:'成事吉',   gradeColor:'#C8A96E',
    dailyTip: '今天事情会有结果，收尾做好，别在最后掉链子🎯',
    poem:['既济，亨小，利贞','功成名就莫骄矜','水火相济事竟成','守正持续福悠长'],
    interpretation:'既济卦主事已完成。今日有收尾、结果之兆。已进行的事项将有好的结果，但需防止松懈。',
    career:85, wealth:80, love:75, health:82, luckyColor:'红色', luckyNumber:7, luckyDirection:'东北',
    doList:['收尾项目','总结复盘','庆祝小成'], dontList:['骄傲自满','放松警惕'], nobleSign:'属牛、属虎' },

  { id:64, hexagram:'䷿', hexagramName:'未济', grade:'middle',  gradeLabel:'继续前行', gradeColor:'#7EA8C8',
    dailyTip: '还没到终点，但你在路上，这本身就很好🌈',
    poem:['未济，亨，小狐汔济','事未成时勿气馁','未济之中蕴转机','再接再厉终成功'],
    interpretation:'未济卦主尚未完成。今日事务还在进行中，结果尚未明朗。不要气馁，继续努力，成功就在前方。',
    career:65, wealth:62, love:68, health:72, luckyColor:'深蓝', luckyNumber:3, luckyDirection:'正北',
    doList:['坚持不懈','继续努力','保持信心'], dontList:['半途而废','悲观放弃'], nobleSign:'属狐、属马' },
];

export function getTodayFortune(): Fortune {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
}

export function getRandomFortune(excludeId?: number): Fortune {
  const pool = excludeId !== undefined
    ? FORTUNES.filter(f => f.id !== excludeId)
    : FORTUNES;
  return pool[Math.floor(Math.random() * pool.length)];
}
