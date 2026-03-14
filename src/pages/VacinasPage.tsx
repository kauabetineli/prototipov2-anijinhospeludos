import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAll, createItem, deleteItem, KEYS, type Animal, type Voluntario, type HistoricoVacina } from "@/lib/storage";

export default function VacinasPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [vacinas, setVacinas] = useState<HistoricoVacina[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

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
    setVacinas(getAll<HistoricoVacina>(KEYS.VACINAS));
  };
  useEffect(load, []);

  const getName = (id: string, list: { id: string; nome?: string; nome_completo?: string }[]) => {
    const item = list.find(i => i.id === id);
    return item?.nome_completo || item?.nome || "—";
  };

  const openNew = () => {
    setAnimalId(""); setNomeVacina(""); setAplicadoEm(""); setProximaDose("");
    setAplicadoPor(""); setLote(""); setObs(""); setDialogOpen(true);
  };

  const save = () => {
    if (!animalId || !nomeVacina.trim() || !aplicadoEm) {
      toast({ title: "Animal, vacina e data são obrigatórios", variant: "destructive" }); return;
    }
    createItem<HistoricoVacina>(KEYS.VACINAS, {
      animal_id: animalId, nome_vacina: nomeVacina, aplicado_em: aplicadoEm,
      proxima_dose_em: proximaDose, aplicado_por: aplicadoPor, lote, observacoes: obs,
      criado_em: new Date().toISOString(),
    });
    toast({ title: "Vacina registrada!" });
    setDialogOpen(false); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl text-foreground">💉 Vacinas</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova Vacina</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Animal</TableHead><TableHead>Vacina</TableHead><TableHead>Aplicada em</TableHead><TableHead>Próxima dose</TableHead><TableHead>Lote</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {vacinas.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma vacina registrada</TableCell></TableRow>
            ) : vacinas.map(v => (
              <TableRow key={v.id}>
                <TableCell>{getName(v.animal_id, animais)}</TableCell>
                <TableCell>{v.nome_vacina}</TableCell>
                <TableCell>{v.aplicado_em ? new Date(v.aplicado_em).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell>{v.proxima_dose_em ? new Date(v.proxima_dose_em).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell>{v.lote || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.VACINAS, v.id); load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Vacina</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Animal *</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{animais.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Nome da Vacina *</Label><Input value={nomeVacina} onChange={e => setNomeVacina(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Aplicada em *</Label><Input type="date" value={aplicadoEm} onChange={e => setAplicadoEm(e.target.value)} /></div>
              <div className="grid gap-2"><Label>Próxima dose</Label><Input type="date" value={proximaDose} onChange={e => setProximaDose(e.target.value)} /></div>
            </div>
            <div className="grid gap-2">
              <Label>Aplicada por</Label>
              <Select value={aplicadoPor} onValueChange={setAplicadoPor}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Lote</Label><Input value={lote} onChange={e => setLote(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Observações</Label><Textarea value={obs} onChange={e => setObs(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
