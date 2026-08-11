import { toFa } from '@/lib/utils';

/**
 * نمودار میله‌ای ساده با SVG — بدون هیچ کتابخانه‌ای، پس حجمی به پنل اضافه نمی‌کند.
 * series: [{ day: 'YYYY-MM-DD', views, visitors }]
 */
export default function StatsChart({ series = [] }) {
  if (!series.length) return null;

  const W = 900;
  const H = 240;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;

  const max = Math.max(1, ...series.map((d) => d.views));
  const barW = (W - padX * 2) / series.length;
  const scale = (v) => ((H - padTop - padBottom) * v) / max;

  const label = (day) => {
    const d = new Date(`${day}T00:00:00Z`);
    try {
      return toFa(new Intl.DateTimeFormat('fa-IR', { month: 'numeric', day: 'numeric' }).format(d));
    } catch {
      return day.slice(5);
    }
  };

  // فقط چند برچسب روی محور افقی تا شلوغ نشود
  const step = Math.ceil(series.length / 8);

  return (
    <figure className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-60 w-full min-w-[560px]"
        role="img"
        aria-label={`نمودار بازدید ${toFa(series.length)} روز گذشته`}
      >
        {/* خطوط راهنما */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padTop + (H - padTop - padBottom) * (1 - f);
          return (
            <g key={f}>
              <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="#E7E2DA" strokeWidth="1" />
              <text x={W - padX} y={y - 4} textAnchor="end" fontSize="10" fill="#565D58">
                {toFa(Math.round(max * f))}
              </text>
            </g>
          );
        })}

        {series.map((d, i) => {
          const h = scale(d.views);
          const hv = scale(d.visitors);
          const x = padX + i * barW;
          const y = H - padBottom - h;
          const yv = H - padBottom - hv;
          const w = Math.max(2, barW * 0.55);
          const cx = x + (barW - w) / 2;

          return (
            <g key={d.day}>
              <title>{`${label(d.day)} — ${toFa(d.views)} بازدید، ${toFa(d.visitors)} بازدیدکننده`}</title>
              {/* بازدید کل */}
              <rect x={cx} y={y} width={w} height={Math.max(h, d.views ? 2 : 0)} rx="3" fill="#C2D2C7" />
              {/* بازدیدکننده یکتا */}
              <rect x={cx} y={yv} width={w} height={Math.max(hv, d.visitors ? 2 : 0)} rx="3" fill="#4A6152" />
              {i % step === 0 ? (
                <text x={cx + w / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#565D58">
                  {label(d.day)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-3 flex items-center gap-5 text-[12px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-sage-600" /> بازدیدکننده یکتا
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-sage-200" /> کل بازدید صفحات
        </span>
      </figcaption>
    </figure>
  );
}
