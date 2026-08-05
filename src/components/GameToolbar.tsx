interface GameToolbarProps {
  isDraftMode: boolean;
  hintCount: number;
  onToggleDraft: () => void;
  onHint: () => void;
  onErase: () => void;
}

export default function GameToolbar({ isDraftMode, hintCount, onToggleDraft, onHint, onErase }: GameToolbarProps) {
  return (
    <div className="flex gap-2 select-none touch-manipulation">
      <button
        onClick={onToggleDraft}
        className={`flex-1 h-9 rounded-md text-xs font-medium border transition-colors
          ${isDraftMode
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-600 border-gray-300 active:bg-gray-50'
          }`}
      >
        ✏️ 草稿
      </button>
      <button
        onClick={onHint}
        className="flex-1 h-9 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-600 active:bg-gray-50"
      >
        💡 提示
      </button>
      <button
        onClick={onErase}
        className="flex-1 h-9 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-600 active:bg-gray-50"
      >
        🗑 擦除
      </button>
    </div>
  );
}
