import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Eye, Syringe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getAll, createItem, updateItem, deleteItem, KEYS,
  type Animal, type Voluntario, type Local,
  type HistoricoVacina, type AtribuicaoAnimalLocal, type AtribuicaoAnimalVoluntario,
} from "@/lib/storage";

const especieOptions = ["cachorro", "gato", "ave", "roedor", "outro"] as const;
const sexoOptions = ["macho", "femea", "desconhecido"] as const;
const statusOptions = [
  { value: "disponivel", label: "Disponível", color: "bg-green-100 text-green-800" },
  { value: "adotado", label: "Adotado", color: "bg-blue-100 text-blue-800" },
  { value: "em_tratamento", label: "Em Tratamento", color: "bg-yellow-100 text-yellow-800" },
  { value: "em_lar_temporario", label: "Em Lar Temporário", color: "bg-purple-100 text-purple-800" },
  { value: "falecido", label: "Falecido", color: "bg-gray-100 text-gray-800" },
] as const;

const emptyAnimal: Omit<Animal, "id"> = {
  nome: "", especie: "outro", raca: "", sexo: "desconhecido",
  data_nascimento: "", numero_microchip: "", data_entrada: new Date().toISOString(),
  status: "disponivel", observacoes: "",
  criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(),
};

function StatusBadge({ status }: { status: string }) {
  const opt = statusOptions.find(s => s.value === status);
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${opt?.color || "bg-muted text-muted-foreground"}`}>{opt?.label || status}</span>;
}

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [vacinas, setVacinas] = useState<HistoricoVacina[]>([]);
  const [atribLocais, setAtribLocais] = useState<AtribuicaoAnimalLocal[]>([]);
  const [atribVols, setAtribVols] = useState<AtribuicaoAnimalVoluntario[]>([]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState(emptyAnimal);
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null);

  // Sub-forms for detail view
  const [vacinaForm, setVacinaForm] = useState({ nome_vacina: "", aplicado_em: "", proxima_dose_em: "", aplicado_por: "", lote: "", observacoes: "" });
  const [vacinaDialogOpen, setVacinaDialogOpen] = useState(false);
  const [atribLocalForm, setAtribLocalForm] = useState({ local_id: "", atribuido_por: "", papel: "", observacoes: "" });
  const [atribLocalDialogOpen, setAtribLocalDialogOpen] = useState(false);
  const [atribVolForm, setAtribVolForm] = useState({ voluntario_id: "", atribuido_por: "", responsabilidade: "", observacoes: "" });
  const [atribVolDialogOpen, setAtribVolDialogOpen] = useState(false);

  const { toast } = useToast();

  const load = () => {
    setAnimais(getAll<Animal>(KEYS.ANIMAIS));
    setVoluntarios(getAll<Voluntario>(KEYS.VOLUNTARIOS));
    setLocais(getAll<Local>(KEYS.LOCAIS));
    setVacinas(getAll<HistoricoVacina>(KEYS.VACINAS));
    setAtribLocais(getAll<AtribuicaoAnimalLocal>(KEYS.ATRIB_LOCAL));
    setAtribVols(getAll<AtribuicaoAnimalVoluntario>(KEYS.ATRIB_VOLUNTARIO));
  };
  useEffect(load, []);

  const filtered = animais.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.especie.toLowerCase().includes(search.toLowerCase()) ||
    a.raca.toLowerCase().includes(search.toLowerCase())
  );

  const getName = (id: string, list: { id: string; nome?: string; nome_completo?: string }[]) => {
    const item = list.find(i => i.id === id);
    return item?.nome_completo || item?.nome || "—";
  };

  const openNew = () => { setEditing(null); setForm({ ...emptyAnimal, criado_em: new Date().toISOString(), data_entrada: new Date().toISOString() }); setDialogOpen(true); };
  const openEdit = (a: Animal) => { setEditing(a); setForm(a); setDialogOpen(true); };

  const save = () => {
    if (!form.nome.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    if (editing) {
      updateItem<Animal>(KEYS.ANIMAIS, editing.id, form);
      toast({ title: "Animal atualizado!" });
    } else {
      createItem<Animal>(KEYS.ANIMAIS, form);
      toast({ title: "Animal cadastrado!" });
    }
    setDialogOpen(false);
    load();
  };

  const remove = (id: string) => {
    deleteItem<Animal>(KEYS.ANIMAIS, id);
    toast({ title: "Animal removido" });
    load();
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Detail view helpers
  const animalVacinas = detailAnimal ? vacinas.filter(v => v.animal_id === detailAnimal.id) : [];
  const animalAtribLocais = detailAnimal ? atribLocais.filter(a => a.animal_id === detailAnimal.id) : [];
  const animalAtribVols = detailAnimal ? atribVols.filter(a => a.animal_id === detailAnimal.id) : [];

  const saveVacina = () => {
    if (!vacinaForm.nome_vacina.trim() || !vacinaForm.aplicado_em) { toast({ title: "Vacina e data são obrigatórios", variant: "destructive" }); return; }
    createItem<HistoricoVacina>(KEYS.VACINAS, {
      animal_id: detailAnimal!.id, ...vacinaForm, criado_em: new Date().toISOString(),
    });
    toast({ title: "Vacina registrada!" });
    setVacinaDialogOpen(false);
    setVacinaForm({ nome_vacina: "", aplicado_em: "", proxima_dose_em: "", aplicado_por: "", lote: "", observacoes: "" });
    load();
  };

  const saveAtribLocal = () => {
    if (!atribLocalForm.local_id) { toast({ title: "Selecione um local", variant: "destructive" }); return; }
    createItem<AtribuicaoAnimalLocal>(KEYS.ATRIB_LOCAL, {
      animal_id: detailAnimal!.id, local_id: atribLocalForm.local_id, atribuido_por: atribLocalForm.atribuido_por,
      atribuido_em: new Date().toISOString(), liberado_em: "", papel: atribLocalForm.papel, observacoes: atribLocalForm.observacoes,
    });
    toast({ title: "Local atribuído!" });
    setAtribLocalDialogOpen(false);
    setAtribLocalForm({ local_id: "", atribuido_por: "", papel: "", observacoes: "" });
    load();
  };

  const saveAtribVol = () => {
    if (!atribVolForm.voluntario_id) { toast({ title: "Selecione um voluntário", variant: "destructive" }); return; }
    createItem<AtribuicaoAnimalVoluntario>(KEYS.ATRIB_VOLUNTARIO, {
      animal_id: detailAnimal!.id, voluntario_id: atribVolForm.voluntario_id, atribuido_por: atribVolForm.atribuido_por,
      atribuido_em: new Date().toISOString(), liberado_em: "", responsabilidade: atribVolForm.responsabilidade, observacoes: atribVolForm.observacoes,
    });
    toast({ title: "Voluntário atribuído!" });
    setAtribVolDialogOpen(false);
    setAtribVolForm({ voluntario_id: "", atribuido_por: "", responsabilidade: "", observacoes: "" });
    load();
  };

  // Detail view
  if (detailAnimal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setDetailAnimal(null)}>← Voltar</Button>
          <h1 className="text-3xl text-foreground">🐾 {detailAnimal.nome}</h1>
          <StatusBadge status={detailAnimal.status} />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Espécie:</span> <span className="capitalize ml-1">{detailAnimal.especie}</span></div>
              <div><span className="text-muted-foreground">Raça:</span> <span className="ml-1">{detailAnimal.raca || "—"}</span></div>
              <div><span className="text-muted-foreground">Sexo:</span> <span className="capitalize ml-1">{detailAnimal.sexo}</span></div>
              <div><span className="text-muted-foreground">Microchip:</span> <span className="ml-1">{detailAnimal.numero_microchip || "—"}</span></div>
              <div><span className="text-muted-foreground">Nascimento:</span> <span className="ml-1">{detailAnimal.data_nascimento ? new Date(detailAnimal.data_nascimento).toLocaleDateString("pt-BR") : "—"}</span></div>
              <div><span className="text-muted-foreground">Entrada:</span> <span className="ml-1">{new Date(detailAnimal.data_entrada).toLocaleDateString("pt-BR")}</span></div>
              {detailAnimal.observacoes && <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> <span className="ml-1">{detailAnimal.observacoes}</span></div>}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="vacinas">
          <TabsList>
            <TabsTrigger value="vacinas"><Syringe className="h-4 w-4 mr-1" /> Vacinas ({animalVacinas.length})</TabsTrigger>
            <TabsTrigger value="locais"><MapPin className="h-4 w-4 mr-1" /> Locais ({animalAtribLocais.length})</TabsTrigger>
            <TabsTrigger value="voluntarios"><Users className="h-4 w-4 mr-1" /> Voluntários ({animalAtribVols.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="vacinas" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setVacinaDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Adicionar Vacina</Button>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Vacina</TableHead><TableHead>Aplicada em</TableHead><TableHead>Próxima dose</TableHead><TableHead>Lote</TableHead><TableHead>Aplicada por</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {animalVacinas.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhuma vacina registrada</TableCell></TableRow>
                  ) : animalVacinas.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.nome_vacina}</TableCell>
                      <TableCell>{v.aplicado_em ? new Date(v.aplicado_em).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell>{v.proxima_dose_em ? new Date(v.proxima_dose_em).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell>{v.lote || "—"}</TableCell>
                      <TableCell>{v.aplicado_por ? getName(v.aplicado_por, voluntarios) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.VACINAS, v.id); load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="locais" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAtribLocalDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Atribuir Local</Button>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Local</TableHead><TableHead>Papel</TableHead><TableHead>Data</TableHead><TableHead>Atribuído por</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {animalAtribLocais.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum local atribuído</TableCell></TableRow>
                  ) : animalAtribLocais.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{getName(a.local_id, locais)}</TableCell>
                      <TableCell>{a.papel || "—"}</TableCell>
                      <TableCell>{new Date(a.atribuido_em).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{a.atribuido_por ? getName(a.atribuido_por, voluntarios) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.ATRIB_LOCAL, a.id); load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="voluntarios" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAtribVolDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Atribuir Voluntário</Button>
            </div>
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Voluntário</TableHead><TableHead>Responsabilidade</TableHead><TableHead>Data</TableHead><TableHead>Atribuído por</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {animalAtribVols.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum voluntário atribuído</TableCell></TableRow>
                  ) : animalAtribVols.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{getName(a.voluntario_id, voluntarios)}</TableCell>
                      <TableCell>{a.responsabilidade || "—"}</TableCell>
                      <TableCell>{new Date(a.atribuido_em).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{a.atribuido_por ? getName(a.atribuido_por, voluntarios) : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { deleteItem(KEYS.ATRIB_VOLUNTARIO, a.id); load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Vacina Dialog */}
        <Dialog open={vacinaDialogOpen} onOpenChange={setVacinaDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Vacina</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Vacina *</Label><Input value={vacinaForm.nome_vacina} onChange={e => setVacinaForm(p => ({ ...p, nome_vacina: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Aplicada em *</Label><Input type="date" value={vacinaForm.aplicado_em} onChange={e => setVacinaForm(p => ({ ...p, aplicado_em: e.target.value }))} /></div>
                <div className="grid gap-2"><Label>Próxima dose</Label><Input type="date" value={vacinaForm.proxima_dose_em} onChange={e => setVacinaForm(p => ({ ...p, proxima_dose_em: e.target.value }))} /></div>
              </div>
              <div className="grid gap-2">
                <Label>Aplicada por</Label>
                <Select value={vacinaForm.aplicado_por} onValueChange={v => setVacinaForm(p => ({ ...p, aplicado_por: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Lote</Label><Input value={vacinaForm.lote} onChange={e => setVacinaForm(p => ({ ...p, lote: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Observações</Label><Textarea value={vacinaForm.observacoes} onChange={e => setVacinaForm(p => ({ ...p, observacoes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVacinaDialogOpen(false)}>Cancelar</Button>
              <Button onClick={saveVacina}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Atrib Local Dialog */}
        <Dialog open={atribLocalDialogOpen} onOpenChange={setAtribLocalDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Atribuir Local</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Local *</Label>
                <Select value={atribLocalForm.local_id} onValueChange={v => setAtribLocalForm(p => ({ ...p, local_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{locais.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Atribuído por</Label>
                <Select value={atribLocalForm.atribuido_por} onValueChange={v => setAtribLocalForm(p => ({ ...p, atribuido_por: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Papel</Label><Input value={atribLocalForm.papel} onChange={e => setAtribLocalForm(p => ({ ...p, papel: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Observações</Label><Textarea value={atribLocalForm.observacoes} onChange={e => setAtribLocalForm(p => ({ ...p, observacoes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAtribLocalDialogOpen(false)}>Cancelar</Button>
              <Button onClick={saveAtribLocal}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Atrib Voluntario Dialog */}
        <Dialog open={atribVolDialogOpen} onOpenChange={setAtribVolDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Atribuir Voluntário</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Voluntário *</Label>
                <Select value={atribVolForm.voluntario_id} onValueChange={v => setAtribVolForm(p => ({ ...p, voluntario_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Atribuído por</Label>
                <Select value={atribVolForm.atribuido_por} onValueChange={v => setAtribVolForm(p => ({ ...p, atribuido_por: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Responsabilidade</Label><Input value={atribVolForm.responsabilidade} onChange={e => setAtribVolForm(p => ({ ...p, responsabilidade: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Observações</Label><Textarea value={atribVolForm.observacoes} onChange={e => setAtribVolForm(p => ({ ...p, observacoes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAtribVolDialogOpen(false)}>Cancelar</Button>
              <Button onClick={saveAtribVol}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl text-foreground">🐾 Animais</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo Animal</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar animais..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Espécie</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum animal cadastrado</TableCell></TableRow>
              ) : filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell className="capitalize">{a.especie}</TableCell>
                  <TableCell>{a.raca || "—"}</TableCell>
                  <TableCell className="capitalize">{a.sexo}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => setDetailAnimal(a)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Animal" : "Novo Animal"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => set("nome", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Espécie</Label>
                <Select value={form.especie} onValueChange={v => set("especie", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {especieOptions.map(e => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Sexo</Label>
                <Select value={form.sexo} onValueChange={v => set("sexo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sexoOptions.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Raça</Label>
              <Input value={form.raca} onChange={e => set("raca", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Microchip</Label>
                <Input value={form.numero_microchip} onChange={e => set("numero_microchip", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} />
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
