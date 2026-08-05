interface NumberPadProps {
  onNumber: (n: number) => void;
  onDelete: () => void;
  /** 完全填满的数字（9 个实例都已在盘面上），置灰 */
  completedNumbers?: Set<number>;
}

export default function NumberPad({ onNumber, onDelete, completedNumbers }: NumberPadProps) {
  return (
    <div className="grid grid-cols-5 gap-2 select-none touch-manipulation">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
        const isDone = completedNumbers?.has(n);
        return (
          <button
            key={n}
            onClick={() => onNumber(n)}
            disabled={isDone}
            className={`
              aspect-square rounded-lg text-xl font-semibold transition-colors
              ${isDone
                ? 'bg-gray-100 text-gray-300 cursor-default'
                : 'bg-gray-100 text-gray-700 active:bg-blue-100 active:text-blue-600'
              }
            `}
          >
            {n}
          </button>
        );
      })}
      <button
        onClick={onDelete}
        className="aspect-square rounded-lg bg-gray-50 text-gray-400 active:bg-gray-200 flex items-center justify-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </button>
    </div>
  );
}
