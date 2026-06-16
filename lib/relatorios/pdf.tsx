import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import type { ConfiguracaoSistema, MovimentoResidente, Ocorrencia, Residente } from "@/types/database";
import { getConfig, getRelatorioMensalInfo } from "./data";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: "#111827", fontFamily: "Helvetica" },
  header: { marginBottom: 18, borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 12 },
  org: { fontSize: 10, color: "#4b5563", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6, padding: 8 },
  statValue: { fontSize: 18, fontWeight: 700, marginBottom: 3 },
  statLabel: { color: "#6b7280" },
  table: { borderWidth: 1, borderColor: "#e5e7eb" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", minHeight: 26 },
  headerRow: { backgroundColor: "#f9fafb" },
  cell: { padding: 6, flexGrow: 1 },
  small: { fontSize: 8, color: "#6b7280" },
  empty: { color: "#6b7280", padding: 16, textAlign: "center" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, fontSize: 8, color: "#9ca3af" },
  aviso: {
    marginBottom: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 4,
    backgroundColor: "#fffbeb",
    color: "#92400e",
  },
});

const MOVIMENTO_LABELS: Record<MovimentoResidente["tipo"], string> = {
  entrada: "Entrada",
  saida_temporaria: "Saida temporaria",
  retorno: "Retorno",
  saida_definitiva: "Saida definitiva",
};

const OCORRENCIA_LABELS: Record<Ocorrencia["status"], string> = {
  aberta: "Aberta",
  em_avaliacao: "Em avaliacao",
  confirmada: "Confirmada",
  improcedente: "Improcedente",
};

interface BasePdfProps {
  title: string;
  subtitle: string;
  configuracoes: ConfiguracaoSistema[];
  children: React.ReactNode;
}

