import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, History, CalendarClock, Stethoscope, Syringe, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAll, createItem, deleteItem, KEYS, type Animal, type Voluntario, type HistoricoVacina, type TipoRegistroSaude } from "@/lib/storage";

const tipoOptions: { value: TipoRegistroSaude; label: string; icon: React.ReactNode }[] = [
  { value: "vacina", label: "Vacina", icon: <Syringe className="h-5 w-5" /> },
  { value: "consulta", label: "Consulta", icon: <Stethoscope className="h-5 w-5" /> },
  { value: "tratamento", label: "Tratamento", icon: <Pill className="h-5 w-5" /> },
];

const tipoBadgeClass: Record<TipoRegistroSaude, string> = {
  vacina: "bg-primary/15 text-primary border-primary/30",
  consulta: "bg-accent/15 text-accent border-accent/30",
  tratamento: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function SaudePage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [registros, setRegistros] = useState<HistoricoVacina[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistroSaude>("vacina");
  const [animalId, setAnimalId] = useState("");
  const [nomeVacina, setNomeVacina] = useState("");
  const [aplicadoEm, setAplicadoEm] = useState("");
  const [proximaDose, setProximaDose] = useState("");
  const [aplicadoPor, setAplicadoPor] = useState("");
  const [lote, setLote] = useState("");
  const [obs, setObs] = useState("");

  const load = () => {
    setAnimais(getAll<Animal>(KEYS.ANIMAIS));
    setVoluntarios(getAll<Voluntario>(KEYS.VOLUNTARIOS));
    setRegistros(getAll<HistoricoVacina>(KEYS.VACINAS));
  };
  useEffect(load, []);

  const today = new Date().toISOString().slice(0, 10);

  const { passados, futuros } = useMemo(() => {
    const passados: HistoricoVacina[] = [];
    const futuros: HistoricoVacina[] = [];

    registros.forEach((v) => {
      if (v.aplicado_em && v.aplicado_em <= today) passados.push(v);
      if (v.proxima_dose_em && v.proxima_dose_em > today) futuros.push(v);
    });

    passados.sort((a, b) => b.aplicado_em.localeCompare(a.aplicado_em));
    futuros.sort((a, b) => a.proxima_dose_em.localeCompare(b.proxima_dose_em));

    return { passados, futuros };
  }, [registros, today]);

  const getName = (id: string, list: { id: string; nome?: string; nome_completo?: string }[]) => {
    const item = list.find((i) => i.id === id);
    return item?.nome_completo || item?.nome || "—";
  };

  const getTipoLabel = (tipo?: TipoRegistroSaude) => {
    const opt = tipoOptions.find((t) => t.value === tipo);
    return opt?.label || "Vacina";
  };

  const openNew = () => {
    setTipoRegistro("vacina"); setAnimalId(""); setNomeVacina(""); setAplicadoEm("");
    setProximaDose(""); setAplicadoPor(""); setLote(""); setObs(""); setDialogOpen(true);
  };

  const descricaoLabel = tipoRegistro === "vacina" ? "Nome da Vacina" : tipoRegistro === "consulta" ? "Motivo da Consulta" : "Nome do Tratamento";

  const save = () => {
    if (!animalId || !nomeVacina.trim() || !aplicadoEm) {
      toast({ title: "Animal, descrição e data são obrigatórios", variant: "destructive" });
      return;
    }
    createItem<HistoricoVacina>(KEYS.VACINAS, {
      animal_id: animalId, tipo_registro: tipoRegistro, nome_vacina: nomeVacina, aplicado_em: aplicadoEm,
      proxima_dose_em: proximaDose, aplicado_por: aplicadoPor, lote, observacoes: obs,
      criado_em: new Date().toISOString(),
    });
    toast({ title: "Registro salvo!" });
    setDialogOpen(false);
    load();
  };

  const renderTable = (
    title: string,
    icon: React.ReactNode,
    items: HistoricoVacina[],
    dateField: "aplicado_em" | "proxima_dose_em",
    dateLabel: string,
    emptyMsg: string,
  ) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base">Animal</TableHead>
              <TableHead className="text-base">Tipo</TableHead>
              <TableHead className="text-base">Descrição</TableHead>
              <TableHead className="text-base">{dateLabel}</TableHead>
              <TableHead className="text-base">Lote</TableHead>
              <TableHead className="text-right text-base">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-lg text-muted-foreground">
                  {emptyMsg}
                </TableCell>
              </TableRow>
            ) : (
              items.map((v) => (
                <TableRow key={`${v.id}-${dateField}`}>
                  <TableCell className="text-base font-medium">{getName(v.animal_id, animais)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-sm ${tipoBadgeClass[v.tipo_registro || "vacina"]}`}>
                      {getTipoLabel(v.tipo_registro)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-base">{v.nome_vacina}</TableCell>
                  <TableCell className="text-base">
                    {v[dateField] ? new Date(v[dateField]).toLocaleDateString("pt-BR") : "—"}
                  </TableCell>
                  <TableCell className="text-base">{v.lote || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.VACINAS, v.id); load(); }}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-foreground">🩺 Saúde</h1>
        <Button size="lg" onClick={openNew} className="text-base px-6">
          <Plus className="h-5 w-5 mr-2" /> Novo Registro
        </Button>
      </div>

      {renderTable(
        "Histórico Recente",
        <History className="h-6 w-6 text-primary" />,
        passados,
        "aplicado_em",
        "Realizado em",
        "Nenhum registro ainda",
      )}

      {renderTable(
        "Próximos Agendamentos",
        <CalendarClock className="h-6 w-6 text-accent" />,
        futuros,
        "proxima_dose_em",
        "Agendado para",
        "Nenhum agendamento futuro",
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-xl">Novo Registro de Saúde</DialogTitle></DialogHeader>
          <div className="grid gap-5 py-2">
            {/* Tipo selector */}
            <div className="grid gap-2">
              <Label className="text-base">Tipo de Registro *</Label>
              <div className="flex gap-2">
                {tipoOptions.map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={tipoRegistro === t.value ? "default" : "outline"}
                    className="flex-1 gap-2 text-base py-5"
                    onClick={() => setTipoRegistro(t.value)}
                  >
                    {t.icon}
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-base">Animal *</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{animais.map((a) => <SelectItem key={a.id} value={a.id} className="text-base">{a.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-base">{descricaoLabel} *</Label>
              <Input className="h-12 text-base" value={nomeVacina} onChange={(e) => setNomeVacina(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-base">Data *</Label>
                <Input type="date" className="h-12 text-base" value={aplicadoEm} onChange={(e) => setAplicadoEm(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label className="text-base">Retorno / Próxima dose</Label>
                <Input type="date" className="h-12 text-base" value={proximaDose} onChange={(e) => setProximaDose(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-base">Responsável</Label>
              <Select value={aplicadoPor} onValueChange={setAplicadoPor}>
                <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{voluntarios.map((v) => <SelectItem key={v.id} value={v.id} className="text-base">{v.nome_completo}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {tipoRegistro === "vacina" && (
              <div className="grid gap-2">
                <Label className="text-base">Lote</Label>
                <Input className="h-12 text-base" value={lote} onChange={(e) => setLote(e.target.value)} />
              </div>
            )}
            <div className="grid gap-2">
              <Label className="text-base">Observações</Label>
              <Textarea className="text-base min-h-[100px]" value={obs} onChange={(e) => setObs(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="lg" className="text-base" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button size="lg" className="text-base" onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
