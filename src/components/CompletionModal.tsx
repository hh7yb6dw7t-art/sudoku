import type { Difficulty } from '../lib/sudoku';
import type { GameMode } from '../hooks/useGame';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};

const MODE_LABEL: Record<GameMode, string> = {
  practice: '自由练习', daily: '每日打卡', makeup: '补卡',
};

interface CompletionModalProps {
  mode: GameMode;
  difficulty: Difficulty;
  timeFormatted: string;
  hintCount: number;
  won: boolean;
  onBackHome: () => void;
}

export default function CompletionModal({
  mode, difficulty, timeFormatted, hintCount, won, onBackHome,
}: CompletionModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-8 mx-6 text-center max-w-xs w-full animate-bounce-in">
        <div className="text-5xl mb-4">{won ? '🎉' : '💔'}</div>
        <h2 className={`text-xl font-bold mb-2 ${won ? 'text-gray-800' : 'text-red-500'}`}>
          {won ? '恭喜完成！' : '挑战失败'}
        </h2>
        {!won && <p className="text-xs text-gray-400 mb-1">填错超过 3 次</p>}

        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            {MODE_LABEL[mode]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${won ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        </div>

        <div className="mt-5 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>⏱ 用时</span>
            <span className="font-semibold text-gray-800">{timeFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span>💡 使用提示</span>
            <span className="font-semibold text-gray-800">{hintCount} 次</span>
          </div>
        </div>

        <button
          onClick={onBackHome}
          className={`mt-6 w-full h-11 text-white rounded-lg font-semibold text-base active:opacity-90 transition-colors ${won ? 'bg-blue-500 active:bg-blue-600' : 'bg-gray-500 active:bg-gray-600'}`}
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
