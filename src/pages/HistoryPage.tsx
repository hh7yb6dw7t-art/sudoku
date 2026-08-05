import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadRecordsPaginated } from '../lib/storage';
import type { GameRecord } from '../hooks/useGame';

const PAGE_SIZE = 20;

const MODE_TAG: Record<string, { label: string; cls: string }> = {
  practice: { label: '练习', cls: 'bg-gray-100 text-gray-600' },
  daily:    { label: '打卡', cls: 'bg-green-100 text-green-700' },
  makeup:   { label: '补卡', cls: 'bg-yellow-100 text-yellow-700' },
};

const DIFF_LABEL: Record<string, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  // dateStr: '2026/8/5' or ISO string
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // try parsing YYYY/M/D or YYYY-MM-DD
      const parts = dateStr.split(/[/-]/);
      if (parts.length === 3) {
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][new Date(+parts[0], +parts[1] - 1, +parts[2]).getDay()];
        return `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')} 周${weekday}`;
      }
      return dateStr;
    }
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 周${weekday}`;
  } catch {
    return dateStr;
  }
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // 首次加载
  useEffect(() => {
    const result = loadRecordsPaginated(PAGE_SIZE, 0);
    setRecords(result.records);
    setHasMore(result.hasMore);
    setOffset(PAGE_SIZE);
    setLoading(false);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setLoading(true);
    // 模拟短暂延迟让用户看到加载过程
    setTimeout(() => {
      const result = loadRecordsPaginated(PAGE_SIZE, offset);
      setRecords(prev => [...prev, ...result.records]);
      setHasMore(result.hasMore);
      setOffset(prev => prev + PAGE_SIZE);
      setLoading(false);
    }, 200);
  }, [hasMore, loading, offset]);

  return (
    <div className="h-full flex flex-col px-4 pt-12 pb-8">
      {/* 顶栏 */}
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={() => navigate('/', { replace: true })}
          className="text-xs text-gray-500 border border-gray-300 rounded-md px-3 py-1.5 active:bg-gray-100"
        >
          ← 返回
        </button>
        <h1 className="text-base font-semibold text-gray-800">历史记录</h1>
        <span className="text-xs text-gray-400">{records.length} 局</span>
      </div>

      {/* 列表 */}
      {loading && records.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-base">暂无游戏记录</p>
          <p className="text-sm mt-1">快去玩一局吧！</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {records.map(rec => (
            <div
              key={rec.id}
              className="flex items-center justify-between py-3 px-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(rec.date || rec.completedAt)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${MODE_TAG[rec.mode]?.cls || MODE_TAG.practice.cls}`}>
                    {MODE_TAG[rec.mode]?.label || '练习'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {rec.mode === 'daily' ? '每日挑战' : rec.mode === 'makeup' ? '补卡挑战' : '自由练习'}
                  {' · '}
                  {DIFF_LABEL[rec.difficulty] || rec.difficulty}
                </span>
              </div>
              <span className="text-base font-semibold text-gray-700 tabular-nums">
                {formatTime(rec.timeSpent)}
              </span>
            </div>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <div className="py-4 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-sm text-blue-500 active:text-blue-600 disabled:text-gray-300"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}

          {!hasMore && records.length > 0 && (
            <p className="py-4 text-center text-xs text-gray-300">— 已显示全部记录 —</p>
          )}
        </div>
      )}

      {/* 底部导航 */}
      <div className="flex border-t border-gray-100 pt-3 mt-2">
        <div
          className="flex-1 text-center text-sm text-gray-400 active:text-blue-500 cursor-pointer"
          onClick={() => navigate('/')}
        >
          🏠<br /><span className="text-xs">首页</span>
        </div>
        <div className="flex-1 text-center text-sm text-blue-500 font-semibold">
          📋<br /><span className="text-xs">历史</span>
        </div>
      </div>
    </div>
  );
}
