import type { SelectedFile } from "./FilePicker";

interface FilePreviewListProps {
  files: SelectedFile[];
  onRemove: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreviewList({ files, onRemove }: FilePreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-gray-700">
          {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado{files.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <ul className="space-y-2">
        {files.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
          >
            {item.preview ? (
              <img
                src={item.preview}
                alt={item.file.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                🎬
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
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}