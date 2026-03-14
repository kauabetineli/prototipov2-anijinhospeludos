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
import { getAll, createItem, deleteItem, KEYS, type Animal, type Voluntario, type EventoAnimal } from "@/lib/storage";

export default function EventosPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [animalId, setAnimalId] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [detalhes, setDetalhes] = useState("");

  const load = () => {
    setAnimais(getAll<Animal>(KEYS.ANIMAIS));
    setVoluntarios(getAll<Voluntario>(KEYS.VOLUNTARIOS));
    setEventos(getAll<EventoAnimal>(KEYS.EVENTOS));
  };
  useEffect(load, []);

  const getName = (id: string, list: { id: string; nome?: string; nome_completo?: string }[]) => {
    const item = list.find(i => i.id === id);
    return item?.nome_completo || item?.nome || "—";
  };

  const save = () => {
    if (!animalId || !tipoEvento.trim()) { toast({ title: "Animal e tipo são obrigatórios", variant: "destructive" }); return; }
    createItem<EventoAnimal>(KEYS.EVENTOS, {
      animal_id: animalId, tipo_evento: tipoEvento,
      ocorrido_em: new Date().toISOString(), registrado_por: registradoPor, detalhes,
    });
    toast({ title: "Evento registrado!" });
    setDialogOpen(false); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl text-foreground">📅 Eventos</h1>
        <Button onClick={() => { setAnimalId(""); setTipoEvento(""); setRegistradoPor(""); setDetalhes(""); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Evento
        </Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Animal</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Registrado por</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {eventos.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum evento registrado</TableCell></TableRow>
            ) : eventos.map(e => (
              <TableRow key={e.id}>
                <TableCell>{getName(e.animal_id, animais)}</TableCell>
                <TableCell>{e.tipo_evento}</TableCell>
                <TableCell>{new Date(e.ocorrido_em).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{e.registrado_por ? getName(e.registrado_por, voluntarios) : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.EVENTOS, e.id); load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Animal *</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{animais.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Evento *</Label>
              <Input value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} placeholder="consulta, resgate, adoção..." />
            </div>
            <div className="grid gap-2">
              <Label>Registrado por</Label>
              <Select value={registradoPor} onValueChange={setRegistradoPor}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Detalhes</Label>
              <Textarea value={detalhes} onChange={e => setDetalhes(e.target.value)} />
            </div>
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
