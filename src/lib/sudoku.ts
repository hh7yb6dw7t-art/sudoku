// ─── 数独引擎：生成、求解、验证、提示 ───

export type Grid = number[][];         // 9x9, 0 = empty
export type CellIndex = number;        // 0-80

export type Difficulty = 'easy' | 'medium' | 'hard';

// 每个难度保留的提示数范围
const GIVENS_RANGE: Record<Difficulty, [number, number]> = {
  easy:   [38, 42],
  medium: [28, 32],
  hard:   [20, 24],
};

// ── 工具 ──

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rowColToIndex(row: number, col: number): CellIndex {
  return row * 9 + col;
}

function indexToRowCol(idx: CellIndex): [number, number] {
  return [Math.floor(idx / 9), idx % 9];
}

function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

// ── 检查某位置能否放某个数字 ──

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  // 行
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  // 列
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  // 3x3 宫
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

// ── 回溯求解：返回解的数量（最多 count 个即停止） ──

function solve(grid: Grid, maxSolutions: number): number {
  let solutions = 0;

  function backtrack(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (backtrack()) return true;
              grid[r][c] = 0;
            }
          }
          return false; // 无候选数，回溯
        }
      }
    }
    // 全部填满
    solutions++;
    return solutions >= maxSolutions;
  }

  backtrack();
  return solutions;
}

// ── 生成完整终盘 ──

function generateFullGrid(): Grid {
  const grid = emptyGrid();

  // 先填 3 个对角宫（独立，无行列冲突）
  for (let box = 0; box < 9; box += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let i = 0;
    for (let r = box; r < box + 3; r++) {
      for (let c = box; c < box + 3; c++) {
        grid[r][c] = nums[i++];
      }
    }
  }

  // 回溯填充剩余
  function fillRemaining(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of candidates) {
            if (isValid(grid, r, c, num)) {
              grid[r][c] = num;
              if (fillRemaining()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillRemaining();
  return grid;
}

// ── 挖空：保证唯一解 ──

function removeCells(solution: Grid, targetGivens: number): Grid {
  const puzzle = cloneGrid(solution);
  const allCells = shuffle(Array.from({ length: 81 }, (_, i) => i));
  const toRemove = 81 - targetGivens;
  let removed = 0;

  for (const cellIdx of allCells) {
    if (removed >= toRemove) break;
    const [r, c] = indexToRowCol(cellIdx);
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const testGrid = cloneGrid(puzzle);
    if (solve(testGrid, 2) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup; // 破坏唯一解，恢复
    }
  }

  return puzzle;
}

// ── 公开 API ──

export interface PuzzleData {
  puzzle: Grid;      // 题目（空格为 0）
  solution: Grid;    // 答案
  difficulty: Difficulty;
}

/** 生成一局新游戏 */
export function generatePuzzle(difficulty: Difficulty): PuzzleData {
  const solution = generateFullGrid();
  const [minGivens, maxGivens] = GIVENS_RANGE[difficulty];
  const target = Math.floor(Math.random() * (maxGivens - minGivens + 1)) + minGivens;
  const puzzle = removeCells(solution, target);
  return { puzzle, solution, difficulty };
}

/** 判断格子是否为题目预设 */
export function isGiven(puzzle: Grid, row: number, col: number): boolean {
  return puzzle[row][col] !== 0;
}

/** 检查用户填入的值是否正确 */
export function isCorrect(solution: Grid, row: number, col: number, value: number): boolean {
  return solution[row][col] === value;
}

/** 检查盘面是否全部正确填满 */
export function isComplete(board: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0 || board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

/** 获取某空格的候选数列表 */
export function getCandidates(board: Grid, row: number, col: number): number[] {
  if (board[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) candidates.push(num);
  }
  return candidates;
}

/** 提示：找到只有一个候选数的空格，返回其坐标和正确值 */
export function findHint(board: Grid, solution: Grid): { row: number; col: number; value: number } | null {
  // 优先找裸单数（只有一个候选数）
  const singles: { row: number; col: number; count: number }[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates = getCandidates(board, r, c);
        if (candidates.length === 1) {
          return { row: r, col: c, value: solution[r][c] };
        }
        singles.push({ row: r, col: c, count: candidates.length });
      }
    }
  }

  // 没有裸单数，返回候选数最少的那个格子
  if (singles.length === 0) return null;
  singles.sort((a, b) => a.count - b.count);
  const best = singles[0];
  return { row: best.row, col: best.col, value: solution[best.row][best.col] };
}

/** 检查盘面是否有规则冲突（行列宫重复），用于实时高亮 */
export function findConflicts(board: Grid): Set<CellIndex> {
  const conflicts = new Set<CellIndex>();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === 0) continue;

      // 检查行
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && board[r][cc] === val) {
          conflicts.add(rowColToIndex(r, c));
          conflicts.add(rowColToIndex(r, cc));
        }
      }
      // 检查列
      for (let rr = 0; rr < 9; rr++) {
        if (rr !== r && board[rr][c] === val) {
          conflicts.add(rowColToIndex(r, c));
          conflicts.add(rowColToIndex(rr, c));
        }
      }
      // 检查宫
      const boxRow = Math.floor(r / 3) * 3;
      const boxCol = Math.floor(c / 3) * 3;
      for (let rr = boxRow; rr < boxRow + 3; rr++) {
        for (let cc = boxCol; cc < boxCol + 3; cc++) {
          if ((rr !== r || cc !== c) && board[rr][cc] === val) {
            conflicts.add(rowColToIndex(r, c));
            conflicts.add(rowColToIndex(rr, cc));
          }
        }
      }
    }
  }

  return conflicts;
}
