// ─── 本地存储：游戏记录（v0.1 用 localStorage 代替 Supabase） ───

import type { GameRecord } from '../hooks/useGame';

const RECORDS_KEY = 'sudoku_records';

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
  records.unshift(record); // 最新在前
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getTotalWins(): number {
  return loadRecords().length;
}

export function getBestTime(difficulty: string): number | null {
  const records = loadRecords().filter(r => r.difficulty === difficulty);
  if (records.length === 0) return null;
  return Math.min(...records.map(r => r.timeSpent));
}

/** 分页加载：返回 { records, hasMore } */
export function loadRecordsPaginated(limit: number, offset: number): { records: GameRecord[]; hasMore: boolean } {
  const all = loadRecords();
  const slice = all.slice(offset, offset + limit);
  return { records: slice, hasMore: offset + limit < all.length };
}
