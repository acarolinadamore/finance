import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Wishlist from "./pages/Wishlist";
import ShoppingList from "./pages/ShoppingList";
import TodoList from "./pages/TodoList";
import Goals from "./pages/Goals";
import RodaDaVida from "./pages/RodaDaVida";
import Meals from "./pages/Meals";
import MealReports from "./pages/MealReports";
import Rotina from "./pages/Rotina";
import Calendario from "./pages/Calendario";
import Documentos from "./pages/Documentos";
import DatasImportantes from "./pages/DatasImportantes";
import Peso from "./pages/Peso";
import Diario from "./pages/Diario";
import Leituras from "./pages/Leituras";
import Estudos from "./pages/Estudos";
import Catolico from "./pages/Catolico";
import CatolicoOracoes from "./pages/CatolicoOracoes";
import CatolicoVersiculos from "./pages/CatolicoVersiculos";
import CatolicoDuvidas from "./pages/CatolicoDuvidas";
import CatolicoLeituras from "./pages/CatolicoLeituras";
import CatolicoConfissoes from "./pages/CatolicoConfissoes";
import CatolicoLectioDivina from "./pages/CatolicoLectioDivina";
import CatolicoTerco from "./pages/CatolicoTerco";
import CatolicoCoral from "./pages/CatolicoCoral";
import NotFound from "./pages/NotFound";
import MigrationTool from "./pages/MigrationTool";
import CicloFeminino from "./pages/CicloFeminino";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import { TransactionsExample } from "./components/TransactionsExample";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas de autenticação (públicas) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rota de administração (apenas admin) */}
          <Route path="/admin" element={<Admin />} />

          {/* Rotas da aplicação */}
          <Route path="/" element={<Home />} />
          <Route path="/finance" element={<Index />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/lista-mercado" element={<ShoppingList />} />
          <Route path="/todo-list" element={<TodoList />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/rodadavida" element={<RodaDaVida />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/meals/reports" element={<MealReports />} />
          <Route path="/rotina" element={<Rotina />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/datas-importantes" element={<DatasImportantes />} />
          <Route path="/peso" element={<Peso />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/leituras" element={<Leituras />} />
          <Route path="/estudos" element={<Estudos />} />
          <Route path="/catolico" element={<Catolico />} />
          <Route path="/catolico/oracoes" element={<CatolicoOracoes />} />
          <Route path="/catolico/versiculos" element={<CatolicoVersiculos />} />
          <Route path="/catolico/duvidas" element={<CatolicoDuvidas />} />
          <Route path="/catolico/leituras" element={<CatolicoLeituras />} />
          <Route path="/catolico/confissoes" element={<CatolicoConfissoes />} />
          <Route path="/catolico/lectio-divina" element={<CatolicoLectioDivina />} />
          <Route path="/catolico/terco" element={<CatolicoTerco />} />
          <Route path="/catolico/coral" element={<CatolicoCoral />} />
          <Route path="/ciclo-feminino" element={<CicloFeminino />} />
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
