import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Wishlist from "./pages/Wishlist";
import ShoppingList from "./pages/ShoppingList";
import Goals from "./pages/Goals";
import Meals from "./pages/Meals";
import MealReports from "./pages/MealReports";
import Rotina from "./pages/Rotina";
import Calendario from "./pages/Calendario";
import Documentos from "./pages/Documentos";
import Peso from "./pages/Peso";
import Diario from "./pages/Diario";
import Leituras from "./pages/Leituras";
import Estudos from "./pages/Estudos";
import NotFound from "./pages/NotFound";
import MigrationTool from "./pages/MigrationTool";
import { TransactionsExample } from "./components/TransactionsExample";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/finance" element={<Index />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/lista-mercado" element={<ShoppingList />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/meals/reports" element={<MealReports />} />
          <Route path="/rotina" element={<Rotina />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/peso" element={<Peso />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/leituras" element={<Leituras />} />
          <Route path="/estudos" element={<Estudos />} />
          <Route path="/migration" element={<MigrationTool />} />
          <Route path="/api-test" element={<TransactionsExample />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
