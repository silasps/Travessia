"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { setPreviewResidente } from "@/lib/actions/preview-role";

export function VerPortalBtn({ residenteId, nome }: { residenteId: string; nome: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      title={`Ver portal de ${nome}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          await setPreviewResidente(residenteId);
          router.push("/meu-espaco");
        });
      }}
      className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-sky-700 hover:bg-sky-50 transition-colors disabled:opacity-50"
    >
      <Eye className="size-4" />
    </button>
  );
}
