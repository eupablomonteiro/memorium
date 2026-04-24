import type { SelectedFile } from "./FilePicker";

interface FilePreviewListProps {
  files: SelectedFile[];
  onRemove: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return `${mb.toFixed(0)} MB`;
  return `${mb.toFixed(1)} MB`;
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div className="card divide-y divide-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado
          {files.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <ul className="max-h-64 overflow-y-auto">
        {files.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            {item.preview ? (
              <img
                src={item.preview}
                alt={item.file.name}
                className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-xl">🎬</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {item.file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(item.file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}