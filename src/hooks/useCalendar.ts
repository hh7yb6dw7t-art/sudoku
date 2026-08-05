import { useState, useMemo } from 'react';
import { getMonthStatuses, today, type CheckinStatus } from '../lib/checkin';

export interface DayInfo {
  dateStr: string;     // 'YYYY-MM-DD'
  day: number;         // 1-31
  status: CheckinStatus | null;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function useCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  const days: DayInfo[] = useMemo(() => {
    const statuses = getMonthStatuses(year, month);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0=Sun

    const todayDate = new Date();
    const todayStr = today();

    const result: DayInfo[] = [];

    // 填充月初空白格
    for (let i = 0; i < startDayOfWeek; i++) {
      result.push({ dateStr: '', day: 0, status: null, isToday: false, isPast: false, isFuture: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      let isToday = false;
      let isPast = false;
      let isFuture = false;

      // 格式化日期用于比较
      const checkDate = date.toLocaleDateString('zh-CN');
      if (checkDate === todayStr) {
        isToday = true;
      } else if (date < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())) {
        isPast = true;
      } else {
        isFuture = true;
      }

      result.push({
        dateStr,
        day: d,
        status: statuses.get(dateStr) || null,
        isToday,
        isPast,
        isFuture,
      });
    }

    return result;
  }, [year, month]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(y => y - 1);
      setMonth(12);
    } else {
      setMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(y => y + 1);
      setMonth(1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const monthLabel = `${year} 年 ${month} 月`;

  return { year, month, days, monthLabel, goToPrevMonth, goToNextMonth };
}
