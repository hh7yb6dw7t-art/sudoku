// ─── 本地存储：游戏记录 + 游戏状态保存 ───

import type { GameRecord } from '../hooks/useGame';

const RECORDS_KEY = 'sudoku_records';
const SAVE_KEY = 'sudoku_save';

// ── 游戏记录 ──

export function loadRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: GameRecord): void {
  const records = loadRecords();
  records.unshift(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getTotalWins(): number {
  return loadRecords().filter(r => r.won !== false).length;
}

export function getWinLoss(): { wins: number; losses: number } {
  const records = loadRecords();
  const wins = records.filter(r => r.won !== false).length;
  const losses = records.filter(r => r.won === false).length;
  return { wins, losses };
}

export function getBestTime(difficulty: string): number | null {
  const records = loadRecords().filter(r => r.difficulty === difficulty && r.won !== false);
  if (records.length === 0) return null;
  return Math.min(...records.map(r => r.timeSpent));
}

export function loadRecordsPaginated(limit: number, offset: number): { records: GameRecord[]; hasMore: boolean } {
  const all = loadRecords();
  const slice = all.slice(offset, offset + limit);
  return { records: slice, hasMore: offset + limit < all.length };
}

// ── 游戏进度保存/恢复 ──

export interface SavedGame {
  board: number[];
  puzzle: number[];
  solution: number[];
  drafts: number[][];      // 序列化为数组的数组
  seconds: number;
  hintCount: number;
  mistakeCount: number;
  difficulty: string;
  mode: string;
  gameDate: string;
  savedAt: number;
}

export function saveGame(save: SavedGame): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function loadSavedGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(SAVE_KEY);
}
