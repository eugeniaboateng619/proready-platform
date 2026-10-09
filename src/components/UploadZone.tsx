import { useCallback, useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  size: number;
}

/**
 * Browser-native drag-and-drop upload zone for code / configuration files.
 *
 * NOTE: This is a frontend-only prototype. Files are listed in local state and
 * never leave the browser — there is no backend upload. The seam for a real
 * upload would live in `onFilesAccepted`.
 */
export function UploadZone() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
    // TODO(backend): forward `list` to a real upload endpoint here.
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
        )}
      >
        <UploadCloud className="size-8 text-primary" />
        <p className="text-sm font-medium">
          Drag & drop code or configuration files
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse — nothing leaves your browser in this prototype
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Remove ${f.name}`}
                onClick={() =>
                  setFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
