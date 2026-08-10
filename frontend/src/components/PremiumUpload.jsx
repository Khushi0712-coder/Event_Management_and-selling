import { useCallback, useEffect, useRef, useState } from "react";
import { FiUpload, FiX, FiFileText } from "react-icons/fi";

const isImage = (file) => file && file.type.startsWith("image/");
const isPDF = (file) => file && file.type === "application/pdf";

export default function PremiumUpload({ file, onChange, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      const f = files && files[0];
      if (!f) return;
      onChange(f);
    },
    [onChange],
  );

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (disabled) return;
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
          dragOver ? "border-orange-400/60 bg-slate-800/70" : "border-white/10 bg-slate-900/60"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-orange-300">
          <FiUpload className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="text-sm text-slate-300">Upload ticket proof</div>
          <div className="mt-1 text-xs text-slate-500">PNG, JPG or PDF. Max 10MB.</div>
        </div>

        <div>
          {file ? (
            <div className="flex items-center gap-3">
              {isImage(file) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-12 w-20 rounded-md object-cover"
                />
              ) : isPDF(file) ? (
                <div className="flex items-center gap-2">
                  <FiFileText className="h-6 w-6 text-slate-200" />
                  <span className="text-xs text-slate-300 max-w-[120px] truncate">{file.name}</span>
                </div>
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="rounded-full bg-slate-900/70 p-2 text-slate-300 transition hover:bg-slate-800"
                aria-label="Remove file"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Click or drag file here to upload</div>
          )}
        </div>
      </div>
    </div>
  );
}
