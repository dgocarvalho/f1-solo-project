import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import SeasonPage from "./pages/SeasonPage";
import RaceDetailPage from "./pages/RaceDetailPage";
import SearchPage from "./pages/SearchPage";
import DriverDetailPage from "./pages/DriverDetailPage";
import TeamDetailPage from "./pages/TeamDetailPage";

import Logo from "@/assets/logo.svg"; // assuming you have a logo file

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
        }}>

        {/* HEADER GLOBAL */}
        <header className="w-full flex items-center justify-start p-4 bg-[#0B1215] border-b border-[#1A202C]">
          <img src={Logo} alt="Logo" className="h-10 w-auto opacity-80" />
        </header>

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/seasons" element={<SeasonPage />} />
          <Route path="/race/:raceId" element={<RaceDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/driver/:driverFullName" element={<DriverDetailPage />} />
          <Route path="/team/:teamId" element={<TeamDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
