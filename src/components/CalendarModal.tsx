import { useCalendar, type DayInfo } from '../hooks/useCalendar';

interface CalendarModalProps {
  onClose: () => void;
  onPlayDaily: (dateStr: string) => void;
  onPlayMakeup: (dateStr: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function DayCell({ day, onPlayDaily, onPlayMakeup }: {
  day: DayInfo;
  onPlayDaily: (d: string) => void;
  onPlayMakeup: (d: string) => void;
}) {
  if (day.day === 0) {
    return <div className="aspect-square" />;
  }

  let bgClass = 'bg-gray-50 border-gray-100';
  let textClass = 'text-gray-400';
  let cursorClass = 'cursor-default';
  let onClick: (() => void) | undefined;

  if (day.status === 'done') {
    bgClass = 'bg-green-100 border-green-300';
    textClass = 'text-green-700';
    cursorClass = 'cursor-default';
  } else if (day.status === 'makeup') {
    bgClass = 'bg-yellow-100 border-yellow-300';
    textClass = 'text-yellow-700';
    cursorClass = 'cursor-default';
  } else if (day.isFuture) {
    // 将来日期不可点击
    bgClass = 'bg-gray-50 border-gray-100';
    textClass = 'text-gray-300';
    cursorClass = 'cursor-default';
  } else if (day.isToday) {
    // 今天未打卡 → 可玩每日挑战
    bgClass = 'bg-white border-blue-400 border-2';
    textClass = 'text-blue-600 font-bold';
    cursorClass = 'cursor-pointer active:bg-blue-50';
    onClick = () => onPlayDaily(day.dateStr);
  } else if (day.isPast) {
    // 历史未打卡 → 可补卡
    bgClass = 'bg-white border-gray-300';
    textClass = 'text-gray-600';
    cursorClass = 'cursor-pointer active:bg-gray-100';
    onClick = () => onPlayMakeup(day.dateStr);
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        aspect-square rounded-md border text-xs font-medium
        flex items-center justify-center transition-colors
        ${bgClass} ${textClass} ${cursorClass}
      `}
    >
      {day.day}
    </button>
  );
}

export default function CalendarModal({ onClose, onPlayDaily, onPlayMakeup }: CalendarModalProps) {
  const { days, monthLabel, goToPrevMonth, goToNextMonth } = useCalendar();

  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-5 py-5 mx-5 w-full max-w-xs">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100 text-lg"
          >
            ◀
          </button>
          <span className="text-base font-semibold text-gray-800">{monthLabel}</span>
          <button
            onClick={goToNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 active:bg-gray-100 text-lg"
          >
            ▶
          </button>
        </div>

        {/* 星期头 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(w => (
            <div key={w} className="text-center text-xs text-gray-400 font-medium py-1">
              {w}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <DayCell
              key={i}
              day={day}
              onPlayDaily={onPlayDaily}
              onPlayMakeup={onPlayMakeup}
            />
          ))}
        </div>

        {/* 图例 */}
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300 inline-block" /> 已打卡
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300 inline-block" /> 补卡
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-white border border-gray-300 inline-block" /> 未打卡
          </span>
        </div>

        {/* 关闭 */}
        <button
          onClick={onClose}
          className="mt-4 w-full h-10 text-sm text-gray-500 border border-gray-200 rounded-lg active:bg-gray-50"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
