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
import NotFound from "./pages/NotFound";
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
          <Route path="/api-test" element={<TransactionsExample />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
