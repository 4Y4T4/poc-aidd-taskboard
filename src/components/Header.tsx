type HeaderProps = {
  onAddClick?: () => void;
};

export function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">タスクボード</h1>
        <button
          type="button"
          onClick={onAddClick}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          + タスクを追加
        </button>
      </div>
    </header>
  );
}
