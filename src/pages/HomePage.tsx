import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { phone, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-full flex flex-col px-6 pt-12 pb-8">
      {/* 顶栏 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800 tracking-wider">数独游戏</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{phone}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 border border-gray-300 rounded px-3 py-1 active:bg-gray-100"
          >
            退出
          </button>
        </div>
      </div>

      {/* 占位 - 后续 Change 实现 */}
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg mb-2">🏠 首页</p>
        <p className="text-sm">Change 2 将实现难度选择和日历打卡</p>
      </div>

      {/* 底部导航占位 */}
      <div className="flex border-t border-gray-100 pt-3">
        <div className="flex-1 text-center text-sm text-blue-500 font-semibold">
          🏠<br /><span className="text-xs">首页</span>
        </div>
        <div
          className="flex-1 text-center text-sm text-gray-400"
          onClick={() => navigate('/history')}
        >
          📋<br /><span className="text-xs">历史</span>
        </div>
      </div>
    </div>
  );
}
