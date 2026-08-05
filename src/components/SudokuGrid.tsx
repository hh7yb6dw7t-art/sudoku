import type { CellIndex } from '../lib/sudoku';

interface SudokuGridProps {
  board: number[];
  puzzle: number[];
  drafts: Set<number>[];
  selectedCell: CellIndex | null;
  errors: Set<CellIndex>;
  conflicts: Set<CellIndex>;
  onSelectCell: (idx: CellIndex) => void;
}

/** 宫格粗线位置：第 3、6 列有右边框，第 3、6 行有下边框 */
function cellBorderClasses(idx: number): string {
  const col = idx % 9;
  const row = Math.floor(idx / 9);
  let cls = 'border-[0.5px] border-gray-300 ';
  if (col === 2 || col === 5) cls += 'border-r-2 border-r-gray-700 ';
  if (row === 2 || row === 5) cls += 'border-b-2 border-b-gray-700 ';
  return cls;
}

export default function SudokuGrid({
  board, puzzle, drafts, selectedCell, errors, conflicts, onSelectCell,
}: SudokuGridProps) {
  return (
    <div className="w-full aspect-square grid grid-cols-9 border-2 border-gray-700 rounded-sm overflow-hidden select-none touch-manipulation">
      {Array.from({ length: 81 }, (_, idx) => {
        const value = board[idx];
        const isGiven = puzzle[idx] !== 0;
        const isSelected = selectedCell === idx;
        const isError = errors.has(idx);
        const isConflict = conflicts.has(idx);
        const cellDrafts = drafts[idx];

        // 高亮同行/列/宫
        let isHighlighted = false;
        if (selectedCell !== null && selectedCell !== idx) {
          const sr = Math.floor(selectedCell / 9);
          const sc = selectedCell % 9;
          const cr = Math.floor(idx / 9);
          const cc = idx % 9;
          if (
            sr === cr ||
            sc === cc ||
            (Math.floor(sr / 3) === Math.floor(cr / 3) && Math.floor(sc / 3) === Math.floor(cc / 3))
          ) {
            isHighlighted = true;
          }
        }

        // 同数字高亮
        let sameNumber = false;
        if (value !== 0 && selectedCell !== null && selectedCell !== idx) {
          if (board[selectedCell] === value) {
            sameNumber = true;
          }
        }

        // 背景色
        let bgClass = 'bg-white';
        if (isError) {
          bgClass = 'bg-red-100';
        } else if (isSelected) {
          bgClass = 'bg-blue-100';
        } else if (isHighlighted) {
          bgClass = 'bg-blue-50/60';
        }
        if (sameNumber) {
          bgClass = 'bg-blue-100/70';
        }

        // 文字颜色
        let textClass = 'text-blue-600 font-medium';
        if (isGiven) {
          textClass = 'text-gray-800 font-bold';
        } else if (isError || isConflict) {
          textClass = 'text-red-500 font-medium';
        }

        return (
          <div
            key={idx}
            onClick={() => onSelectCell(idx)}
            className={`
              ${cellBorderClasses(idx)}
              ${bgClass}
              relative flex items-center justify-center cursor-pointer
              transition-colors duration-75
            `}
          >
            {/* 已填数字 */}
            {value !== 0 ? (
              <span className={`text-base sm:text-lg ${textClass}`}>{value}</span>
            ) : cellDrafts && cellDrafts.size > 0 ? (
              /* 草稿小数字：3x3 排列 */
              <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <span
                    key={n}
                    className="flex items-center justify-center text-[7px] sm:text-[8px] leading-none text-gray-500"
                  >
                    {cellDrafts.has(n) ? n : ''}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
