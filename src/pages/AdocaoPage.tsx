import { useState, useEffect, useMemo } from "react";
import { Search, Dog, Cat, Heart, Calendar, Hash, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAll, KEYS, type Animal } from "@/lib/storage";
import { format, differenceInMonths, differenceInYears, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function calcularIdade(dataNascimento: string): string {
  if (!dataNascimento) return "Idade desconhecida";
  const nascimento = parseISO(dataNascimento);
  const anos = differenceInYears(new Date(), nascimento);
  if (anos >= 1) return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  const meses = differenceInMonths(new Date(), nascimento);
  return meses <= 0 ? "Menos de 1 mês" : `${meses} ${meses === 1 ? "mês" : "meses"}`;
}

function formatarSexo(sexo: string) {
  const map: Record<string, string> = { macho: "Macho", femea: "Fêmea", desconhecido: "Não identificado" };
  return map[sexo] || sexo;
}

export default function AdocaoPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState<string>("todos");
  const [filtroSexo, setFiltroSexo] = useState<string>("todos");

  useEffect(() => {
    setAnimais(getAll<Animal>(KEYS.ANIMAIS));
  }, []);

  const disponiveis = useMemo(() => {
    return animais
      .filter((a) => a.status === "disponivel")
      .filter((a) => {
        const matchSearch =
          a.nome.toLowerCase().includes(search.toLowerCase()) ||
          a.raca.toLowerCase().includes(search.toLowerCase());
        const matchEspecie = filtroEspecie === "todos" || a.especie === filtroEspecie;
        const matchSexo = filtroSexo === "todos" || a.sexo === filtroSexo;
        return matchSearch && matchEspecie && matchSexo;
      });
  }, [animais, search, filtroEspecie, filtroSexo]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="flex items-center justify-center gap-3 text-foreground">
          <Heart className="h-10 w-10 text-primary fill-primary" />
          Adoção
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conheça nossos anjinhos que estão esperando por um lar cheio de amor. Cada um deles tem uma história especial!
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou raça..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="cachorro">Cachorro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroSexo} onValueChange={setFiltroSexo}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="femea">Fêmea</SelectItem>
                <SelectItem value="desconhecido">Não identificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contador */}
      <p className="text-sm text-muted-foreground">
        {disponiveis.length} {disponiveis.length === 1 ? "animal disponível" : "animais disponíveis"} para adoção
      </p>

      {/* Grid de animais */}
      {disponiveis.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              Nenhum animal disponível no momento
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre animais com status "Disponível" para que apareçam aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disponiveis.map((animal) => (
            <Card
              key={animal.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              {/* Cabeçalho visual */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 via-secondary to-accent/10 flex items-center justify-center">
                {animal.especie === "cachorro" ? (
                  <Dog className="h-24 w-24 text-primary/50 group-hover:text-primary/70 transition-colors" />
                ) : (
                  <Cat className="h-24 w-24 text-primary/50 group-hover:text-primary/70 transition-colors" />
                )}
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                  {animal.especie === "cachorro" ? "🐶 Cachorro" : "🐱 Gato"}
                </Badge>
              </div>

              {/* Conteúdo */}
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{animal.nome}</h3>
                  {animal.raca && (
                    <p className="text-sm text-muted-foreground">{animal.raca}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <span>{calcularIdade(animal.data_nascimento)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4 shrink-0 text-primary" />
                    <span>{formatarSexo(animal.sexo)}</span>
                  </div>
                  {animal.numero_microchip && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Hash className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">Microchip: {animal.numero_microchip}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Entrada: {animal.data_entrada
                        ? format(parseISO(animal.data_entrada), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </span>
                  </div>
                </div>

                {animal.observacoes && (
                  <div className="flex gap-2 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <p className="line-clamp-3">{animal.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
