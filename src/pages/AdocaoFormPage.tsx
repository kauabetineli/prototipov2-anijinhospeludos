import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Send, Dog, Cat, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getById, KEYS, type Animal } from "@/lib/storage";

const initialForm = {
  concordaCondicoes: "",
  idade: "",
  profissao: "",
  trabalhoNome: "",
  trabalhoRua: "",
  trabalhoNumero: "",
  trabalhoBairro: "",
  trabalhoCidade: "",
  moradia: "",
  enderecoRua: "",
  enderecoNumero: "",
  enderecoBairro: "",
  enderecoCidade: "",
  outroEstado: "",
  tempoResidencia: "",
  casaCercada: "",
  animalAmarrado: "",
  pessoasResidencia: "",
  todosConcoram: "",
  proprietarioInquilino: "",
  mudancaResponsabilidade: "",
  cuidadosViagem: "",
  tempoForaCasa: "",
  vacinasCompromisso: "",
  castracaoCompromisso: "",
  condicoesFinanceiras: "",
  outrosAnimais: "",
  animaisAnteriores: "",
  jaAbandonou: "",
  preparadoVidaToda: "",
  criancas: "",
  alergias: "",
  compromissoAdaptacao: "",
  videosEspaco: "",
  nome: "",
  telefone: "",
  cpf: "",
  data: new Date().toISOString().split("T")[0],
  redesSociais: "",
  respNome: "",
  respTelefone: "",
  respCpf: "",
  respRedesSociais: "",
};

