/**
 * 检片台左侧「项目档案」的数据。
 *
 * 与 PROJECTS 分开放：胶片带只关心卡片上那几个字段，档案是详情页才需要的
 * 长文本，放在一起会让 film-strip.tsx 里的数据表变得难读。两边靠 id 对齐，
 * 在 film-strip.tsx 里 merge 回 Project 对象。
 */
export type DossierStep = {
  /** 两位序号，等宽显示。 */
  step: string;
  title: string;
  desc: string;
};

export type DossierChange = {
  version: string;
  date: string;
  desc: string;
};

export type Dossier = {
  /** 100~200 字的详细介绍。 */
  longDescription: string;
  /** 技术栈 / 制作手段。 */
  techStack: string[];
  process: DossierStep[];
  changelog: DossierChange[];
};

export const DOSSIERS: Record<string, Dossier> = {
  "01": {
    longDescription:
      "把剪辑软件的时间线搬进待办清单：每条任务都是一段素材，带着分类色块、优先级微记和截止时间码。列表按优先级与截止日两级排序，完成时整行向右划出并淡掉，像把素材拖出时间线。筛选栏支持标题模糊搜索与分类、状态、优先级三重叠加，所有条件收在同一个 store 里，切换视图不丢状态；数据落在本机，刷新即恢复。",
    techStack: ["React", "TypeScript", "Zustand", "Tailwind CSS", "date-fns", "Vite"],
    process: [
      {
        step: "01",
        title: "需求拆解",
        desc: "把「待办」拆成捕获、排序、完成三段，先定字段再谈界面。",
      },
      {
        step: "02",
        title: "状态建模",
        desc: "一个 store 承载增删改查与三重筛选，选择器只暴露派生结果。",
      },
      {
        step: "03",
        title: "交互打磨",
        desc: "完成态用位移加透明度收尾，避免弹窗式的打断。",
      },
      {
        step: "04",
        title: "边界处理",
        desc: "脏截止日期用 safeParse 兜底，persist 的 migrate 负责清洗旧数据。",
      },
    ],
    changelog: [
      { version: "v1.2", date: "2026-10", desc: "加入关键词搜索与三档筛选" },
      { version: "v1.1", date: "2026-09", desc: "接入 LocalStorage 持久化" },
      { version: "v1.0", date: "2026-08", desc: "首版上线" },
    ],
  },
  "02": {
    longDescription:
      "一张明亮书桌：左边是等宽字稿纸，右边是杂志排版的实时预览，代码块用 oneLight 亮色主题，行内语法在输入时就完成着色。笔记以书架形式归拢，标题与正文都能即时搜索，选中即读、随时新建。整个应用没有弹窗，编辑与预览始终并置，写作时视线不需要离开纸面。",
    techStack: ["React", "TypeScript", "react-markdown", "rehype-highlight", "Vite"],
    process: [
      {
        step: "01",
        title: "版式研究",
        desc: "参照纸质笔记本的行高与页边，先定版心，再定组件尺寸。",
      },
      {
        step: "02",
        title: "编辑器",
        desc: "纯 textarea 加受控状态，拒绝富文本带来的不可控。",
      },
      {
        step: "03",
        title: "预览管线",
        desc: "react-markdown 起步，再自定义代码块与引用块的排版。",
      },
      {
        step: "04",
        title: "书架结构",
        desc: "左侧卡片化作书脊，搜索直接过滤书架而不是跳到结果页。",
      },
    ],
    changelog: [
      { version: "v1.2", date: "2026-10", desc: "侧栏搜索与书架分组" },
      { version: "v1.1", date: "2026-09", desc: "oneLight 代码高亮" },
      { version: "v1.0", date: "2026-08", desc: "首版上线" },
    ],
  },
  "03": {
    longDescription:
      "一整页留白，中央只悬一只橙色圆环。专注 25 分钟、休息 5 分钟，切换时圆环缓慢补齐；暂停时钟面数字轻轻呼吸，到点用一次短促的跳动和提示音收束。计时以结束时间戳为锚，切到后台再回来不会漂移；今日完成的番茄数记在本机，跨天自动归零。",
    techStack: ["React", "TypeScript", "Web Audio API", "Notification API", "Vite"],
    process: [
      {
        step: "01",
        title: "节奏设计",
        desc: "先确定 25/5 的切换语义，再谈视觉，避免动画先于逻辑。",
      },
      {
        step: "02",
        title: "计时锚点",
        desc: "用结束时间戳反推剩余秒数，休眠与切页都不会走样。",
      },
      {
        step: "03",
        title: "圆环与提示",
        desc: "SVG 的 stroke-dashoffset 驱动进度，Web Audio 合成一声木质轻响。",
      },
      {
        step: "04",
        title: "统计与重置",
        desc: "今日计数存本机，跨天按日期键自动清空。",
      },
    ],
    changelog: [
      { version: "v1.2", date: "2026-10", desc: "今日统计与跨天重置" },
      { version: "v1.1", date: "2026-09", desc: "时间戳锚定计时，后台不漂移" },
      { version: "v1.0", date: "2026-08", desc: "首版上线" },
    ],
  },
  "04": {
    longDescription:
      "亮色玻璃拟态的天气台。晨光磨砂卡片浮在纸白地面上，超大温度读数占据视觉中心，右侧是五日预报的横滚条。搜索、定位、收藏三种取数方式并列，任何一次请求失败都会落到明确的重试靶点上；加载时先用骨架屏占位，避免读数在落位前跳动。",
    techStack: ["React", "TypeScript", "OpenWeatherMap API", "Vite"],
    process: [
      {
        step: "01",
        title: "信息层级",
        desc: "温度、天气、体感、预报四层，按阅读顺序而不是数据顺序排布。",
      },
      {
        step: "02",
        title: "玻璃拟态",
        desc: "backdrop-filter 叠纸白底，模糊半径与描边一起调，避免雾感。",
      },
      {
        step: "03",
        title: "数据与错误态",
        desc: "统一 fetch 包装，错误、空结果、限流各有自己的文案与重试。",
      },
      {
        step: "04",
        title: "收藏与定位",
        desc: "收藏城市存本机，定位走浏览器 API 并且允许随时退出。",
      },
    ],
    changelog: [
      { version: "v1.2", date: "2026-10", desc: "收藏城市与地理定位" },
      { version: "v1.1", date: "2026-09", desc: "骨架屏与错误重试" },
      { version: "v1.0", date: "2026-08", desc: "首版上线" },
    ],
  },
  "05": {
    longDescription:
      "一部关于退潮的短片。镜头贴着沙面跟拍，潮水带走脚印的一瞬间被放慢到几乎静止；声音先行，浪声在画面变黑之后仍持续了八秒。全片用 16mm 拍摄，冲印时故意保留划痕与药膜不均，让「被海水洗过」这件事留在胶片上。",
    techStack: ["16mm 胶片", "DaVinci Resolve", "Ableton Live"],
    process: [
      {
        step: "01",
        title: "勘景",
        desc: "连续七天记录同一片滩涂的潮位与光位，挑出退潮最慢的一小时。",
      },
      {
        step: "02",
        title: "拍摄",
        desc: "全手持，贴着水面 20cm 以内完成，让浪声贴着耳朵。",
      },
      {
        step: "03",
        title: "冲印",
        desc: "手冲保留划痕与药膜不均，不做数字修复。",
      },
      {
        step: "04",
        title: "声音",
        desc: "现场声与合成低频分层，收尾留八秒纯声。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2026-06", desc: "重制声轨" },
      { version: "v1.0", date: "2026-03", desc: "首映" },
    ],
  },
  "06": {
    longDescription:
      "跟随夜间货机穿越三座城市的纪录片。全片在 22:00 之后拍摄：塔台的绿光、跑道的边灯、机坪上最后一盏没关的灯，构成一条从起飞到降落的夜线。没有旁白，只有无线电通话与引擎声推动叙事，地面段落用固定机位等待，把时间交还给等待本身。",
    techStack: ["Sony FX3", "DaVinci Resolve", "Pro Tools"],
    process: [
      {
        step: "01",
        title: "联络与报备",
        desc: "提前两个月对接机场与航司，确定可拍摄的时段与机位。",
      },
      {
        step: "02",
        title: "夜拍",
        desc: "高感光配大光圈定焦，尽量保留现场光源的原色。",
      },
      {
        step: "03",
        title: "剪辑",
        desc: "以一次完整航班的时序为骨架，插入地面等待段落。",
      },
      {
        step: "04",
        title: "调色",
        desc: "压暗高光，让塔台绿与跑道暖黄各自成段。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2026-01", desc: "补拍塔台段落" },
      { version: "v1.0", date: "2025-11", desc: "完成" },
    ],
  },
  "07": {
    longDescription:
      "用 16mm 残片重写一封没有地址的信。画面在显影液里缓慢浮出，又在下一格迅速褪去，字迹始终读不全——像一封被反复展开又折起的信。全片没有对白，只有纸上的书写声与呼吸，剪辑刻意不接顺，让每一次显影都停在半途。",
    techStack: ["16mm 残片", "手冲显影", "After Effects"],
    process: [
      {
        step: "01",
        title: "素材整理",
        desc: "收集旧片残段，按密度与划痕分类，决定每段的显影时间。",
      },
      {
        step: "02",
        title: "手工显影",
        desc: "控制温度与时间，让画面停在将出未出的半显影状态。",
      },
      {
        step: "03",
        title: "逐格扫描",
        desc: "4K 逐格扫描，保留片基纹理与齿孔，不做去噪。",
      },
      {
        step: "04",
        title: "声音拼贴",
        desc: "书写、翻页、呼吸三层叠加，全片没有配乐。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2025-12", desc: "重扫 4K 版本" },
      { version: "v1.0", date: "2025-08", desc: "首映" },
    ],
  },
  "08": {
    longDescription:
      "记录城乡接合部夜间灯火的摄影系列。拍摄点选在地铁末站之外，那里楼与田并存，路灯与虫鸣同时存在。每一扇亮着的窗都被当作城市的一条边界；画面保持中性灰，只让灯光的色温说话，允许轻微失焦与抖动留在照片里。",
    techStack: ["35mm", "Portra 400", "Lightroom"],
    process: [
      {
        step: "01",
        title: "踩点",
        desc: "沿末班地铁线路步行，标记可拍摄的天台、路口与断头路。",
      },
      {
        step: "02",
        title: "夜拍",
        desc: "全开光圈手持，允许轻微失焦与抖动，不追求锐利。",
      },
      {
        step: "03",
        title: "选片",
        desc: "按窗的形状与密度排序，而不是按拍摄地点。",
      },
      {
        step: "04",
        title: "输出",
        desc: "统一灰阶，只保留灯光本身的偏色。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2025-03", desc: "增补 12 张" },
      { version: "v1.0", date: "2024-11", desc: "首次展出" },
    ],
  },
  "09": {
    longDescription:
      "一个夏天午后，四个人在同一间屋子里等待。风扇转动，窗帘被风顶起来又落下，时间几乎停住。全片 27 分钟，只有一个长镜头与四次极短的切出，所有叙事都发生在空气的流动里；台词压到最少，剩下的交给呼吸与椅子的吱呀声。",
    techStack: ["Digital Bolex", "DaVinci Resolve"],
    process: [
      {
        step: "01",
        title: "剧本",
        desc: "只写「等待」这一件事，把冲突从对话挪到空间里。",
      },
      {
        step: "02",
        title: "排练",
        desc: "让演员熟悉这间屋子的动线，而不是背台词。",
      },
      {
        step: "03",
        title: "拍摄",
        desc: "一个下午，一镜到底，四次补拍切出镜头。",
      },
      {
        step: "04",
        title: "剪辑",
        desc: "保留呼吸与风扇的节奏，不为了让观众坐得住而加快切。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2025-05", desc: "重新调色" },
      { version: "v1.0", date: "2024-09", desc: "完成" },
    ],
  },
  "10": {
    longDescription:
      "在废弃剧院里搭建的声音装置。观众走入空场，脚步声被接触式麦克风拾取、延迟、再放大，变成一场没有乐手的演出。无人时装置也会持续发出极低的底噪，像建筑自己在呼吸；八只音箱环绕，把观众的位置变成声场的一部分。",
    techStack: ["Max/MSP", "接触式麦克风", "Ableton Live"],
    process: [
      {
        step: "01",
        title: "空间测量",
        desc: "测混响时间与驻波点，据此决定音箱与拾音器的落位。",
      },
      {
        step: "02",
        title: "采样",
        desc: "采集脚步、门轴、座椅翻动三类声音作为原料。",
      },
      {
        step: "03",
        title: "装置搭建",
        desc: "八只音箱环绕，拾音器埋在观众的必经动线上。",
      },
      {
        step: "04",
        title: "调音",
        desc: "把反馈回路推到将啸未啸的临界点，留出呼吸余量。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2024-06", desc: "增加第二声部" },
      { version: "v1.0", date: "2023-12", desc: "展出" },
    ],
  },
  "11": {
    longDescription:
      "沿北纬三十度线拍摄的地理纪录片。从高原的雪线一路向东到入海口，同一条纬线串起牧区、工厂、湿地与港口。摄制组用一年时间在同一纬度上往返，用季节与海拔的差异代替解说词；七段故事并行推进，地平线始终保持在画面的同一个高度。",
    techStack: ["Sony FX6", "DJI Mavic 3", "DaVinci Resolve"],
    process: [
      {
        step: "01",
        title: "路线",
        desc: "按海拔与季节切分段落，刻意避开旅游季与热门取景点。",
      },
      {
        step: "02",
        title: "拍摄",
        desc: "地面与航拍交替，全片维持同一条地平线高度。",
      },
      {
        step: "03",
        title: "结构",
        desc: "以纬度推进代替时间线，七段并行，不设主次。",
      },
      {
        step: "04",
        title: "混音",
        desc: "环境声贯穿全片，音乐只在转场出现。",
      },
    ],
    changelog: [
      { version: "v1.1", date: "2025-02", desc: "补拍入海口段落" },
      { version: "v1.0", date: "2023-11", desc: "首映" },
    ],
  },
};
