import { API_BASE_URL } from "../config/config";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import Layout from "@/components/Layout";
import YearSelector from "@/components/YearSelector";
import { RacePipeline } from "@/types/f1";

const SeasonPage = () => {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [races, setRaces] = useState<RacePipeline[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  type DriverStanding = {
    driver_number: number;
    full_name: string;
    team_name: string;
    headshot_url?: string;
    points: number;
  };

  type TeamStanding = {
    team_name: string;
    points: number;
  };  

  // Load years
  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/races`);
        const data = await res.json();
        setYears(data);
        if (data.length) setSelectedYear(data[data.length - 1]);
      } catch (err) {
        console.error("Error loading years", err);
      }
    };
    loadYears();
  }, []);

  // Load seasons for selected year
  useEffect(() => {
    if (!selectedYear) return;
    const loadSeasons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/seasons/${selectedYear}/races`);
        const data = await res.json();
        setRaces(data);
      } catch (err) {
        console.error("Error loading seasons", err);
      }
    };
    loadSeasons();
  }, [selectedYear]);

  function computeTeamStandings(races: RacePipeline[]): TeamStanding[] {
    const byTeam = new Map<string, TeamStanding>();

    for (const race of races) {
      if (!race.points) continue;

      for (const p of race.points) {
        if (!p.team_name) continue;

        const existing = byTeam.get(p.team_name) ?? {
          team_name: p.team_name,
          points: 0,
        };

        existing.points += p.points_meeting ?? 0;
        byTeam.set(p.team_name, existing);
      }
    }

    return Array.from(byTeam.values()).sort((a, b) => b.points - a.points);
  }

  function computeSeasonStandings(races: RacePipeline[]): DriverStanding[] {
    const byDriver = new Map<number, DriverStanding>();

    for (const race of races) {
      if (!race.points) continue;

      for (const p of race.points) {
        const existing = byDriver.get(p.driver_number) ?? {
          driver_number: p.driver_number,
          full_name: p.full_name,
          team_name: p.team_name,
          headshot_url: p.headshot_url,
          points: 0,
        };

        existing.points += p.points_meeting ?? 0;
        byDriver.set(p.driver_number, existing);
      }
    }

    return Array.from(byDriver.values()).sort((a, b) => b.points - a.points);
  }

  const topDrivers = useMemo(
    () => computeSeasonStandings(races),
    [races]
  );

  const topTeams = useMemo(
    () => computeTeamStandings(races),
    [races]
  );

  const top3Teams = topTeams.slice(0, 3);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Seasons</h1>
        <p className="text-sm text-muted-foreground">All races and statistics for the selected year</p>
      </div>

      <div className="mb-6">
        <YearSelector
          years={years}
          selected={selectedYear ?? undefined}
          onChange={setSelectedYear}
        />        
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Races list */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Race</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Circuit</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Winner</th>
                </tr>
              </thead>
              <tbody>
                {races.map((race, i) => (
                  <motion.tr
                    key={race.meeting_key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/30"
                    onClick={() => navigate(`/race/${race.meeting_key}`)}
                  >
                    <td className="px-4 py-3 font-mono text-muted-foreground">{ '1' }</td>
                    <td className="px-4 py-3 font-medium text-foreground">{race.meeting_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{race.circuit.short_name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{race.country.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(race.date_end).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-f1-green/10 px-2 py-0.5 text-xs font-semibold text-f1-green">
                        {race.race_session?.winner?.full_name || "—"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                {races.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhuma corrida encontrada para {selectedYear}.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Season stats sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-f1-yellow" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{selectedYear} Drivers' Standings</h3>
            </div>
            <div className="space-y-3">
              {topDrivers.map((d, index) => (
                <div key={d.driver_number} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "f1-gradient-red text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{d.full_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{d.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Medal className="h-4 w-4 text-f1-green" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Top 3 Teams' Standings</h3>
            </div>
            <div className="space-y-3">
              {top3Teams.map((t, i) => (
                <div key={t.team_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "f1-gradient-green text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{t.team_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{t.points} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default SeasonPage;
