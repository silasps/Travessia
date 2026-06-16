"use client";

import { useRouter } from "next/navigation";

export function ResidenteRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(href)}
      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
    >
      {children}
    </tr>
  );
}