function RelatorioDocument({ title, subtitle, configuracoes, children }: BasePdfProps) {
  const nomeOsc = getConfig(
    configuracoes,
    "nome_osc",
    getConfig(configuracoes, "nome_instituicao", "Projeto Travessia")
  );

  return (
    <Document title={title} author={nomeOsc} subject={subtitle} language="pt-BR">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.org}>{nomeOsc}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Gerado em ${formatDateTime(new Date())} - Pagina ${pageNumber} de ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

function nomeResidente(residentes: Residente[], residenteId: string) {
  const residente = residentes.find((r) => r.id === residenteId);
  return {
    nome: residente?.nome_social ?? residente?.nome_completo ?? residenteId,
    prontuario: residente?.numero_prontuario ?? "-",
  };
}

function Stats({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <View style={styles.statsRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.stat}>
          <Text style={styles.statValue}>{String(item.value)}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyTable() {
  return <Text style={styles.empty}>Nenhum registro encontrado para os filtros selecionados.</Text>;
}

export async function renderEntradasSaidasPdf(params: {
  dataInicio: string;
  dataFim: string;
  residentes: Residente[];
  movimentos: MovimentoResidente[];
  configuracoes: ConfiguracaoSistema[];
}) {
  const entradas = params.movimentos.filter((m) => m.tipo === "entrada").length;
  const saidas = params.movimentos.filter((m) => m.tipo === "saida_definitiva").length;
  const temporarias = params.movimentos.filter((m) => m.tipo === "saida_temporaria" || m.tipo === "retorno").length;

  return renderToBuffer(
    <RelatorioDocument
      title="Relatorio de Entradas e Saidas"
      subtitle={`${formatDate(params.dataInicio)} a ${formatDate(params.dataFim)}`}
      configuracoes={params.configuracoes}
    >
      <Stats
        items={[
          { label: "Entradas", value: entradas },
          { label: "Saidas definitivas", value: saidas },
          { label: "Saidas temporarias / retornos", value: temporarias },
        ]}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movimentos</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, { flexBasis: "18%" }]}>Data</Text>
            <Text style={[styles.cell, { flexBasis: "28%" }]}>Acolhido</Text>
            <Text style={[styles.cell, { flexBasis: "18%" }]}>Tipo</Text>
            <Text style={[styles.cell, { flexBasis: "24%" }]}>Motivo</Text>
            <Text style={[styles.cell, { flexBasis: "12%" }]}>Destino</Text>
          </View>
          {params.movimentos.length === 0 ? (
            <EmptyTable />
          ) : (
            params.movimentos.map((m) => {
              const residente = nomeResidente(params.residentes, m.residente_id);
              return (
                <View key={m.id} style={styles.row} wrap={false}>
                  <Text style={[styles.cell, { flexBasis: "18%" }]}>{formatDateTime(m.data_hora)}</Text>
                  <View style={[styles.cell, { flexBasis: "28%" }]}>
                    <Text>{residente.nome}</Text>
                    <Text style={styles.small}>{residente.prontuario}</Text>
                  </View>
                  <Text style={[styles.cell, { flexBasis: "18%" }]}>{MOVIMENTO_LABELS[m.tipo]}</Text>
                  <Text style={[styles.cell, { flexBasis: "24%" }]}>{m.motivo ?? "-"}</Text>
                  <Text style={[styles.cell, { flexBasis: "12%" }]}>{m.destino ?? "-"}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </RelatorioDocument>
  );
}

export async function renderAtivosPdf(params: {
  residentes: Residente[];
  configuracoes: ConfiguracaoSistema[];
}) {
  const ativos = params.residentes
    .filter((r) => r.status === "ativo")
    .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

  return renderToBuffer(
    <RelatorioDocument
      title="Lista de Acolhidos Ativos"
      subtitle={`${ativos.length} acolhidos ativos`}
      configuracoes={params.configuracoes}
    >
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, { flexBasis: "30%" }]}>Nome</Text>
          <Text style={[styles.cell, { flexBasis: "18%" }]}>Prontuario</Text>
          <Text style={[styles.cell, { flexBasis: "12%" }]}>Fase</Text>
          <Text style={[styles.cell, { flexBasis: "20%" }]}>Entrada</Text>
          <Text style={[styles.cell, { flexBasis: "20%" }]}>CPF</Text>
        </View>
        {ativos.map((r) => (
          <View key={r.id} style={styles.row} wrap={false}>
            <Text style={[styles.cell, { flexBasis: "30%" }]}>{r.nome_social ?? r.nome_completo}</Text>
            <Text style={[styles.cell, { flexBasis: "18%" }]}>{r.numero_prontuario}</Text>
            <Text style={[styles.cell, { flexBasis: "12%" }]}>Fase {r.fase_atual}</Text>
            <Text style={[styles.cell, { flexBasis: "20%" }]}>{formatDate(r.data_entrada)}</Text>
            <Text style={[styles.cell, { flexBasis: "20%" }]}>{r.cpf ?? "-"}</Text>
          </View>
        ))}
      </View>
    </RelatorioDocument>
  );
}

export async function renderOcorrenciasPdf(params: {
  dataInicio: string;
  dataFim: string;
  residentes: Residente[];
  ocorrencias: Ocorrencia[];
  configuracoes: ConfiguracaoSistema[];
}) {
  return renderToBuffer(
    <RelatorioDocument
      title="Historico de Ocorrencias"
      subtitle={`${formatDate(params.dataInicio)} a ${formatDate(params.dataFim)}`}
      configuracoes={params.configuracoes}
    >
      <Stats
        items={[
          { label: "Total", value: params.ocorrencias.length },
          { label: "Abertas", value: params.ocorrencias.filter((o) => o.status === "aberta").length },
          { label: "Confirmadas", value: params.ocorrencias.filter((o) => o.status === "confirmada").length },
        ]}
      />
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, { flexBasis: "15%" }]}>Data</Text>
          <Text style={[styles.cell, { flexBasis: "24%" }]}>Acolhido</Text>
          <Text style={[styles.cell, { flexBasis: "16%" }]}>Gravidade</Text>
          <Text style={[styles.cell, { flexBasis: "15%" }]}>Status</Text>
          <Text style={[styles.cell, { flexBasis: "30%" }]}>Descricao</Text>
        </View>
        {params.ocorrencias.length === 0 ? (
          <EmptyTable />
        ) : (
          params.ocorrencias.map((o) => {
            const residente = nomeResidente(params.residentes, o.residente_id);
            return (
              <View key={o.id} style={styles.row} wrap={false}>
                <Text style={[styles.cell, { flexBasis: "15%" }]}>{formatDate(o.data_ocorrencia)}</Text>
                <Text style={[styles.cell, { flexBasis: "24%" }]}>{residente.nome}</Text>
                <Text style={[styles.cell, { flexBasis: "16%" }]}>{o.gravidade}</Text>
                <Text style={[styles.cell, { flexBasis: "15%" }]}>{OCORRENCIA_LABELS[o.status]}</Text>
                <Text style={[styles.cell, { flexBasis: "30%" }]}>{o.descricao}</Text>
              </View>
            );
          })
        )}
      </View>
    </RelatorioDocument>
  );
}

export async function renderMensalPdf(params: {
  dataInicio: string;
  dataFim: string;
  residentes: Residente[];
  movimentos: MovimentoResidente[];
  ocorrencias: Ocorrencia[];
  configuracoes: ConfiguracaoSistema[];
}) {
  const ativos = params.residentes.filter((r) => r.status === "ativo");
  const entradas = params.movimentos.filter((m) => m.tipo === "entrada").length;
  const saidas = params.movimentos.filter((m) => m.tipo === "saida_definitiva").length;
  const capacidade = Number(getConfig(params.configuracoes, "capacidade_total", "50"));
  const info = getRelatorioMensalInfo(params.dataInicio, params.dataFim);
  const subtitle =
    info.tipo === "periodico"
      ? info.periodoLabel
      : `${info.periodoLabel} (${formatDate(params.dataInicio)} a ${formatDate(params.dataFim)})`;

  return renderToBuffer(
    <RelatorioDocument title={info.titulo} subtitle={subtitle} configuracoes={params.configuracoes}>
      {info.aviso && (
        <View style={styles.aviso}>
          <Text>{info.aviso}</Text>
        </View>
      )}
      <Stats
        items={[
          { label: "Acolhidos ativos", value: ativos.length },
          { label: "Vagas livres", value: Math.max(capacidade - ativos.length, 0) },
          { label: "Entradas no periodo", value: entradas },
          { label: "Saidas definitivas", value: saidas },
        ]}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuicao por fase</Text>
        <View style={styles.table}>
          {[1, 2, 3, 4].map((fase) => {
            const count = ativos.filter((r) => r.fase_atual === fase).length;
            const pct = ativos.length > 0 ? Math.round((count / ativos.length) * 100) : 0;
            return (
              <View key={fase} style={styles.row}>
                <Text style={[styles.cell, { flexBasis: "40%" }]}>Fase {fase}</Text>
                <Text style={[styles.cell, { flexBasis: "30%" }]}>{count} acolhidos</Text>
                <Text style={[styles.cell, { flexBasis: "30%" }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ocorrencias no periodo</Text>
        <Stats
          items={[
            { label: "Total", value: params.ocorrencias.length },
            { label: "Abertas ou em avaliacao", value: params.ocorrencias.filter((o) => o.status === "aberta" || o.status === "em_avaliacao").length },
            { label: "Graves/gravissimas", value: params.ocorrencias.filter((o) => o.gravidade === "grave" || o.gravidade === "gravissima").length },
          ]}
        />
      </View>
    </RelatorioDocument>
  );
}
