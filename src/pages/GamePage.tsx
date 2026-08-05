import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Difficulty } from '../lib/sudoku';
import type { GameMode } from '../hooks/useGame';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';
import { saveRecord } from '../lib/storage';
import { saveCheckin, toISO } from '../lib/checkin';
import SudokuGrid from '../components/SudokuGrid';
import NumberPad from '../components/NumberPad';
import GameToolbar from '../components/GameToolbar';
import CompletionModal from '../components/CompletionModal';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};

const MODE_LABEL: Record<string, string> = {
  practice: '自由练习',
  daily: '每日打卡',
  makeup: '补卡',
};

export default function GamePage() {
  const { '*': path } = useParams();
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);
  const hasSavedRef = useRef(false);

  // 解析路径
  // practice: /game/practice/easy
  // daily:    /game/daily/2026-08-05/easy
  // makeup:   /game/makeup/2026-08-05/medium
  const { mode, difficulty, gameDate } = useMemo(() => {
    if (!path) return { mode: 'practice' as GameMode, difficulty: 'easy' as Difficulty, gameDate: '' };
    const parts = path.replace(/^\/+/, '').split('/');
    const m = parts[0] as GameMode;
    if (m === 'practice') {
      const d = parts[1] || 'easy';
      return { mode: m, difficulty: (['easy', 'medium', 'hard'].includes(d) ? d : 'easy') as Difficulty, gameDate: '' };
    }
    // daily 或 makeup
    const dateStr = parts[1] || '';
    const diff = parts[2] || 'easy';
    return {
      mode: m,
      difficulty: (['easy', 'medium', 'hard'].includes(diff) ? diff : 'easy') as Difficulty,
      gameDate: dateStr,
    };
  }, [path]);

  const { state, error, selectCell, enterNumber, toggleDraftMode, eraseCell, getHint, resetGame } =
    useGame(difficulty, mode);

  const timer = useTimer();

  // 游戏加载后自动计时
  useEffect(() => {
    if (state && !hasStartedRef.current) {
      hasStartedRef.current = true;
      timer.start();
    }
  }, [state, timer]);

  // 完成后保存记录
  useEffect(() => {
    if (state?.isComplete && !hasSavedRef.current) {
      hasSavedRef.current = true;
      timer.pause();

      const recordId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const todayDate = new Date().toLocaleDateString('zh-CN');

      // 保存游戏记录
      saveRecord({
        id: recordId,
        mode,
        difficulty,
        timeSpent: timer.seconds,
        completedAt: new Date().toISOString(),
        date: todayDate,
      });

      // 打卡/补卡写入
      if (mode === 'daily') {
        const dateToSave = gameDate || todayDate;
        saveCheckin(dateToSave, 'done', recordId, difficulty, timer.seconds);
      } else if (mode === 'makeup') {
        saveCheckin(gameDate, 'makeup', recordId, difficulty, timer.seconds);
      }
    }
  }, [state?.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = useCallback(() => {
    const hasProgress = state && state.board.some((v, i) => v !== 0 && state.puzzle[i] === 0);
    if (hasProgress && !state.isComplete) {
      if (!window.confirm('确定要退出吗？当前游戏进度将丢失。')) return;
    }
    timer.reset();
    resetGame();
    navigate('/', { replace: true });
  }, [state, timer, resetGame, navigate]);

  const handleBackHome = useCallback(() => {
    timer.reset();
    resetGame();
    navigate('/', { replace: true });
  }, [timer, resetGame, navigate]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-red-600 mb-2">题目生成失败</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm active:bg-blue-600"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">正在生成题目...</p>
      </div>
    );
  }

  // 已完成数字
  const completedNumbers = useMemo(() => {
    const count: Record<number, number> = {};
    for (let i = 0; i < 81; i++) {
      const v = state.board[i];
      if (v !== 0 && !state.errors.has(i)) {
        count[v] = (count[v] || 0) + 1;
      }
    }
    return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => count[n] === 9));
  }, [state.board, state.errors]);

  // 难度标签
  const headerLabel = mode === 'practice'
    ? DIFFICULTY_LABEL[difficulty]
    : `${MODE_LABEL[mode]} · ${DIFFICULTY_LABEL[difficulty]}`;

  return (
    <div className="h-full flex flex-col px-3 pt-4 pb-4 relative">
      {/* 顶栏 */}
      <div className="flex justify-between items-center mb-2 px-1">
        <button
          onClick={handleBack}
          className="text-xs text-gray-500 border border-gray-300 rounded-md px-3 py-1.5 active:bg-gray-100"
        >
          ← 退出
        </button>
        <span className="text-xs text-gray-500 font-medium text-center leading-tight">
          {headerLabel}
        </span>
        <span className="text-sm font-semibold text-gray-700 tabular-nums tracking-wider">
          ⏱ {timer.formatted}
        </span>
      </div>

      {/* 数独盘面 */}
      <SudokuGrid
        board={state.board}
        puzzle={state.puzzle}
        drafts={state.drafts}
        selectedCell={state.selectedCell}
        errors={state.errors}
        conflicts={state.conflicts}
        onSelectCell={selectCell}
      />

      {/* 工具栏 */}
      <div className="mt-2">
        <GameToolbar
          isDraftMode={state.isDraftMode}
          hintCount={state.hintCount}
          onToggleDraft={toggleDraftMode}
          onHint={getHint}
          onErase={eraseCell}
        />
      </div>

      {/* 数字键盘 */}
      <div className="mt-3">
        <NumberPad
          onNumber={enterNumber}
          onDelete={eraseCell}
          completedNumbers={completedNumbers}
        />
      </div>

      {/* 完成弹窗 */}
      {state.isComplete && (
        <CompletionModal
          mode={mode}
          difficulty={difficulty}
          timeFormatted={timer.formatted}
          hintCount={state.hintCount}
          onBackHome={handleBackHome}
        />
      )}
    </div>
  );
}
