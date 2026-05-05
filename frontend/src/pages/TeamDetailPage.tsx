import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Flag, Hash, ChevronRight, Users } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { mockTeams } from "@/data/mockData";
import { EmptyState } from "@/components/StateIndicators";

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const team = mockTeams[teamId || ""];

  if (!team) {
    return (
      <Layout>
        <EmptyState message="Equipe não encontrada." icon={Users} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{team.name}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl border border-border bg-card p-6 md:p-8"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{team.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{team.country}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Títulos de Construtores" value={team.stats.constructorTitles} icon={Trophy} variant="red" />
        <StatCard title="Corridas Vencidas" value={team.stats.raceWins} icon={Flag} variant="green" />
        <StatCard title="Pontos Totais" value={team.stats.totalPoints.toLocaleString()} icon={Hash} />
      </div>

      {/* Drivers */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Pilotos Atuais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {team.drivers.map((d) => (
            <Link
              key={d.driverId}
              to={`/driver/${d.driverId}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-secondary/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-xl font-black text-primary">
                {d.number}
              </div>
              <div>
                <p className="font-semibold text-foreground">{d.name}</p>
                <p className="text-sm text-muted-foreground">{d.code} • #{d.number}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Points by season */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Pontos por Temporada</h2>
        <div className="space-y-3">
          {team.seasonPoints.map((sp) => {
            const maxPts = Math.max(...team.seasonPoints.map((s) => s.points));
            return (
              <div key={sp.year} className="flex items-center gap-3">
                <span className="w-12 text-sm font-semibold text-foreground">{sp.year}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(sp.points / maxPts) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full rounded-full f1-gradient-red"
                  />
                </div>
                <span className="w-16 text-right text-sm font-semibold text-muted-foreground">{sp.points} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
