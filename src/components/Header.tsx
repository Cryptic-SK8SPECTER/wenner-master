import { Search, ShoppingCart, User, Menu, Shield, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { CartSheet } from "./CartSheet";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAppSelector } from "../app/hooks";
import { useAppDispatch } from "../app/hooks";
import { logoutUser } from "@/features/user/userActions";
import { setSearchQuery } from "@/features/product/productSlice";

export const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const { searchQuery } = useAppSelector((state) => state.product);
  const dispatch = useAppDispatch();
  const isHome = location.pathname === "/";

  // Sincronizar searchValue com Redux quando searchQuery mudar externamente
  useEffect(() => {
    if (searchQuery !== searchValue) {
      setSearchValue(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    dispatch(setSearchQuery(value));
    
    // Se não estiver na página home, navegar para lá
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}

        {/* <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-black from-primary to-accent bg-clip-text text-transparent dark:from-primary-dark dark:to-accent-dark">
            Wenner
          </div>
        </div> */}
        <NavLink to="/" className="flex items-center gap-2">
          <Logo />
        </NavLink>

        {/* Search Bar (only visible on home) */}
        {isHome && (
          <div className="flex-1 max-w-xl mx-auto hidden md:flex">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-background"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </form>
          </div>
        )}

        {/* Actions */}
        <div className="ms-auto items-center gap-2">
          {/* Mobile Search Button */}
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/")}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Botões Login / Cadastrar */}
          {!isAuthenticated && (
            <>
              <NavLink to="/auth">
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="hidden md:inline-flex"
                  >
                    Login
                  </Button>
                )}
              </NavLink>

              <NavLink to="/auth">
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "default"}
                    size="sm"
                    className="hidden md:inline-flex ml-4"
                  >
                    Cadastrar
                  </Button>
                )}
              </NavLink>
            </>
          )}

          {/* Botões Perfil / Admin */}
          {isAuthenticated && (
            <>
              <NavLink to="/profile">
                {({ isActive }) => (
                  <Button variant={isActive ? "default" : "ghost"} size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </NavLink>

              {user?.role === "admin" && (
                <NavLink to="/admin">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="icon"
                      title="Painel Admin"
                    >
                      <Shield className="h-5 w-5" />
                    </Button>
                  )}
                </NavLink>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-[10px]">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  dispatch(logoutUser());
                  navigate("/");
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search (only visible on home) */}
      {isHome && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 bg-background"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </form>
        </div>
      )}

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};
