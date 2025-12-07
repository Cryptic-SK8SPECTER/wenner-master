import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Shield,
  LogOut,
  Bell,
  Package,
  Tag,
  Box,
  Star,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const notifications = [
  {
    id: 1,
    title: "Pedido enviado",
    message: "Seu pedido #1234 foi enviado e está a caminho.",
    time: "Há 5 min",
    unread: true,
    icon: Package,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    title: "Promoção especial",
    message: "50% de desconto em tênis selecionados!",
    time: "Há 1 hora",
    unread: true,
    icon: Tag,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    id: 3,
    title: "Produto disponível",
    message: "O item da sua lista de desejos voltou ao estoque.",
    time: "Há 2 horas",
    unread: false,
    icon: Box,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    id: 4,
    title: "Avaliação pendente",
    message: "Avalie sua última compra e ganhe pontos.",
    time: "Ontem",
    unread: false,
    icon: Star,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
];

const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const { searchQuery } = useAppSelector((state) => state.product);
  const dispatch = useAppDispatch();
  const isHome = location.pathname === "/";
  const unreadCount = notifications.filter((n) => n.unread).length;

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

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
                    <Bell className="h-4 w-5 text-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-96 p-0 bg-card border-border shadow-xl rounded-xl overflow-hidden"
                >
                  <DropdownMenuLabel className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-base">
                        Notificações
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow-sm">
                        {unreadCount} novas
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.map((notification, index) => {
                      const IconComponent = notification.icon;
                      return (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 focus:bg-muted/50 rounded-none ${
                            notification.unread ? "bg-primary/[0.02]" : ""
                          } ${
                            index !== notifications.length - 1
                              ? "border-b border-border/50"
                              : ""
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center`}
                          >
                            <IconComponent
                              className={`h-5 w-5 ${notification.iconColor}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span
                                className={`font-medium text-sm truncate ${
                                  notification.unread
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {notification.title}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                )}
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                            <p
                              className={`text-xs leading-relaxed line-clamp-2 ${
                                notification.unread
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/70"
                              }`}
                            >
                              {notification.message}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                  <div className="border-t border-border bg-muted/30">
                    <DropdownMenuItem
                      asChild
                      className="justify-center py-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 rounded-none"
                    >
                      <Link
                        to="/notificacoes"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver todas as notificações
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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

export default Header;
