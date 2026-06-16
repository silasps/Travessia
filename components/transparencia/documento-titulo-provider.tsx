"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DocumentoEditContextValue {
  editando: boolean;
  setEditando: (v: boolean) => void;
}

const DocumentoEditContext = createContext<DocumentoEditContextValue | null>(null);

export function useDocumentoEdit() {
  const ctx = useContext(DocumentoEditContext);
  if (!ctx) {
    throw new Error("useDocumentoEdit deve ser usado dentro de DocumentoTituloProvider");
  }
  return ctx;
}

export function DocumentoTituloProvider({ children }: { children: ReactNode }) {
  const [editando, setEditando] = useState(false);
  return (
    <DocumentoEditContext.Provider value={{ editando, setEditando }}>
      {children}
    </DocumentoEditContext.Provider>
  );
}
