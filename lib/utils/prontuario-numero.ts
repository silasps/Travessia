export function formatProntuarioNumero(numero: string): string {
  return numero;
}

export function gerarNumeroProntuario(ano: number, seq: number): string {
  return `PT-${ano}-${String(seq).padStart(3, "0")}`;
}

export function gerarNumeroOcorrencia(ano: number, seq: number): string {
  return `OC-${ano}-${String(seq).padStart(3, "0")}`;
}
