import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Package, User, Lock, MapPin } from "lucide-react";
import { mockProducts } from "@/data/products";
import { useState, useEffect } from "react";
import { updateProfile, updatePassword } from "@/features/user/userActions";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchFavorites,
  removeFromFavorites,
} from "@/features/favorite/favoriteActions";
import ProductImage from "../components/ProductImage";

const Profile = () => {
  const { toast } = useToast();
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetailsPage, setOrderDetailsPage] = useState(1);

  const itemsPerPage = 4;
  const orderDetailsItemsPerPage = 3;

  // User data (from logged in user) with fallbacks to mock values
  const loggedUser = useAppSelector((state) => state.user.user);
  const extendedUser = loggedUser as unknown as
    | {
        phone?: string;
        address?: {
          street?: string;
          city?: string;
          state?: string;
          zipCode?: string;
        };
      }
    | undefined;

  const [name, setName] = useState(loggedUser?.name ?? "");
  const [email, setEmail] = useState(loggedUser?.email ?? "");
  const [phone, setPhone] = useState(extendedUser?.phone ?? "");
  const [city, setCity] = useState(extendedUser?.address?.city ?? "");
  const [state, setState] = useState(extendedUser?.address?.state ?? "");
  const [street, setStreet] = useState(extendedUser?.address?.street ?? "");
  const [zipCode, setZipCode] = useState(extendedUser?.address?.zipCode ?? "");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useAppDispatch();

  const { favorites, loading, error } = useAppSelector(
    (state) => state.favorites
  );

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updateProfile({
          name,
          email,
          phone,
          address: {
            street,
            city,
            state,
            zipCode,
          },
        })
      ).unwrap();
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso.",
        variant: "default",
      });
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil.";
      toast({
        title: "Erro ao salvar",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(
        updatePassword({
          passwordCurrent: currentPassword,
          password: newPassword,
          passwordConfirm: confirmPassword,
        })
      ).unwrap();
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
        variant: "default",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.";
      toast({
        title: "Erro ao alterar",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const allFavoriteProducts = favorites;
  const totalFavoritesPages = Math.ceil(
    allFavoriteProducts.length / itemsPerPage
  );
  const favoriteProducts = allFavoriteProducts.slice(
    (favoritesPage - 1) * itemsPerPage,
    favoritesPage * itemsPerPage
  );

  useEffect(() => {
    const totalPages = Math.ceil(allFavoriteProducts.length / itemsPerPage);

    if (favoritesPage > totalPages) {
      setFavoritesPage(Math.max(totalPages, 1));
    }
  }, [allFavoriteProducts]);

  const handleRemoveFavorite = async (
    productId: string,
    productName: string
  ) => {
    try {
      await dispatch(removeFromFavorites({ productId })).unwrap();

      toast({
        title: "Removido dos favoritos",
        description: `${productName} foi removido da sua lista de favoritos.`,
      });

      // ajuste de página imediato
      const updatedCount = allFavoriteProducts.length - 1;
      const totalPages = Math.ceil(updatedCount / itemsPerPage);

      if (favoritesPage > totalPages) {
        setFavoritesPage(Math.max(totalPages, 1));
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao remover favorito.",
        variant: "destructive",
      });
    }
  };

  const allOrders = [
    {
      id: "001",
      date: "2024-03-15",
      total: 299.9,
      status: "pending",
      items: 2,
      products: [
        { ...mockProducts[0], quantity: 1 },
        { ...mockProducts[1], quantity: 1 },
      ],
    },
    {
      id: "002",
      date: "2024-03-10",
      total: 549.8,
      status: "processing",
      items: 3,
      products: [
        { ...mockProducts[2], quantity: 2 },
        { ...mockProducts[3], quantity: 1 },
      ],
    },
    {
      id: "003",
      date: "2024-03-05",
      total: 199.9,
      status: "delivered",
      items: 1,
      products: [{ ...mockProducts[4], quantity: 1 }],
    },
    {
      id: "004",
      date: "2024-02-28",
      total: 399.8,
      status: "cancelled",
      items: 2,
      products: [
        { ...mockProducts[5], quantity: 1 },
        { ...mockProducts[6], quantity: 1 },
      ],
    },
    {
      id: "005",
      date: "2024-02-20",
      total: 899.9,
      status: "delivered",
      items: 4,
      products: [
        { ...mockProducts[0], quantity: 2 },
        { ...mockProducts[2], quantity: 2 },
      ],
    },
    {
      id: "006",
      date: "2024-02-15",
      total: 249.9,
      status: "delivered",
      items: 1,
      products: [{ ...mockProducts[7], quantity: 1 }],
    },
    {
      id: "007",
      date: "2024-02-10",
      total: 679.8,
      status: "delivered",
      items: 3,
      products: [
        { ...mockProducts[1], quantity: 1 },
        { ...mockProducts[3], quantity: 2 },
      ],
    },
    {
      id: "008",
      date: "2024-02-05",
      total: 349.9,
      status: "delivered",
      items: 2,
      products: [
        { ...mockProducts[4], quantity: 1 },
        { ...mockProducts[5], quantity: 1 },
      ],
    },
  ];

  const totalOrdersPages = Math.ceil(allOrders.length / itemsPerPage);
  const orders = allOrders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pendente", variant: "secondary" },
      processing: { label: "Em Espera", variant: "default" },
      delivered: { label: "Recebido", variant: "outline" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações e pedidos
            </p>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
              <TabsTrigger value="info" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Dados</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Endereço</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Senha</span>
              </TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favoritos */}
            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Favoritos</CardTitle>
                  <CardDescription>
                    {allFavoriteProducts.length} produtos salvos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {favoriteProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <ProductImage src={product.image} alt={product.name} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                          {product.priceDiscount ? (
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-lg font-bold text-accent">
                                {product.priceDiscount} MZN
                              </p>
                              <p className="text-sm line-through text-muted-foreground">
                                {product.price} MZN
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-accent mt-1">
                              {product.price} MZN
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveFavorite(product._id, product.name)
                          }
                          aria-label="Remover dos favoritos"
                        >
                          <Heart className="h-5 w-5 text-accent fill-accent hover:text-destructive hover:fill-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {totalFavoritesPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setFavoritesPage((prev) => Math.max(1, prev - 1))
                            }
                            className={
                              favoritesPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalFavoritesPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setFavoritesPage(page)}
                              isActive={favoritesPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setFavoritesPage((prev) =>
                                Math.min(totalFavoritesPages, prev + 1)
                              )
                            }
                            className={
                              favoritesPage === totalFavoritesPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pedidos */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Pedidos</CardTitle>
                  <CardDescription>
                    Acompanhe o status dos seus pedidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Pedido #{order.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {order.items} {order.items === 1 ? "item" : "itens"}
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {order.total} MZN
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-3"
                          onClick={() => setSelectedOrder(order.id)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>

                  {totalOrdersPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setOrdersPage((prev) => Math.max(1, prev - 1))
                            }
                            className={
                              ordersPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalOrdersPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setOrdersPage(page)}
                              isActive={ordersPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setOrdersPage((prev) =>
                                Math.min(totalOrdersPages, prev + 1)
                              )
                            }
                            className={
                              ordersPage === totalOrdersPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Endereço */}
            <TabsContent value="address" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                  <CardDescription>
                    Atualize seu endereço de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua e Número</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile}>Salvar Endereço</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alterar Senha */}
            <TabsContent value="password" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Mantenha sua conta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleChangePassword}>Alterar Senha</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
            setOrderDetailsPage(1);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder}</DialogTitle>
            <DialogDescription>
              Confira os produtos do seu pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder &&
            (() => {
              const order = allOrders.find((o) => o.id === selectedOrder);
              if (!order) return null;

              const totalProductPages = Math.ceil(
                order.products.length / orderDetailsItemsPerPage
              );
              const displayedProducts = order.products.slice(
                (orderDetailsPage - 1) * orderDetailsItemsPerPage,
                orderDetailsPage * orderDetailsItemsPerPage
              );

              return (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Data do Pedido
                      </p>
                      <p className="font-semibold">
                        {new Date(order.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Produtos ({order.products.length})
                    </h3>
                    {displayedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 border border-border rounded-lg"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Quantidade: {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {(product.price || 0) * (product.quantity || 1)} MZN
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.price || 0} MZN cada
                          </p>
                        </div>
                      </div>
                    ))}

                    {totalProductPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setOrderDetailsPage((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              className={
                                orderDetailsPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: totalProductPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setOrderDetailsPage(page)}
                                isActive={orderDetailsPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setOrderDetailsPage((prev) =>
                                  Math.min(totalProductPages, prev + 1)
                                )
                              }
                              className={
                                orderDetailsPage === totalProductPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-accent">
                      {order.total} MZN
                    </span>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
