import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import AnimaisPage from "./pages/AnimaisPage";
import VoluntariosPage from "./pages/VoluntariosPage";
import LocaisPage from "./pages/LocaisPage";
import AtribuicoesPage from "./pages/AtribuicoesPage";
import SaudePage from "./pages/SaudePage";
import EstatisticasPage from "./pages/EstatisticasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/animais" element={<AnimaisPage />} />
            <Route path="/voluntarios" element={<VoluntariosPage />} />
            <Route path="/locais" element={<LocaisPage />} />
            <Route path="/atribuicoes" element={<AtribuicoesPage />} />
            <Route path="/saude" element={<SaudePage />} />
            <Route path="/estatisticas" element={<EstatisticasPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
