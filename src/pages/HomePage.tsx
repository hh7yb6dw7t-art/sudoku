import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTotalWins } from '../lib/storage';
import { calculateStreak, today, getCheckinStatus, randomDifficulty } from '../lib/checkin';
import CalendarModal from '../components/CalendarModal';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_LABEL: Record<Difficulty, { name: string; icon: string; color: string }> = {
  easy:   { name: '简  单', icon: '🌱', color: 'border-green-400 text-green-700 bg-green-50 active:bg-green-100' },
  medium: { name: '中  等', icon: '🔥', color: 'border-yellow-400 text-yellow-700 bg-yellow-50 active:bg-yellow-100' },
  hard:   { name: '困  难', icon: '💎', color: 'border-red-400 text-red-700 bg-red-50 active:bg-red-100' },
};

export default function HomePage() {
  const { phone, logout } = useAuth();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [streak, setStreak] = useState(calculateStreak);
  const [totalWins] = useState(getTotalWins);

  const refreshStats = useCallback(() => {
    setStreak(calculateStreak());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCalendarOpen = () => {
    refreshStats();
    setShowCalendar(true);
  };

  const handlePlayDaily = (dateStr: string) => {
    const diff = randomDifficulty();
    setShowCalendar(false);
    navigate(`/game/daily/${dateStr}/${diff}`);
  };

  const handlePlayMakeup = (dateStr: string) => {
    const diff = randomDifficulty();
    setShowCalendar(false);
    navigate(`/game/makeup/${dateStr}/${diff}`);
  };

  const todayStr = today();
  const todayStatus = getCheckinStatus(todayStr);

  return (
    <div className="h-full flex flex-col px-6 pt-12 pb-8 relative">
      {/* 顶栏 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800 tracking-wider">数独游戏</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{phone}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-0.5 active:bg-gray-100"
          >
            退出
          </button>
        </div>
      </div>

      {/* 统计条 */}
      <div className="flex justify-center gap-6 mb-6 text-sm text-gray-500">
        <span>🏆 总胜场 <b className="text-gray-700">{totalWins}</b></span>
        <span>
          🔥 连续打卡{' '}
          <b className={streak > 0 ? 'text-orange-500' : 'text-gray-700'}>
            {streak}
          </b>{' '}
          天
        </span>
      </div>

      {/* 日历图标 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleCalendarOpen}
          className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-lg active:bg-gray-100 transition-colors"
          title="每日打卡"
        >
          📅
        </button>
      </div>

      {/* 三个难度按钮 */}
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-center text-xs text-gray-400 mb-1">自由练习 · 选择难度</p>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <button
            key={diff}
            onClick={() => navigate(`/game/practice/${diff}`)}
            className={`w-full h-14 rounded-xl border-2 text-lg font-semibold tracking-widest flex items-center justify-center gap-3 transition-colors ${DIFF_LABEL[diff].color}`}
          >
            <span className="text-xl">{DIFF_LABEL[diff].icon}</span>
            {DIFF_LABEL[diff].name}
          </button>
        ))}
      </div>

      {/* 今日打卡提示 */}
      {todayStatus ? (
        <p className="text-center text-xs text-green-600 mt-2">✅ 今日已完成打卡</p>
      ) : (
        <p className="text-center text-xs text-gray-400 mt-2">📅 点击右上角日历开始今日打卡</p>
      )}

      {/* 底部导航 */}
      <div className="flex border-t border-gray-100 pt-3 mt-3">
        <div className="flex-1 text-center text-sm text-blue-500 font-semibold">
          🏠<br /><span className="text-xs">首页</span>
        </div>
        <div
          className="flex-1 text-center text-sm text-gray-400 active:text-blue-500 cursor-pointer"
          onClick={() => navigate('/history')}
        >
          📋<br /><span className="text-xs">历史</span>
        </div>
      </div>

      {/* 日历弹窗 */}
      {showCalendar && (
        <CalendarModal
          onClose={() => setShowCalendar(false)}
          onPlayDaily={handlePlayDaily}
          onPlayMakeup={handlePlayMakeup}
        />
      )}
    </div>
  );
}
