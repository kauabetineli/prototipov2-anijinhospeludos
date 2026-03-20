import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getAll, KEYS,
  type Animal, type HistoricoVacina, type Voluntario, type Local,
  type AtribuicaoAnimalLocal, type AtribuicaoAnimalVoluntario,
} from "@/lib/storage";
import { BarChart3, PawPrint, Heart, Users, MapPin, AlertTriangle, CalendarCheck, TrendingUp, Activity } from "lucide-react";

const COLORS = [
  "hsl(24, 80%, 55%)",
  "hsl(145, 40%, 45%)",
  "hsl(210, 60%, 50%)",
  "hsl(340, 60%, 55%)",
  "hsl(50, 70%, 50%)",
  "hsl(280, 50%, 55%)",
  "hsl(180, 50%, 45%)",
  "hsl(0, 60%, 50%)",
];

const speciesLabels: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
};

const sexLabels: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
  desconhecido: "Desconhecido",
};

const statusLabels: Record<string, string> = {
  disponivel: "Disponível",
  adotado: "Adotado",
  em_tratamento: "Em Tratamento",
  em_lar_temporario: "Lar Temporário",
  falecido: "Falecido",
};

const tipoLabels: Record<string, string> = {
  vacina: "Vacina",
  consulta: "Consulta",
  tratamento: "Tratamento",
};

