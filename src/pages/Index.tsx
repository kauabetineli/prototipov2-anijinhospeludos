import { Link } from "react-router-dom";
import { Dog, Users, MapPin, Syringe, LinkIcon, Heart, PawPrint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAll, KEYS, type Animal, type Voluntario, type Local } from "@/lib/storage";

const stats = [
  { label: "Animais", key: KEYS.ANIMAIS, icon: Dog, to: "/animais", color: "text-primary" },
  { label: "Voluntários", key: KEYS.VOLUNTARIOS, icon: Users, to: "/voluntarios", color: "text-accent" },
  { label: "Locais", key: KEYS.LOCAIS, icon: MapPin, to: "/locais", color: "text-paw-orange" },
];

const Index = () => {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center space-y-4 py-12">
        <div className="flex justify-center">
          <div className="relative">
            <Heart className="h-20 w-20 text-primary fill-primary opacity-20 absolute -top-2 -left-2" />
            <PawPrint className="h-16 w-16 text-primary relative z-10" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl text-foreground">Anjinhos Peludos</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Sistema de gestão da ONG de proteção animal. Cadastre animais, voluntários, locais e acompanhe todo o histórico de cuidados. 🐾
        </p>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, key, icon: Icon, to, color }) => {
          const count = getAll(key).length;
          return (
            <Link key={to} to={to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`p-3 rounded-xl bg-secondary ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-sm text-muted-foreground">{label} cadastrados</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: "/atribuicoes", label: "Atribuições", desc: "Vincular animais a locais e voluntários", icon: LinkIcon },
          { to: "/eventos", label: "Eventos", desc: "Registrar eventos dos animais", icon: Calendar },
          { to: "/vacinas", label: "Vacinas", desc: "Histórico de vacinação", icon: Syringe },
        ].map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-start gap-3 p-5">
                <Icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Index;
