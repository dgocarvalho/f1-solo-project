import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import { API_BASE_URL } from "../config/config";
import { EmptyState } from "@/components/StateIndicators";

const YEARS = [2023, 2024, 2025, 2026];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const runSearch = async (q: string, year: number | null) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q });
      if (year) params.append("year", String(year));
        const res = await fetch(`${API_BASE_URL}/api/v1/search/?${params.toString()}`);
        const data = await res.json();
        setDrivers(data.drivers || []);
        setRaces(data.races || []);

        setResults(data.results || []);
    } catch (e) {
      setError("Erro ao buscar resultados.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // dispara busca quando a página abre com ?q=...
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery, yearFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, yearFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    runSearch(query, yearFilter);
  };

  const handleYearClick = (y: number | null) => {
    setYearFilter(y);
    runSearch(query, y);
  };

  const maxScore = results.reduce(
    (max, r) => Math.max(max, r.score ?? 0),
    0
  ) || 1; // evita divisão por 0

return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Search</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-3xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por corrida, circuito, piloto, palavra-chave…"
            className="h-12 w-full rounded-lg border border-border bg-secondary pl-12 pr-28 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-5 py-2 text-sm font-semibold f1-gradient-red text-primary-foreground transition-opacity hover:opacity-90"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filters:
        </div>
        <button
          onClick={() => handleYearClick(null)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            !yearFilter
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
              yearFilter === y
                ? "f1-gradient-red text-primary-foreground"
                : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Loading / Error / Results */}
      {loading && (
        <p className="text-sm text-muted-foreground">Searching drivers and races…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading &&
        query.trim() &&
        drivers.length === 0 &&
        races.length === 0 &&
        !error ? (
        <EmptyState
          message={`Nenhum resultado encontrado para "${query}".`}
          icon={Search}
        />
      ) : (
        <div className="space-y-6 max-w-3xl">
          {/* Seção de pilotos */}
          {drivers.length > 0 && (
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pilotos
        </h2>
        <div className="space-y-2">
          {drivers.map((driver) => (
            <Link
              key={driver.driverId || driver.code}
              to={`/driver/${driver.full_name}`} // ou driverId, se preferir
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/30 hover:bg-secondary/30"
            >
              {driver.headshot_url && (
                <img
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {driver.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {driver.broadcast_name} · {driver.code} · {driver.team_name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )}

    {/* Seção de corridas */}
    {races.length > 0 && (
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Corridas
        </h2>
        <div className="space-y-3">
          {races.map((result, i) => (
            <motion.div
              key={`${result.raceId || result.meeting_key}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/race/${result.meeting_key ?? result.raceId}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {result.name}
                    </h3>

                    {/* Vencedor */}
                    {result.winner_driver && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-f1-yellow/20 text-[0.6rem] font-bold text-f1-yellow">
                          1º
                        </span>
                        <span className="font-medium text-foreground">
                          {result.winner_driver}
                        </span>
                        {result.winner_team && (
                          <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                            · {result.winner_team}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Local / ano */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {result.circuit}, {result.country} — {result.year}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    )}
  </div>
)}
    </Layout>
  );
};

export default SearchPage;