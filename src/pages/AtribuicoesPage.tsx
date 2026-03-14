import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAll, createItem, deleteItem, KEYS,
  type Animal, type Voluntario, type Local,
  type AtribuicaoAnimalLocal, type AtribuicaoAnimalVoluntario,
} from "@/lib/storage";

export default function AtribuicoesPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [atribLocais, setAtribLocais] = useState<AtribuicaoAnimalLocal[]>([]);
  const [atribVols, setAtribVols] = useState<AtribuicaoAnimalVoluntario[]>([]);
  const [dialogType, setDialogType] = useState<"local" | "voluntario" | null>(null);
  const { toast } = useToast();

  // Form state
  const [animalId, setAnimalId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [atribPor, setAtribPor] = useState("");
  const [papel, setPapel] = useState("");
  const [obs, setObs] = useState("");

  const load = () => {
    setAnimais(getAll<Animal>(KEYS.ANIMAIS));
    setVoluntarios(getAll<Voluntario>(KEYS.VOLUNTARIOS));
    setLocais(getAll<Local>(KEYS.LOCAIS));
    setAtribLocais(getAll<AtribuicaoAnimalLocal>(KEYS.ATRIB_LOCAL));
    setAtribVols(getAll<AtribuicaoAnimalVoluntario>(KEYS.ATRIB_VOLUNTARIO));
  };
  useEffect(load, []);

  const getName = (id: string, list: { id: string; nome?: string; nome_completo?: string }[]) => {
    const item = list.find(i => i.id === id);
    return item?.nome_completo || item?.nome || "—";
  };

  const openDialog = (type: "local" | "voluntario") => {
    setDialogType(type);
    setAnimalId(""); setTargetId(""); setAtribPor(""); setPapel(""); setObs("");
  };

  const saveLocal = () => {
    if (!animalId || !targetId) { toast({ title: "Selecione animal e local", variant: "destructive" }); return; }
    createItem<AtribuicaoAnimalLocal>(KEYS.ATRIB_LOCAL, {
      animal_id: animalId, local_id: targetId, atribuido_por: atribPor,
      atribuido_em: new Date().toISOString(), liberado_em: "", papel, observacoes: obs,
    });
    toast({ title: "Atribuição criada!" });
    setDialogType(null); load();
  };

  const saveVol = () => {
    if (!animalId || !targetId) { toast({ title: "Selecione animal e voluntário", variant: "destructive" }); return; }
    createItem<AtribuicaoAnimalVoluntario>(KEYS.ATRIB_VOLUNTARIO, {
      animal_id: animalId, voluntario_id: targetId, atribuido_por: atribPor,
      atribuido_em: new Date().toISOString(), liberado_em: "", responsabilidade: papel, observacoes: obs,
    });
    toast({ title: "Atribuição criada!" });
    setDialogType(null); load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-foreground">🔗 Atribuições</h1>

      <Tabs defaultValue="locais">
        <TabsList>
          <TabsTrigger value="locais">Animal → Local</TabsTrigger>
          <TabsTrigger value="voluntarios">Animal → Voluntário</TabsTrigger>
        </TabsList>

        <TabsContent value="locais" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openDialog("local")}><Plus className="h-4 w-4 mr-1" /> Nova Atribuição</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Animal</TableHead><TableHead>Local</TableHead><TableHead>Papel</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {atribLocais.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma atribuição</TableCell></TableRow>
                ) : atribLocais.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{getName(a.animal_id, animais)}</TableCell>
                    <TableCell>{getName(a.local_id, locais)}</TableCell>
                    <TableCell>{a.papel || "—"}</TableCell>
                    <TableCell>{new Date(a.atribuido_em).toLocaleDateString("pt-BR")}</TableCell>
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
            <Button onClick={() => openDialog("voluntario")}><Plus className="h-4 w-4 mr-1" /> Nova Atribuição</Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Animal</TableHead><TableHead>Voluntário</TableHead><TableHead>Responsabilidade</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {atribVols.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma atribuição</TableCell></TableRow>
                ) : atribVols.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{getName(a.animal_id, animais)}</TableCell>
                    <TableCell>{getName(a.voluntario_id, voluntarios)}</TableCell>
                    <TableCell>{a.responsabilidade || "—"}</TableCell>
                    <TableCell>{new Date(a.atribuido_em).toLocaleDateString("pt-BR")}</TableCell>
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

      <Dialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Atribuição — {dialogType === "local" ? "Local" : "Voluntário"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Animal *</Label>
              <Select value={animalId} onValueChange={setAnimalId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{animais.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{dialogType === "local" ? "Local" : "Voluntário"} *</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {dialogType === "local"
                    ? locais.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)
                    : voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Atribuído por</Label>
              <Select value={atribPor} onValueChange={setAtribPor}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{voluntarios.map(v => <SelectItem key={v.id} value={v.id}>{v.nome_completo}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{dialogType === "local" ? "Papel" : "Responsabilidade"}</Label>
              <Input value={papel} onChange={e => setPapel(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea value={obs} onChange={e => setObs(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>Cancelar</Button>
            <Button onClick={dialogType === "local" ? saveLocal : saveVol}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
