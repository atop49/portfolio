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
  /** 更新日志，暂时留空，按 { version, date, desc } 追加。 */
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
    changelog: [],
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
    changelog: [],
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
    changelog: [],
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
    changelog: [],
  },
  "05": {
    longDescription:
      "一颗专为看流星雨做的小站。首页把最近的一场雨变成倒计时，往下是全年雨历、ZHR 曲线与「年度最值得关注」的筛选卡片；详情页再展开观测窗口、辐射点方位和当夜天气条件。3D 轨道视图用 three.js 画地球公转与彗星尘带，模拟观测画布则把辐射点、流星数量与曝光时间实时演算出来，力求让「什么时候、朝哪看」这件事一眼可读。",
    techStack: ["React", "TypeScript", "three.js", "Recharts", "Vite"],
    process: [
      {
        step: "01",
        title: "数据先行",
        desc: "先把流星雨母体、辐射点、ZHR 与峰值窗口整理成一份可查的本地数据，界面才开始动手。",
      },
      {
        step: "02",
        title: "倒计时与时区",
        desc: "峰值按 UTC 存，展示时换算到本地时区，跨时区访问也不会错一天。",
      },
      {
        step: "03",
        title: "3D 轨道视图",
        desc: "three.js 里画地球公转轨道与尘带交会点，鼠标可拖动视角，标出辐射点方向。",
      },
      {
        step: "04",
        title: "观测条件",
        desc: "把云量、月相、光污染合成为一句建议，而不是让读者自己去拼参数。",
      },
    ],
    changelog: [],
  },
};
