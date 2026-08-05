import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Difficulty } from '../lib/sudoku';
import { useGame, type GameMode } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';
import { saveRecord } from '../lib/storage';
import SudokuGrid from '../components/SudokuGrid';
import NumberPad from '../components/NumberPad';
import GameToolbar from '../components/GameToolbar';
import CompletionModal from '../components/CompletionModal';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '简单', medium: '中等', hard: '困难',
};

export default function GamePage() {
  const { '*': path } = useParams();
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);
  const hasSavedRef = useRef(false);

  // 解析路径：/game/practice/easy 或 /game/daily/2026-08-05 等
  const [mode, param] = useMemo(() => {
    if (!path) return ['practice', 'easy'] as [GameMode, string];
    const parts = path.replace(/^\/+/, '').split('/');
    return [parts[0] as GameMode, parts[1] || 'easy'] as [GameMode, string];
  }, [path]);

  const difficulty: Difficulty =
    ['easy', 'medium', 'hard'].includes(param) ? (param as Difficulty) : 'easy';

  const { state, selectCell, enterNumber, toggleDraftMode, eraseCell, getHint, resetGame } =
    useGame(difficulty, mode);

  const timer = useTimer();

  // 游戏加载后自动开始计时
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
      saveRecord({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        mode,
        difficulty,
        timeSpent: timer.seconds,
        completedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('zh-CN'),
      });
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

  if (!state) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 计算已完成的数字（9 个全在盘面上且正确）
  const completedNumbers = useMemo(() => {
    const count: Record<number, number> = {};
    for (let i = 0; i < 81; i++) {
      const v = state.board[i];
      if (v !== 0 && !state.errors.has(i)) {
        count[v] = (count[v] || 0) + 1;
      }
    }
    return new Set(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => count[n] === 9)
    );
  }, [state.board, state.errors]);

  return (
    <div className="h-full flex flex-col px-3 pt-4 pb-4 relative">
      {/* 顶栏：返回 + 难度 + 计时器 */}
      <div className="flex justify-between items-center mb-2 px-1">
        <button
          onClick={handleBack}
          className="text-xs text-gray-500 border border-gray-300 rounded-md px-3 py-1.5 active:bg-gray-100"
        >
          ← 退出
        </button>
        <span className="text-sm text-gray-500 font-medium">
          {DIFFICULTY_LABEL[difficulty]}
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
