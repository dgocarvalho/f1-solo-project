import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/config";
import { MapPin, Cloud, ChevronRight, Zap, ArrowUp, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import type { RacePipeline, MeetingPoints } from "@/types/f1";

const RaceDetailPage = () => {
  const { raceId } = useParams();
  const [race, setRace] = useState<RacePipeline | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!raceId) return;
    const loadRaces = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/races/${raceId}`);
        const data = await res.json();
        setRace(data);
      } catch (err) {
        console.error("Error loading race", err);
      }
    };
    loadRaces();
  }, [raceId]);

  const pointsByDriver = useMemo(() => {
    const map = new Map<number, MeetingPoints>();
    if (!race?.points) return map; // se race ou points forem null/undefined, retorna vazio

    for (const p of race.points) {
      map.set(p.driver_number, p);
    }
    return map;
  }, [race?.points]);

  if (!race) {
    return <div>Loading...</div>;
  }


  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/seasons" className="hover:text-foreground">Seasons</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{race.meeting_name}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl border border-border bg-card p-6 md:p-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {new Date(race.date_end).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
              {race.meeting_official_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {race.circuit.short_name},{" "}
                {race.country.name}
              </span>
              {/* race.weather && (
              <span className="flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5" /> {race.weather}
              </span>
              ) */}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {race.circuit?.image && (
              <div className="hidden md:block">
                <img
                  src={race.circuit.image}
                  alt={`Traçado do circuito de ${race.circuit.short_name}`}
                  className="h-16 w-24 rounded-md border-border object-cover"
                />
              </div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Mini stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Winner"
          value={race.race_session?.winner?.full_name  || "—" }
          icon={Zap}
          variant="green"
          description=""
        />
      </div>

      {/* Results table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Number of laps</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Gap to Leader</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Points</th>
            </tr>
          </thead>

          <tbody>
            {race.race_session?.results.map((r, i) => {
              const meetingPoints = pointsByDriver.get(r.driver_number);
              const pointsRace = meetingPoints?.points_meeting ?? 0; // ou points_meeting, se preferir

              return (
                <motion.tr
                  key={r.position}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        r.position === 1
                          ? "f1-gradient-red text-primary-foreground"
                          : r.position != null && r.position <= 3
                          ? "bg-f1-green/20 text-f1-green"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {r.position != null
                        ? r.position
                        : r.dnf
                        ? "DNF"
                        : r.dns
                        ? "DNS"
                        : r.dsq
                        ? "DSQ"
                        : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/driver/${ r.full_name }`} className="font-medium text-foreground hover:text-primary">
                      {r.full_name}
                      <span className="ml-1 text-xs text-muted-foreground">{ r.driver_number }</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/team/${ 1 }`} className="text-muted-foreground hover:text-foreground">
                      { r.team_name }
                    </Link>
                  </td>

                  <td className="px-4 py-3 font-semibold text-foreground">{ r.number_of_laps }</td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                    {r.gap_to_leader || "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{ pointsRace }</td>
          
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default RaceDetailPage;
