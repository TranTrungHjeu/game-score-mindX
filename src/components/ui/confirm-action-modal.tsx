"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-slate-950/68 px-4 py-6 backdrop-blur-md sm:px-6"
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center">
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-action-title"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="arena-panel relative w-full max-w-xl overflow-hidden rounded-none border-2 border-white/80 p-6 text-slate-900 shadow-[0_32px_80px_rgba(15,23,42,0.34)] sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(170,118,16,0.18),transparent_18%),radial-gradient(circle_at_84%_12%,rgba(201,31,46,0.12),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(201,31,46,0.03)_100%)]" />
              <div className="relative">
                <div className="kid-chip text-sm font-bold text-red-800">Xác nhận thao tác</div>
                <h2 id="confirm-action-title" className="mt-4 font-heading text-3xl leading-tight text-slate-950 sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-none border-2 border-red-400 bg-red-600 px-6 py-3 font-black text-white shadow-[0_18px_34px_rgba(185,28,28,0.2)]"
                  >
                    {confirmLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-none border-2 border-white/90 bg-white px-6 py-3 font-bold text-slate-700"
                  >
                    {cancelLabel}
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
