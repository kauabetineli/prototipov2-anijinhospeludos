import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAll, createItem, updateItem, deleteItem, KEYS, type Voluntario } from "@/lib/storage";

const empty: Omit<Voluntario, "id"> = {
  email: "", nome_completo: "", telefone: "", endereco: "",
  criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(),
};

export default function VoluntariosPage() {
  const [items, setItems] = useState<Voluntario[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Voluntario | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = () => setItems(getAll<Voluntario>(KEYS.VOLUNTARIOS));
  useEffect(load, []);

  const filtered = items.filter(v =>
    v.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm({ ...empty, criado_em: new Date().toISOString() }); setDialogOpen(true); };
  const openEdit = (v: Voluntario) => { setEditing(v); setForm(v); setDialogOpen(true); };

  const save = () => {
    if (!form.nome_completo.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    if (editing) {
      updateItem<Voluntario>(KEYS.VOLUNTARIOS, editing.id, form);
      toast({ title: "Voluntário atualizado!" });
    } else {
      createItem<Voluntario>(KEYS.VOLUNTARIOS, form);
      toast({ title: "Voluntário cadastrado!" });
    }
    setDialogOpen(false);
    load();
  };

  const remove = (id: string) => { deleteItem<Voluntario>(KEYS.VOLUNTARIOS, id); toast({ title: "Voluntário removido" }); load(); };
  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl text-foreground">👥 Voluntários</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo Voluntário</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar voluntários..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum voluntário cadastrado</TableCell></TableRow>
              ) : filtered.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.nome_completo}</TableCell>
                  <TableCell>{v.email || "—"}</TableCell>
                  <TableCell>{v.telefone || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Voluntário" : "Novo Voluntário"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome Completo *</Label><Input value={form.nome_completo} onChange={e => set("nome_completo", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Endereço</Label><Input value={form.endereco} onChange={e => set("endereco", e.target.value)} /></div>
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