export default function AdocaoFormPage() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [form, setForm] = useState(initialForm);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  useEffect(() => {
    if (animalId) {
      const found = getById<Animal>(KEYS.ANIMAIS, animalId);
      if (found) setAnimal(found);
      else navigate("/adocao");
    }
  }, [animalId, navigate]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!aceitouTermos) {
      toast({ title: "Atenção", description: "Você precisa aceitar as condições para adoção.", variant: "destructive" });
      return;
    }

    const camposObrigatorios = ["nome", "telefone", "cpf", "concordaCondicoes", "idade", "profissao", "moradia"];
    const algumVazio = camposObrigatorios.some((c) => !form[c as keyof typeof form]?.trim());
    if (algumVazio) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    toast({
      title: "Formulário enviado! 🎉",
      description: `Obrigado pelo interesse em adotar ${animal?.nome || ""}! Entraremos em contato em breve.`,
    });

    setForm(initialForm);
    setAceitouTermos(false);
    setTimeout(() => navigate("/adocao"), 2000);
  };

  if (!animal) return null;

  const EspecieIcon = animal.especie === "cachorro" ? Dog : Cat;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <Button variant="ghost" onClick={() => navigate("/adocao")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Voltar para Adoção
      </Button>

      {/* Animal selecionado */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <EspecieIcon className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h2 className="text-xl text-foreground">Adotando: {animal.nome}</h2>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{animal.especie === "cachorro" ? "🐶 Cachorro" : "🐱 Gato"}</Badge>
              {animal.raca && <Badge variant="outline">{animal.raca}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Orientações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5 fill-primary" />
              Orientações e Condições para Adoção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              O animal resgatado do abandono tem um passado triste de fome, solidão, doença e frio, por isso temos o cuidado de analisar todas as possíveis adoções através deste questionário.
            </p>
            <p>
              Leia com atenção todas as nossas orientações, e responda com sinceridade e amor as nossas perguntas... 🐶😺
            </p>
            <p>
              A adaptação de um animal pode levar dias ou às vezes, até meses.
            </p>
            <p>
              Se for filhote ele pode chorar, fazer as necessidades no lugar errado, morder as coisas e arranhar na hora de brincar. Se for adulto ele pode destruir as coisas, pegar a roupa do varal, revirar lixo, fugir, latir, uivar, incomodar os vizinhos...
            </p>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Se isso acontecer, você está preparado? Reflita sobre isso!
              </p>
            </div>
            <p>
              Devolver ou abandonar é cruel e traumatizante para os animais, por isso não existe a situação: <strong>"Eu quero devolver o animal que adotei!"</strong>
            </p>
            <p>
              Se por algum motivo extraordinário e insolúvel você achar que não quer ficar mais com o animal depois do período de adaptação (de no mínimo 21 dias), deverá avisar imediatamente a Anjinhos Peludos e suas Voluntárias sobre isso, e assim nos ajudar em uma nova adoção.
            </p>
            <p>
              Ele será divulgado para adoção, e enquanto isso ficará aos seus cuidados até acharmos um lar que o adote com responsabilidade e para sempre, assim, <strong>VOCÊ SE TORNARÁ SEU LAR TEMPORÁRIO</strong>.
            </p>
            <p>
              O futuro adotante, nesse caso, deverá passar por entrevista com uma de nossas voluntárias para ser avaliado e aprovado.
            </p>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="font-semibold text-foreground">
                Abandonar, maltratar, ferir, não oferecer assistência à saúde dos animais é crime! Com pena de 2 a 5 anos de reclusão além de multa e proibição de guarda, conforme as leis 9.605/98 e 14.064/20.
              </p>
            </div>
            <p>
              Toda adoção merece nossa paciência, pois o animal precisa de um tempo para se adaptar. Não desista sem tentar de verdade, ele merece seu esforço! E com certeza vai retribuir tudo isso com muito amor e devoção. 🙏🏻💕
            </p>

            <Separator />

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="termos"
                checked={aceitouTermos}
                onCheckedChange={(checked) => setAceitouTermos(checked === true)}
              />
              <Label htmlFor="termos" className="text-sm font-semibold text-foreground cursor-pointer leading-snug">
                Li e aceito todas as Orientações e Condições para Adoção da Anjinhos Peludos ❤️
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Perguntas da Entrevista */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Protocolo de Entrevista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <FormField label="1. Você concorda com todas as nossas CONDIÇÕES PARA ADOÇÃO acima? *" value={form.concordaCondicoes} onChange={(v) => set("concordaCondicoes", v)} />

            <FormField label="2. Você tem 21 anos ou mais? Coloque quantos anos tem. *" value={form.idade} onChange={(v) => set("idade", v)} />

            <FormField label="3. Qual sua profissão? *" value={form.profissao} onChange={(v) => set("profissao", v)} />

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">4. Dados sobre seu trabalho:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldInput label="Nome do local" value={form.trabalhoNome} onChange={(v) => set("trabalhoNome", v)} />
                <FieldInput label="Rua" value={form.trabalhoRua} onChange={(v) => set("trabalhoRua", v)} />
                <FieldInput label="Número" value={form.trabalhoNumero} onChange={(v) => set("trabalhoNumero", v)} />
                <FieldInput label="Bairro" value={form.trabalhoBairro} onChange={(v) => set("trabalhoBairro", v)} />
                <FieldInput label="Cidade" value={form.trabalhoCidade} onChange={(v) => set("trabalhoCidade", v)} className="sm:col-span-2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">5. Você mora em casa ou apartamento? *</Label>
              <RadioGroup value={form.moradia} onValueChange={(v) => set("moradia", v)} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="casa" id="casa" />
                  <Label htmlFor="casa">Casa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="apartamento" id="apto" />
                  <Label htmlFor="apto">Apartamento</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">6. Qual seu endereço completo?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldInput label="Rua" value={form.enderecoRua} onChange={(v) => set("enderecoRua", v)} />
                <FieldInput label="Número" value={form.enderecoNumero} onChange={(v) => set("enderecoNumero", v)} />
                <FieldInput label="Bairro" value={form.enderecoBairro} onChange={(v) => set("enderecoBairro", v)} />
                <FieldInput label="Cidade" value={form.enderecoCidade} onChange={(v) => set("enderecoCidade", v)} />
              </div>
            </div>

            <FormField label="7. Você veio de outro estado ou país? Qual?" value={form.outroEstado} onChange={(v) => set("outroEstado", v)} />

            <FormField label="8. Há quanto tempo você reside na cidade atual e em SC?" value={form.tempoResidencia} onChange={(v) => set("tempoResidencia", v)} />

            <FormArea label="9. Se for casa, é cercada e segura quanto a fugas?" hint="Todo animal pode fugir, cabe aos tutores prepararem o muro ou cercado. Essa responsabilidade evita fugas que causam atropelamentos, brigas e trocas de doenças com outros animais e problemas com vizinhos. Planeje a segurança em sua adoção." value={form.casaCercada} onChange={(v) => set("casaCercada", v)} />

            <FormArea label="10. Você pretende deixar seu animal amarrado?" hint="Não doaremos animais para viverem presos a correntes!" value={form.animalAmarrado} onChange={(v) => set("animalAmarrado", v)} />

            <FormArea label="11. Com quantas pessoas você mora e descreva quem são?" value={form.pessoasResidencia} onChange={(v) => set("pessoasResidencia", v)} />

            <FormField label="12. Todos em sua residência concordam com a adoção?" value={form.todosConcoram} onChange={(v) => set("todosConcoram", v)} />

            <FormArea label="13. Você é proprietário ou inquilino? Se for inquilino, o proprietário permite animais de estimação no imóvel? Qual é a duração do contrato de locação?" value={form.proprietarioInquilino} onChange={(v) => set("proprietarioInquilino", v)} />

            <FormArea label="14. No caso de uma possível mudança de residência, cidade, estado ou país, você está ciente que é sua responsabilidade levá-lo junto?" hint="Planeje se você o levará de carro, ônibus ou avião, e organize os documentos e gastos necessários para todo esse processo. O animal deve ser uma prioridade em sua vida, e isso inclui achar uma nova casa/apto que aceite animais. ABANDONO É CRIME!" value={form.mudancaResponsabilidade} onChange={(v) => set("mudancaResponsabilidade", v)} />

            <FormArea label="15. Quando vocês viajarem, o animal ficará aos cuidados de quem? Principalmente nas férias e festas de final de ano." value={form.cuidadosViagem} onChange={(v) => set("cuidadosViagem", v)} />

            <FormArea label="16. Vocês ficam muito tempo fora de casa durante a semana? Como é a sua rotina?" hint="Para sabermos se o animal ficará muito tempo sozinho. O animal precisa de tempo e atenção, principalmente nas primeiras semanas." value={form.tempoForaCasa} onChange={(v) => set("tempoForaCasa", v)} />

            <FormArea label="17. As VACINAS SÃO UMA RESPONSABILIDADE OBRIGATÓRIA de todo adotante, você se compromete a vacinar seus animais TODO ANO?" hint="A vacina anual V8 ou V10 previne doenças gravíssimas como cinomose, parvovirose, hepatite infecciosa canina e leptospirose canina. Deve ser aplicada todo ano por um médico veterinário." value={form.vacinasCompromisso} onChange={(v) => set("vacinasCompromisso", v)} />

            <FormArea label="18. Adotando conosco, A CASTRAÇÃO É OBRIGATÓRIA A PARTIR DOS 6 MESES, tanto para machos quanto fêmeas. Você se compromete a castrá-los?" hint="Adotando com a Anjinhos Peludos você tem direito à castração gratuita pela Prefeitura Municipal de Tijucas." value={form.castracaoCompromisso} onChange={(v) => set("castracaoCompromisso", v)} />

            <FormField label="19. Você tem condições financeiras de levar o animal ao Atendimento Veterinário quando ficar doente?" value={form.condicoesFinanceiras} onChange={(v) => set("condicoesFinanceiras", v)} />

            <FormArea label="20. Você tem outros animais domésticos? Quantos e quais?" value={form.outrosAnimais} onChange={(v) => set("outrosAnimais", v)} />

            <FormArea label="21. Você já teve outros animais em sua vida, o que aconteceu com eles e qual a causa de sua morte?" value={form.animaisAnteriores} onChange={(v) => set("animaisAnteriores", v)} />

            <FormField label="22. Você já abandonou animais na rua?" value={form.jaAbandonou} onChange={(v) => set("jaAbandonou", v)} />

            <FormArea label="23. Você está preparado para assumir este animal por toda sua vida?" hint="Um animal bem cuidado pode viver mais de 18 anos." value={form.preparadoVidaToda} onChange={(v) => set("preparadoVidaToda", v)} />

            <FormField label="24. Há crianças em sua residência, quantas e suas idades?" value={form.criancas} onChange={(v) => set("criancas", v)} />

            <FormArea label="25. Há pessoas com alergias em sua casa? Você analisou a possibilidade do animal influenciar na saúde de sua família?" value={form.alergias} onChange={(v) => set("alergias", v)} />

            <FormField label="26. Você se compromete a dedicar seu tempo e paciência à adaptação do animal (de no mínimo 21 dias)?" value={form.compromissoAdaptacao} onChange={(v) => set("compromissoAdaptacao", v)} />

            <FormArea label="27. Nos envie vídeos do espaço onde o animal ficará (pátio cercado ou apartamento, se for o caso)." hint="Descreva o espaço disponível para o animal." value={form.videosEspaco} onChange={(v) => set("videosEspaco", v)} />

          </CardContent>
        </Card>

        {/* Dados do Adotante */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">✅ Seus Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput label="Nome *" value={form.nome} onChange={(v) => set("nome", v)} />
              <FieldInput label="Telefone *" value={form.telefone} onChange={(v) => set("telefone", v)} />
              <FieldInput label="CPF *" value={form.cpf} onChange={(v) => set("cpf", v)} />
              <FieldInput label="Data" value={form.data} onChange={(v) => set("data", v)} type="date" />
              <FieldInput label="Redes Sociais" value={form.redesSociais} onChange={(v) => set("redesSociais", v)} className="sm:col-span-2" />
            </div>
          </CardContent>
        </Card>

        {/* Dados do Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">✅ Outro Responsável pelo Animal em sua Ausência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput label="Nome" value={form.respNome} onChange={(v) => set("respNome", v)} />
              <FieldInput label="Telefone" value={form.respTelefone} onChange={(v) => set("respTelefone", v)} />
              <FieldInput label="CPF" value={form.respCpf} onChange={(v) => set("respCpf", v)} />
              <FieldInput label="Redes Sociais" value={form.respRedesSociais} onChange={(v) => set("respRedesSociais", v)} />
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Agradecemos a sua boa vontade em adotar! ❤️🙏🏻
            </p>
            <p className="text-sm font-semibold text-foreground">
              Associação Anjinhos Peludos de Tijucas/SC
            </p>
            <Button type="submit" size="lg" className="gap-2 px-8">
              <Send className="h-5 w-5" />
              Enviar Formulário
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

/* ---- Helper components ---- */

function FormField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function FormArea({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground italic">{hint}</p>}
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
