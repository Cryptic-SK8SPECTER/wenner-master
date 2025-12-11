import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { LoginModalProvider } from "./contexts/LoginModalContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Notifications from "./pages/Notifications";
import AllReviews from "./pages/AllReviews";
import NotFound from "./pages/NotFound";

import { store } from "./app/index";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LoginModalProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/notificacoes" element={<Notifications />} />
                <Route path="/avaliacoes" element={<AllReviews />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LoginModalProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
