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
  LineChart,
  Line,
} from "recharts";
import { getAll, KEYS, type Animal, type HistoricoVacina, type Voluntario, type Local } from "@/lib/storage";
import { BarChart3 } from "lucide-react";

const COLORS = [
  "hsl(24, 80%, 55%)",
  "hsl(145, 40%, 45%)",
  "hsl(210, 60%, 50%)",
  "hsl(340, 60%, 55%)",
  "hsl(50, 70%, 50%)",
  "hsl(280, 50%, 55%)",
];

const speciesLabels: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  ave: "Ave",
  roedor: "Roedor",
  outro: "Outro",
};

const sexLabels: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
  desconhecido: "Desconhecido",
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

  // 1. Animais por espécie
  const speciesData = useMemo(() => {
    const counts: Record<string, number> = {};
    animais.forEach((a) => {
      const key = a.especie || "outro";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: speciesLabels[name] || name,
      value,
    }));
  }, [animais]);

  // 2. Animais por sexo
  const sexData = useMemo(() => {
    const counts: Record<string, number> = {};
    animais.forEach((a) => {
      const key = a.sexo || "desconhecido";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: sexLabels[name] || name,
      value,
    }));
  }, [animais]);

  // 3. Entradas por mês (últimos 6 meses)
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

  // 4. Registros de saúde por tipo
  const healthByType = useMemo(() => {
    const counts: Record<string, number> = {};
    saude.forEach((s) => {
      const key = s.tipo_registro || "vacina";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: tipoLabels[name] || name,
      value,
    }));
  }, [saude]);

  // 5. Resumo geral
  const today = new Date().toISOString().split("T")[0];
  const vacinasAtrasadas = saude.filter(
    (s) => s.proxima_dose_em && s.proxima_dose_em < today
  ).length;
  const proximasVacinas = saude.filter(
    (s) => s.proxima_dose_em && s.proxima_dose_em >= today
  ).length;

  const pieConfig: ChartConfig = {
    value: { label: "Quantidade" },
  };

  const barConfig: ChartConfig = {
    count: { label: "Entradas", color: "hsl(24, 80%, 55%)" },
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Animais", value: animais.length },
          { label: "Voluntários", value: voluntarios.length },
          { label: "Locais", value: locais.length },
          { label: "Registros Saúde", value: saude.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vaccines status */}
      {saude.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-destructive/30">
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-bold text-destructive">{vacinasAtrasadas}</p>
              <p className="text-sm text-muted-foreground mt-1">Doses atrasadas</p>
            </CardContent>
          </Card>
          <Card className="border-accent/30">
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-bold text-accent">{proximasVacinas}</p>
              <p className="text-sm text-muted-foreground mt-1">Próximas doses agendadas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animais por espécie */}
        {speciesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Animais por Espécie</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={speciesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {speciesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
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
            <CardHeader>
              <CardTitle className="text-lg">Animais por Sexo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={sexData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {sexData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Entradas por mês */}
        {entriesByMonth.some((m) => m.count > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entradas por Mês</CardTitle>
            </CardHeader>
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
        )}

        {/* Registros de saúde por tipo */}
        {healthByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros de Saúde por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={healthByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {healthByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
