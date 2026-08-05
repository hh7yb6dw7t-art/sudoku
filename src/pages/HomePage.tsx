import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTotalWins } from '../lib/storage';
import { useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF_LABEL: Record<Difficulty, { name: string; icon: string; color: string }> = {
  easy:   { name: '简  单', icon: '🌱', color: 'border-green-400 text-green-700 bg-green-50 active:bg-green-100' },
  medium: { name: '中  等', icon: '🔥', color: 'border-yellow-400 text-yellow-700 bg-yellow-50 active:bg-yellow-100' },
  hard:   { name: '困  难', icon: '💎', color: 'border-red-400 text-red-700 bg-red-50 active:bg-red-100' },
};

export default function HomePage() {
  const { phone, logout } = useAuth();
  const navigate = useNavigate();
  const [totalWins] = useState(getTotalWins);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-full flex flex-col px-6 pt-12 pb-8">
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
      <div className="flex justify-center gap-6 mb-8 text-sm text-gray-500">
        <span>🏆 总胜场 <b className="text-gray-700">{totalWins}</b></span>
        <span>🔥 连续打卡 <b className="text-gray-700">0</b> 天</span>
      </div>

      {/* 日历图标 - 占位，Change 3 实现 */}
      <div className="flex justify-end mb-2">
        <button
          className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-lg"
          title="每日打卡 - 即将开放"
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

      {/* 底部导航 */}
      <div className="flex border-t border-gray-100 pt-3 mt-4">
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
    </div>
  );
}
