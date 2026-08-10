import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

const DEFAULT_OPTIONS = ["All", "Pending", "Approved", "Rejected"];

export default function StatusDropdown({ value, onChange, options = DEFAULT_OPTIONS }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) setHighlight(options.indexOf(value));
  }, [open, value, options]);

  const toggle = () => setOpen((v) => !v);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const choice = options[highlight];
      onChange(choice);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="flex w-44 items-center justify-between rounded-md bg-transparent text-sm outline-none"
      >
        <span className="truncate text-left text-sm text-slate-300">
          {value === "All" ? "All status" : value}
        </span>
        <FiChevronDown className={`ml-2 h-4 w-4 text-slate-400 transition-transform ${open ? "-rotate-180" : "rotate-0"}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 z-40 mt-2 w-44 rounded-lg bg-slate-950/95 shadow-lg"
        >
          {options.map((opt, i) => (
            <li key={opt} role="option">
              <button
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-orange-400/8 ${
                  highlight === i ? "bg-orange-400/6" : ""
                } ${opt === value ? "font-semibold text-white" : "text-slate-300"}`}
              >
                <span className="truncate">{opt === "All" ? "All status" : opt}</span>
                {opt === value && <FiCheck className="h-4 w-4 text-orange-300" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
