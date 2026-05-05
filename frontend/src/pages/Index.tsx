import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import { motion } from "framer-motion";
import { Search, Calendar, Trophy, Users, Flag, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import YearSelector from "@/components/YearSelector";
import { Link } from "react-router-dom";
import { Seasons } from "@/types/f1";

const Index = () => {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [seasons, setSeasons] = useState<Seasons[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // Load years
  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/years`);
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
        const res = await fetch(`${API_BASE_URL}/api/v1/years/${selectedYear}`);
        const data = await res.json();
        setSeasons(data);
      } catch (err) {
        console.error("Error loading seasons", err);
      }
    };
    loadSeasons();

  }, [selectedYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout>
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="card-surface glow-soft p-8 md:p-12 relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute inset-0 gradient-glow opacity-40" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-gray-400">
                Racing Data Platform
              </span>

              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
                Explore racing data with{" "}
                <span className="text-gradient-green">high performance</span>
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                Interactive platform to explore seasons, races, and statistics
                with speed and flexibility using MongoDB.
              </p>

              {/* SEARCH */}
              <form onSubmit={handleSearch} className="mt-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search race, driver, circuit..."
                    className="h-12 w-full rounded-xl bg-[#0B1215] border border-[#1A202C] pl-12 pr-28 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ED64]/40"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg font-semibold bg-[#00ED64] text-black hover:scale-105 transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* YEAR */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Season
                </p>

                <YearSelector
                  years={years}
                  selected={selectedYear ?? undefined}
                  onChange={setSelectedYear}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Seasons"
          value={years.length}
          icon={Calendar}
          description="Available years"
        />

        <StatCard
          title="Races"
          value={seasons.reduce((sum, season) => sum + season.meeting_count, 0)}
          icon={Flag}
          description={`Season ${selectedYear}`}
        />

        <StatCard
          title="Drivers"
          value={seasons.reduce((sum, season) => sum + season.driver_count, 0)}
          icon={Users}
          description="Current grid"
        />
      </section>

      {/* RACES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            Races — {selectedYear}
          </h2>

          <Link
            to={`/seasons?year=${selectedYear}`}
            className="flex items-center gap-1 text-sm text-[#00ED64] hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#1A202C] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0B1215]">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500">Race</th>                <th className="px-4 py-3 text-left text-xs text-gray-500">Country</th>
                <th className="px-4 py-3 text-left text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-gray-500">Winner</th>
              </tr>
            </thead>

            <tbody>
                {seasons.flatMap((season) =>
                    season.meetings.map((meeting, i) => (
                  <tr
                    key={`${season.year}-${meeting.meeting_key}`}
                    onClick={() => navigate(`/race/${meeting.meeting_key}`)}
                    className="cursor-pointer border-t border-[#1A202C] hover:bg-[#0B1215]/60 transition"
                  >
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{meeting.meeting_name}</td>
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={meeting.country_flag}
                          alt={meeting.country_name}
                          className="h-4 w-6 flex-shrink-0 object-cover rounded-sm"
                        />
                        <span className="truncate">{meeting.country_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(meeting.date_start).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-[#00ED64]/10 text-[#00ED64]">
                        {meeting.winner ? meeting.winner.full_name : " — Not Defined yet —"}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default Index;