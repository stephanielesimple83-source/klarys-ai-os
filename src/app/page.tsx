import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  LayoutDashboard,
  Megaphone,
  Menu,
  PhoneCall,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    name: "Tableau de bord",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Dialotel",
    icon: PhoneCall,
    active: false,
  },
  {
    name: "Wix",
    icon: Globe2,
    active: false,
  },
  {
    name: "Réseaux sociaux",
    icon: Megaphone,
    active: false,
  },
  {
    name: "CEO AI",
    icon: Bot,
    active: false,
  },
  {
    name: "Statistiques",
    icon: BarChart3,
    active: false,
  },
];

const indicators = [
  {
    title: "Chiffre d’affaires",
    value: "0 €",
    description: "Connexion Dialotel à venir",
    icon: CircleDollarSign,
  },
  {
    title: "Consultations",
    value: "0",
    description: "Aujourd’hui",
    icon: PhoneCall,
  },
  {
    title: "Visiteurs Wix",
    value: "0",
    description: "Aujourd’hui",
    icon: Users,
  },
  {
    title: "Score de croissance",
    value: "—",
    description: "Calcul après connexion",
    icon: TrendingUp,
  },
];

const priorities = [
  {
    title: "Connecter les données Dialotel",
    description:
      "Importer le chiffre d’affaires, les consultations et les statistiques des experts.",
    badge: "Priorité haute",
  },
  {
    title: "Relier le site Klarys Voyance",
    description:
      "Récupérer les visiteurs, les pages consultées et les conversions Wix.",
    badge: "À préparer",
  },
  {
    title: "Ajouter les comptes sociaux",
    description:
      "Préparer la gestion de plusieurs comptes TikTok, Facebook et Instagram.",
    badge: "À préparer",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="flex min-h-screen">
        {/* Barre latérale */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0a0f1c] lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 px-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="size-6" />
            </div>

            <div>
              <p className="font-semibold tracking-wide">KLARYS AI OS</p>
              <p className="text-xs text-slate-500">Mission 6 000 €</p>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <nav className="flex-1 space-y-2 px-4 py-6">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
              Navigation
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    item.active
                      ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="flex-1 font-medium">{item.name}</span>
                  {item.active && <ChevronRight className="size-4" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4">
            <Card className="border-white/10 bg-white/[0.03] text-white">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-cyan-400 font-semibold text-slate-950">
                      SL
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      Stéphanie
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Administratrice
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <Settings className="size-4" />
                  Paramètres
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Contenu principal */}
        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#070b14]/90 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-slate-400 lg:hidden"
              >
                <Menu className="size-5" />
              </Button>

              <div>
                <p className="text-sm text-slate-500">Centre de pilotage</p>
                <h1 className="font-semibold">Klarys Voyance</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="hidden border-emerald-400/20 bg-emerald-400/10 text-emerald-300 sm:flex"
              >
                <span className="mr-2 size-2 rounded-full bg-emerald-400" />
                Système opérationnel
              </Badge>

              <Button
                size="icon"
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Bell className="size-5" />
              </Button>

              <Avatar>
                <AvatarFallback className="bg-cyan-400 font-semibold text-slate-950">
                  SL
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-8 p-5 md:p-8">
            {/* Introduction */}
            <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <Badge className="mb-4 bg-cyan-400/10 text-cyan-300">
                  <Sparkles className="size-3.5" />
                  Klarys AI OS Alpha
                </Badge>

                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Bonjour Stéphanie 👋
                </h2>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Voici le centre de commande de Klarys Voyance. Les données
                  réelles apparaîtront progressivement après la connexion de
                  Dialotel, Wix et des réseaux sociaux.
                </p>
              </div>

              <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                <Sparkles className="size-4" />
                Voir les priorités du jour
              </Button>
            </section>

            {/* Mission 6000 */}
            <Card className="overflow-hidden border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-[#0d1424] to-[#0d1424] text-white shadow-2xl shadow-cyan-950/20">
              <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1fr_360px]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                      <Target className="size-6" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-cyan-300">
                        Mission 6 000 €
                      </p>
                      <h3 className="text-2xl font-semibold">
                        Objectif mensuel Klarys Voyance
                      </h3>
                    </div>
                  </div>

                  <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-400">
                    Le suivi commencera dès que les données de chiffre
                    d’affaires seront reliées à Klarys AI OS.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Progression</p>
                      <p className="mt-1 text-3xl font-semibold">0 €</p>
                    </div>

                    <p className="text-sm text-slate-400">sur 6 000 €</p>
                  </div>

                  <Progress value={0} className="h-3" />

                  <p className="text-xs text-slate-500">
                    En attente de la connexion Dialotel
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Indicateurs */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Indicateurs essentiels
                  </h3>
                  <p className="text-sm text-slate-500">
                    Vue d’ensemble de l’activité
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="border-white/10 text-slate-400"
                >
                  Données de démonstration
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {indicators.map((indicator) => {
                  const Icon = indicator.icon;

                  return (
                    <Card
                      key={indicator.title}
                      className="border-white/10 bg-[#0d1424] text-white transition hover:-translate-y-1 hover:border-cyan-400/30"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                            <Icon className="size-5" />
                          </div>

                          <Badge
                            variant="outline"
                            className="border-white/10 text-slate-500"
                          >
                            Live
                          </Badge>
                        </div>

                        <p className="mt-6 text-sm text-slate-400">
                          {indicator.title}
                        </p>

                        <p className="mt-1 text-3xl font-semibold">
                          {indicator.value}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {indicator.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Zone inférieure */}
            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <Card className="border-white/10 bg-[#0d1424] text-white">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-cyan-300" />
                        Priorités du CEO AI
                      </CardTitle>

                      <CardDescription className="mt-2 text-slate-500">
                        Les premières étapes recommandées pour construire le
                        système.
                      </CardDescription>
                    </div>

                    <Badge className="bg-cyan-400/10 text-cyan-300">
                      3 actions
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {priorities.map((priority, index) => (
                    <div
                      key={priority.title}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-semibold text-slate-950">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <h4 className="font-medium">{priority.title}</h4>

                          <Badge
                            variant="outline"
                            className="w-fit border-white/10 text-slate-400"
                          >
                            {priority.badge}
                          </Badge>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {priority.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-white/10 bg-[#0d1424] text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="size-5 text-emerald-300" />
                      Connexions
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      État des outils externes
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {[
                      ["Dialotel", "À connecter"],
                      ["Wix", "À connecter"],
                      ["TikTok", "À connecter"],
                      ["Facebook", "À connecter"],
                      ["Instagram", "À connecter"],
                    ].map(([name, status]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="size-2.5 rounded-full bg-amber-400" />
                          <span className="text-sm">{name}</span>
                        </div>

                        <span className="text-xs text-slate-500">{status}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-[#0d1424] text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="size-5 text-violet-300" />
                      Prochaine étape
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm leading-6 text-slate-400">
                      Créer la navigation fonctionnelle et la première page
                      consacrée à Dialotel.
                    </p>

                    <Button
                      variant="outline"
                      className="mt-5 w-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      Voir la feuille de route
                      <ChevronRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}