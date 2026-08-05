import { useState, useRef, useCallback, useEffect } from 'react';
import {
  type Grid,
  type CellIndex,
  type Difficulty,
  type PuzzleData,
  generatePuzzle,
  isGiven,
  isCorrect,
  isComplete,
  findHint,
  findConflicts,
} from '../lib/sudoku';

export type GameMode = 'practice' | 'daily' | 'makeup';

export interface GameRecord {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  timeSpent: number;
  completedAt: string;
  date?: string;
}

export interface GameState {
  board: number[];          // 81 格当前状态（0 = 空）
  puzzle: number[];         // 81 格题目状态（区分预设/用户填）
  solution: number[];       // 81 格答案（不暴露给 UI）
  drafts: Set<number>[];    // 每格的草稿数字集合
  selectedCell: CellIndex | null;
  isDraftMode: boolean;
  errors: Set<CellIndex>;   // 答案错误的格子
  conflicts: Set<CellIndex>;// 规则冲突的格子
  isComplete: boolean;
  hintCount: number;
  difficulty: Difficulty;
  mode: GameMode;
}

function gridToFlat(grid: Grid): number[] {
  return grid.flat();
}

function flatToGrid(flat: number[]): Grid {
  return Array.from({ length: 9 }, (_, r) => flat.slice(r * 9, r * 9 + 9));
}

export function useGame(difficulty: Difficulty, mode: GameMode = 'practice') {
  const puzzleDataRef = useRef<PuzzleData | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const initializedRef = useRef(false);

  // 初始化新游戏
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const data = generatePuzzle(difficulty);
    puzzleDataRef.current = data;

    const flatPuzzle = gridToFlat(data.puzzle);
    const flatSolution = gridToFlat(data.solution);

    setState({
      board: [...flatPuzzle],
      puzzle: [...flatPuzzle],
      solution: flatSolution,
      drafts: Array.from({ length: 81 }, () => new Set<number>()),
      selectedCell: null,
      isDraftMode: false,
      errors: new Set(),
      conflicts: new Set(),
      isComplete: false,
      hintCount: 0,
      difficulty,
      mode,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 选中格子
  const selectCell = useCallback((idx: CellIndex) => {
    setState(prev => prev ? { ...prev, selectedCell: idx } : prev);
  }, []);

  // 填数字
  const enterNumber = useCallback((num: number) => {
    setState(prev => {
      if (!prev) return prev;
      const { selectedCell, board, puzzle, solution, drafts, isDraftMode, isComplete: alreadyDone } = prev;
      if (selectedCell === null) return prev;
      if (alreadyDone) return prev;
      // 预设格子不可修改
      if (puzzle[selectedCell] !== 0) return prev;

      const nextBoard = [...board];
      const nextDrafts = drafts.map(d => new Set(d));

      if (isDraftMode) {
        // 草稿模式：切换候选值
        if (nextDrafts[selectedCell].has(num)) {
          nextDrafts[selectedCell].delete(num);
        } else {
          nextDrafts[selectedCell].add(num);
        }
        nextBoard[selectedCell] = 0;
      } else {
        // 普通模式
        nextBoard[selectedCell] = num;
        nextDrafts[selectedCell] = new Set(); // 清除该格草稿
      }

      // 重新计算错误和冲突
      const solutionGrid = flatToGrid(solution);
      const nextErrors = new Set<CellIndex>();
      for (let i = 0; i < 81; i++) {
        if (nextBoard[i] !== 0 && puzzle[i] === 0 && nextBoard[i] !== solution[i]) {
          nextErrors.add(i);
        }
      }

      const boardGrid = flatToGrid(nextBoard);
      const nextConflicts = findConflicts(boardGrid);

      const completed = isComplete(boardGrid, solutionGrid);

      return {
        ...prev,
        board: nextBoard,
        drafts: nextDrafts,
        errors: nextErrors,
        conflicts: nextConflicts,
        isComplete: completed,
      };
    });
  }, []);

  // 切换草稿模式
  const toggleDraftMode = useCallback(() => {
    setState(prev => prev ? { ...prev, isDraftMode: !prev.isDraftMode } : prev);
  }, []);

  // 擦除选中格
  const eraseCell = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const { selectedCell, puzzle } = prev;
      if (selectedCell === null) return prev;
      if (puzzle[selectedCell] !== 0) return prev;

      const nextBoard = [...prev.board];
      nextBoard[selectedCell] = 0;
      const nextDrafts = prev.drafts.map(d => new Set(d));
      nextDrafts[selectedCell] = new Set();

      // 重新计算错误
      const nextErrors = new Set(prev.errors);
      nextErrors.delete(selectedCell);

      return {
        ...prev,
        board: nextBoard,
        drafts: nextDrafts,
        errors: nextErrors,
        isComplete: false,
      };
    });
  }, []);

  // 提示
  const getHint = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const boardGrid = flatToGrid(prev.board);
      const solutionGrid = flatToGrid(prev.solution);
      const hint = findHint(boardGrid, solutionGrid);
      if (!hint) return prev;

      const idx = hint.row * 9 + hint.col;
      const nextBoard = [...prev.board];
      nextBoard[idx] = hint.value;

      const nextDrafts = prev.drafts.map(d => new Set(d));
      nextDrafts[idx] = new Set();

      const nextBoardGrid = flatToGrid(nextBoard);
      const completed = isComplete(nextBoardGrid, solutionGrid);

      return {
        ...prev,
        board: nextBoard,
        drafts: nextDrafts,
        selectedCell: idx,
        hintCount: prev.hintCount + 1,
        isComplete: completed,
      };
    });
  }, []);

  // 获取游戏数据（用于保存）
  const getGameData = useCallback((): GameState | null => {
    return state;
  }, [state]);

  // 重置游戏
  const resetGame = useCallback(() => {
    initializedRef.current = false;
    setState(null);
  }, []);

  return {
    state,
    selectCell,
    enterNumber,
    toggleDraftMode,
    eraseCell,
    getHint,
    getGameData,
    resetGame,
  };
}
