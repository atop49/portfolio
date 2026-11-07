# 个人作品网站 · 胶片

一条悬浮在暗房里的胶片带：左端贴近镜头，右端退进深处，滚轮向下推动整条胶片向左滑，卡片一路从深处滑到面前并放大显影——永不到头。

作品按帧排列，点开任意一帧会展开检片台：大幅剧照、项目说明，以及一个只有文字、竖线和加号的 **EXPLORE** 触发器。悬停它，加号会旋转成一个绿色播放键。

## 技术栈

- **Next.js 16**（App Router / Turbopack）
- **React 19** + **TypeScript**（strict）
- **Tailwind CSS v4**（自定义 token，非默认色板）
- **GSAP**（滚轮驱动的横向位移、阻尼、Flip 进出检片台）

## 本地运行

`ash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
`

## 目录

`
src/app/          App Router 入口与全局布局
src/components/   SiteShell / FilmStrip / FrameCard / ExploreTrigger / 各视图
src/lib/          标题断行等纯函数
src/styles/       globals.css：token 体系、胶片材质、检片台、刻度尺
public/           插画（每帧 1600×900 的矢量剧照）
`

## 交互要点

- **滚轮驱动**：胶片由 wheel 直接驱动，不是页面滚动；桌面端在 projects 视图里页面本身不滚动。
- **无限循环**：轨道渲染三份相同的帧，向左滑出一整段后瞬时平移回来，肉眼无缝。
- **左近右远**：透视原点在画面左缘，旋转轴跟着视口走，纵深只由"卡片离左缘多远"决定。
- **降级**：≤1023px 退回原生横向滑动；prefers-reduced-motion 退回普通纵向文档流。

## 相关项目

胶片里的四个应用各自独立成库：

| 项目 | 仓库 |
| --- | --- |
| 待办事项 Studio | [todo-studio](https://github.com/atop49/todo-studio) |
| Markdown 笔记 Studio | [notes-studio](https://github.com/atop49/notes-studio) |
| 番茄钟 Studio | [pomodoro-studio](https://github.com/atop49/pomodoro-studio) |
| 天气 Studio | [weather-studio](https://github.com/atop49/weather-studio) |