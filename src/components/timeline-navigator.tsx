"use client";

/**
 * TimelineNavigator —— 一条精密的胶片刻度尺。
 *
 * 结构：当前索引 · 选区框 · 总帧数 · 刻度阵列。
 * 刻度数量严格等于项目数，一根线就是一帧；点哪根，胶片带就滑到哪一帧。
 * 它只做导航与状态显示，不参与视觉叙事——所以极细、极静、
 * 只在鼠标经过时"呼吸"一次。
 */

type TimelineNavigatorProps = {
  /** 项目总数，决定刻度线的数量。 */
  total: number;
  /** 当前停在焦点位的项目下标（0 起）。 */
  active: number;
  /** 点击某根刻度线时回调。 */
  onNavigate: (index: number) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");

export default function TimelineNavigator({
  total,
  active,
  onNavigate,
}: TimelineNavigatorProps) {
  const safeActive = Math.min(Math.max(active, 0), Math.max(total - 1, 0));

  return (
    <div className="timeline-nav" role="group" aria-label="胶片刻度导航">
      <span className="timeline-nav-index" aria-hidden="true">
        {pad(safeActive + 1)}
      </span>

      {/* 极简空心框：当前选区的取景窗，不做任何填充。 */}
      <span className="timeline-nav-frame" aria-hidden="true" />

      <span className="timeline-nav-total" aria-hidden="true">
        {pad(total)}
      </span>

      <div className="timeline-nav-ticks">
        {Array.from({ length: total }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`timeline-nav-tick${
              index === safeActive ? " is-active" : ""
            }`}
            onClick={() => onNavigate(index)}
            aria-label={`跳转到第 ${index + 1} 个项目`}
            aria-current={index === safeActive ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
