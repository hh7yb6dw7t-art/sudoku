interface GameToolbarProps {
  isDraftMode: boolean;
  hintCount: number;
  onToggleDraft: () => void;
  onAutoDraft: () => void;
  onHint: () => void;
  onErase: () => void;
}

export default function GameToolbar({
  isDraftMode, hintCount, onToggleDraft, onAutoDraft, onHint, onErase,
}: GameToolbarProps) {
  const hintsLeft = 3 - hintCount;
  const hintDisabled = hintsLeft <= 0;

  return (
    <div className="grid grid-cols-4 gap-2 select-none touch-manipulation">
      <button
        onClick={onToggleDraft}
        className={`h-9 rounded-md text-xs font-medium border transition-colors
          ${isDraftMode
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-600 border-gray-300 active:bg-gray-50'
          }`}
      >
        ✏️ 草稿
      </button>
      <button
        onClick={onAutoDraft}
        className="h-9 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-600 active:bg-gray-50"
      >
        📝 一键草稿
      </button>
      <button
        onClick={onHint}
        disabled={hintDisabled}
        className={`h-9 rounded-md text-xs font-medium border transition-colors
          ${hintDisabled
            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-600 border-gray-300 active:bg-gray-50'
          }`}
      >
        💡 提示({hintsLeft})
      </button>
      <button
        onClick={onErase}
        className="h-9 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-600 active:bg-gray-50"
      >
        🗑 擦除
      </button>
    </div>
  );
}