export default function EstatisticasPage() {
  const animais = useMemo(() => getAll<Animal>(KEYS.ANIMAIS), []);
  const saude = useMemo(() => getAll<HistoricoVacina>(KEYS.VACINAS), []);
  const voluntarios = useMemo(() => getAll<Voluntario>(KEYS.VOLUNTARIOS), []);
  const locais = useMemo(() => getAll<Local>(KEYS.LOCAIS), []);
  const atribLocais = useMemo(() => getAll<AtribuicaoAnimalLocal>(KEYS.ATRIB_LOCAL), []);
  const atribVols = useMemo(() => getAll<AtribuicaoAnimalVoluntario>(KEYS.ATRIB_VOLUNTARIO), []);

  const today = new Date().toISOString().split("T")[0];

  // Animais por espécie
  const speciesData = useMemo(() => {
    const counts: Record<string, number> = {};
    animais.forEach((a) => { counts[a.especie || "cachorro"] = (counts[a.especie || "cachorro"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: speciesLabels[name] || name, value }));
  }, [animais]);

  // Animais por sexo
  const sexData = useMemo(() => {
    const counts: Record<string, number> = {};
    animais.forEach((a) => { counts[a.sexo || "desconhecido"] = (counts[a.sexo || "desconhecido"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: sexLabels[name] || name, value }));
  }, [animais]);

  // Animais por status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    animais.forEach((a) => { counts[a.status || "disponivel"] = (counts[a.status || "disponivel"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: statusLabels[name] || name, value }));
  }, [animais]);

  // Entradas por mês (últimos 6 meses)
  const entriesByMonth = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const count = animais.filter((a) => a.data_entrada?.startsWith(key)).length;
      months.push({ label, count });
    }
    return months;
  }, [animais]);

  // Registros de saúde por tipo
  const healthByType = useMemo(() => {
    const counts: Record<string, number> = {};
    saude.forEach((s) => { counts[s.tipo_registro || "vacina"] = (counts[s.tipo_registro || "vacina"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: tipoLabels[name] || name, value }));
  }, [saude]);

  // Atendimentos de saúde por mês (últimos 6 meses)
  const healthByMonth = useMemo(() => {
    const now = new Date();
    const months: { label: string; vacina: number; consulta: number; tratamento: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const inMonth = saude.filter((s) => s.aplicado_em?.startsWith(key));
      months.push({
        label,
        vacina: inMonth.filter(s => (s.tipo_registro || "vacina") === "vacina").length,
        consulta: inMonth.filter(s => s.tipo_registro === "consulta").length,
        tratamento: inMonth.filter(s => s.tipo_registro === "tratamento").length,
      });
    }
    return months;
  }, [saude]);

  // Animais com mais registros de saúde (top 5)
  const topAnimaisSaude = useMemo(() => {
    const counts: Record<string, number> = {};
    saude.forEach((s) => { counts[s.animal_id] = (counts[s.animal_id] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => {
        const animal = animais.find(a => a.id === id);
        return { name: animal?.nome || "Desconhecido", value };
      });
  }, [saude, animais]);

  // Animais por local (atribuições ativas)
  const animaisPorLocal = useMemo(() => {
    const ativos = atribLocais.filter(a => !a.liberado_em);
    const counts: Record<string, number> = {};
    ativos.forEach((a) => { counts[a.local_id] = (counts[a.local_id] || 0) + 1; });
    return Object.entries(counts).map(([id, value]) => {
      const local = locais.find(l => l.id === id);
      return { name: local?.nome || "Desconhecido", value };
    });
  }, [atribLocais, locais]);

  // Voluntários com mais animais atribuídos
  const topVoluntarios = useMemo(() => {
    const ativos = atribVols.filter(a => !a.liberado_em);
    const counts: Record<string, number> = {};
    ativos.forEach((a) => { counts[a.voluntario_id] = (counts[a.voluntario_id] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => {
        const vol = voluntarios.find(v => v.id === id);
        return { name: vol?.nome_completo || "Desconhecido", value };
      });
  }, [atribVols, voluntarios]);

  // Indicadores
  const vacinasAtrasadas = saude.filter(s => s.proxima_dose_em && s.proxima_dose_em < today).length;
  const proximasVacinas = saude.filter(s => s.proxima_dose_em && s.proxima_dose_em >= today).length;
  const animaisDisponiveis = animais.filter(a => a.status === "disponivel").length;
  const animaisAdotados = animais.filter(a => a.status === "adotado").length;
  const animaisEmTratamento = animais.filter(a => a.status === "em_tratamento").length;
  const atribuicoesAtivas = atribLocais.filter(a => !a.liberado_em).length + atribVols.filter(a => !a.liberado_em).length;

  const pieConfig: ChartConfig = { value: { label: "Quantidade" } };
  const barConfig: ChartConfig = { count: { label: "Entradas", color: "hsl(24, 80%, 55%)" } };
  const healthBarConfig: ChartConfig = {
    vacina: { label: "Vacinas", color: "hsl(145, 40%, 45%)" },
    consulta: { label: "Consultas", color: "hsl(210, 60%, 50%)" },
    tratamento: { label: "Tratamentos", color: "hsl(340, 60%, 55%)" },
  };

  const isEmpty = animais.length === 0 && saude.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Estatísticas
        </h1>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Nenhum dado cadastrado ainda. Cadastre animais e registros de saúde para ver os gráficos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl text-foreground flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        Estatísticas
      </h1>

      {/* Summary cards - row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total de Animais", value: animais.length, icon: PawPrint, color: "text-primary" },
          { label: "Voluntários", value: voluntarios.length, icon: Users, color: "text-accent" },
          { label: "Locais", value: locais.length, icon: MapPin, color: "text-muted-foreground" },
          { label: "Registros de Saúde", value: saude.length, icon: Heart, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 text-center">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary cards - row 2: status highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Disponíveis", value: animaisDisponiveis, color: "text-green-600", border: "border-green-200" },
          { label: "Adotados", value: animaisAdotados, color: "text-blue-600", border: "border-blue-200" },
          { label: "Em Tratamento", value: animaisEmTratamento, color: "text-yellow-600", border: "border-yellow-200" },
          { label: "Atribuições Ativas", value: atribuicoesAtivas, color: "text-purple-600", border: "border-purple-200" },
          { label: "Doses Atrasadas", value: vacinasAtrasadas, color: "text-destructive", border: "border-destructive/30" },
          { label: "Doses Agendadas", value: proximasVacinas, color: "text-green-600", border: "border-green-200" },
        ].map((s) => (
          <Card key={s.label} className={s.border}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Animais por espécie */}
        {speciesData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Animais por Espécie</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={speciesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {speciesData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Animais por sexo */}
        {sexData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Animais por Sexo</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={sexData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {sexData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Animais por status */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Animais por Status</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => (<Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Registros de saúde por tipo */}
        {healthByType.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Registros de Saúde por Tipo</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={healthByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {healthByType.map((_, i) => (<Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Entradas por mês */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Entradas de Animais por Mês</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[300px] w-full">
              <BarChart data={entriesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-sm" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(24, 80%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Atendimentos de saúde por mês */}
        {saude.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Atendimentos de Saúde por Mês</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={healthBarConfig} className="h-[300px] w-full">
                <BarChart data={healthByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-sm" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="vacina" fill="hsl(145, 40%, 45%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="consulta" fill="hsl(210, 60%, 50%)" radius={[0, 0, 0, 0]} stackId="a" />
                  <Bar dataKey="tratamento" fill="hsl(340, 60%, 55%)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Legend />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top animais com mais registros de saúde */}
        {topAnimaisSaude.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Animais com Mais Atendimentos</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ value: { label: "Atendimentos", color: "hsl(280, 50%, 55%)" } }} className="h-[300px] w-full">
                <BarChart data={topAnimaisSaude} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} className="text-sm" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(280, 50%, 55%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Animais por local */}
        {animaisPorLocal.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Animais por Local</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ value: { label: "Animais", color: "hsl(50, 70%, 50%)" } }} className="h-[300px] w-full">
                <BarChart data={animaisPorLocal} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} className="text-sm" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(50, 70%, 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top voluntários */}
        {topVoluntarios.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Voluntários com Mais Animais</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ value: { label: "Animais", color: "hsl(180, 50%, 45%)" } }} className="h-[300px] w-full">
                <BarChart data={topVoluntarios} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} className="text-sm" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(180, 50%, 45%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
