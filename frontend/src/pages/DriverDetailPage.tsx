import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/config";
import { Trophy, Award, Target, Hash, ChevronRight, User, SlidersHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { EmptyState } from "@/components/StateIndicators";
import type { Driver } from "@/types/f1";
import { useEffect, useMemo, useState } from "react";
import YearSelector from "@/components/YearSelector";

const YEARS = [2023, 2024, 2025, 2026];

const DriverDetailPage = () => {
  const { driverFullName } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [races, setRaces] = useState<any[]>([]);
  const [standing, setStanding] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearClick = (y: number | null) => {
    setSelectedYear(y);
  };

  // Load races for selected year
  useEffect(() => {
    if (!driverFullName) return;
    const loadDriver = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/drivers/${encodeURIComponent(driverFullName)}`);
        const data = await res.json();
        setDriver(data);
      } catch (err) {
        console.error("Error loading driver", err);
      }
    };

    const loadRaces = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/drivers/${encodeURIComponent(driverFullName)}/wins`);
        const data = await res.json();
        setRaces(data);
      } catch (err) {
        console.error("Error loading race", err);
      }
    };

    loadDriver();
    loadRaces();
  }, [driverFullName]);

  const availableYears = useMemo(
    () => Array.from(new Set(races.map((r) => r.year))).sort(),
    [races]
  );

useEffect(() => {
  if (!driverFullName) return;

  const loadStanding = async () => {
    try {
      const yearParam = selectedYear ? `?year=${selectedYear}` : "";
      const res = await fetch(
        `${API_BASE_URL}/api/v1/drivers/standings/${encodeURIComponent(
          driverFullName
        )}${yearParam}`
      );
      const data = await res.json();
      setStanding(data);
    } catch (err) {
      console.error("Error loading standing", err);
    }
  };

  loadStanding();
}, [driverFullName, selectedYear]);

  const filteredRaces = useMemo(
    () =>
      selectedYear != null
        ? races.filter((r) => r.year === selectedYear)
        : races,
    [races, selectedYear]
  );

  if (!driver) {
    return (
      <Layout>
        <EmptyState message="Piloto não encontrado." icon={User} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{driver.full_name}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl border border-border bg-card p-6 md:p-8"
      >
        <div className="flex items-center gap-5">
          {driver.headshot_url ? (
            <img
              src={driver.headshot_url}
              alt={driver.full_name}
              className="h-20 w-20 rounded-xl object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary text-3xl font-black text-primary">
              { }
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">{driver.full_name}</h1>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-sm font-bold text-muted-foreground">{driver.name_acronym}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{driver.name_acronym}</span>
              <span>•</span>
              <Link to={`/team/${driver.team_name}`} className="text-primary hover:underline">{driver.team_name}</Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filters:
        </div>

        <button
          onClick={() => handleYearClick(null)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedYear === null
              ? "f1-gradient-red text-primary-foreground"
              : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All years
        </button>

        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => handleYearClick(y)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedYear === y
                ? "f1-gradient-red text-primary-foreground"
                : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Season
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Race Wins" value={ filteredRaces.length } icon={Trophy} variant="red" />
        <StatCard title="Race Podiums" value={ standing?.podiums_race ?? 0 } icon={Target} />
        <StatCard title="Points" value={ standing?.total_points  ?? 0} icon={Hash} />
      </div>

      {/* Season history */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Wins</h2>
        <div className="overflow-x-auto rounded-lg border border-border">

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Race</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</th>
              </tr>
            </thead>

            <tbody>
                {Array.isArray(filteredRaces) && filteredRaces.map((s) => (
                  <tr key={s?.meeting_key} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{ s.year }</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.race_session.winner.team_name}</td>
                    <td className="px-4 py-3">
                      <Link to={`/race/${s.meeting_key}`} className="font-medium text-foreground hover:text-primary">
                        {s.meeting_name}
                        <span className="ml-1 text-xs text-muted-foreground">{ s.location }</span>
                      </Link>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={s.country.flag}
                          alt={s.country.name}
                          className="h-4 w-6 flex-shrink-0 object-cover rounded-sm"
                        />
                        <span className="truncate">{s.country.name}</span>
                      </div>
                    </td>
                  </tr>
                  
                ))}
              </tbody>            
          </table>
        </div>
      </div>

    </Layout>
  );
};

export default DriverDetailPage;
