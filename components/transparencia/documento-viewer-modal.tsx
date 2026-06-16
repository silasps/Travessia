"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

function getExtension(url: string) {
  try {
    return new URL(url).pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

export function StopPropagation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

export function DocumentoViewerModal({
  titulo,
  url,
  className,
  children,
}: {
  titulo: string;
  url: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ext = getExtension(url);
  const isPdf = ext === "pdf";
  const isImage = IMAGE_EXTS.includes(ext);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn("cursor-pointer", className)}
      >
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[92vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{titulo}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-[75vh] overflow-auto rounded-xl border border-gray-100 bg-gray-50">
            {isPdf ? (
              <iframe src={url} title={titulo} className="w-full h-full min-h-[75vh]" />
            ) : isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={titulo} className="w-full h-auto" />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[40vh] p-6 text-center">
                <p className="text-sm text-gray-500">
                  Pré-visualização não disponível para este tipo de arquivo. Use o botão abaixo para abrir.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Download className="size-4" />
              Abrir em nova aba / baixar
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
