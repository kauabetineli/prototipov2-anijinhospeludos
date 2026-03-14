import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAll, createItem, updateItem, deleteItem, KEYS, type Local } from "@/lib/storage";

const empty: Omit<Local, "id"> = {
  nome: "", endereco: "", telefone: "", observacoes: "",
  criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(),
};

export default function LocaisPage() {
  const [items, setItems] = useState<Local[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Local | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = () => setItems(getAll<Local>(KEYS.LOCAIS));
  useEffect(load, []);

  const filtered = items.filter(l => l.nome.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ ...empty, criado_em: new Date().toISOString() }); setDialogOpen(true); };
  const openEdit = (l: Local) => { setEditing(l); setForm(l); setDialogOpen(true); };

  const save = () => {
    if (!form.nome.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    if (editing) {
      updateItem<Local>(KEYS.LOCAIS, editing.id, form);
      toast({ title: "Local atualizado!" });
    } else {
      createItem<Local>(KEYS.LOCAIS, form);
      toast({ title: "Local cadastrado!" });
    }
    setDialogOpen(false);
    load();
  };

  const remove = (id: string) => { deleteItem<Local>(KEYS.LOCAIS, id); toast({ title: "Local removido" }); load(); };
  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl text-foreground">📍 Locais</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo Local</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar locais..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum local cadastrado</TableCell></TableRow>
              ) : filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.nome}</TableCell>
                  <TableCell>{l.endereco || "—"}</TableCell>
                  <TableCell>{l.telefone || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Local" : "Novo Local"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome *</Label><Input value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Endereço</Label><Input value={form.endereco} onChange={e => set("endereco", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} /></div>
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
