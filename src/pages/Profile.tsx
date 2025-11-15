import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Package, User, Lock, MapPin } from "lucide-react";
import { mockProducts } from "@/data/products";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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

const Profile = () => {
  const { toast } = useToast();
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetailsPage, setOrderDetailsPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(mockProducts.slice(0, 12).map(p => p.id));
  const itemsPerPage = 4;
  const orderDetailsItemsPerPage = 3;

  // Mock data
  const userInfo = {
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    }
  };

  const allFavoriteProducts = mockProducts.filter(p => favoriteIds.includes(p.id));
  const totalFavoritesPages = Math.ceil(allFavoriteProducts.length / itemsPerPage);
  const favoriteProducts = allFavoriteProducts.slice(
    (favoritesPage - 1) * itemsPerPage,
    favoritesPage * itemsPerPage
  );

  const handleRemoveFavorite = (productId: string, productName: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== productId));
    
    // Ajustar página se necessário
    const newTotalProducts = allFavoriteProducts.length - 1;
    const newTotalPages = Math.ceil(newTotalProducts / itemsPerPage);
    if (favoritesPage > newTotalPages && newTotalPages > 0) {
      setFavoritesPage(newTotalPages);
    }
    
    toast({
      title: "Removido dos favoritos",
      description: `${productName} foi removido da sua lista de favoritos.`,
    });
  };

  const allOrders = [
    {
      id: "001",
      date: "2024-03-15",
      total: 299.90,
      status: "pending",
      items: 2,
      products: [
        { ...mockProducts[0], quantity: 1 },
        { ...mockProducts[1], quantity: 1 }
      ]
    },
    {
      id: "002",
      date: "2024-03-10",
      total: 549.80,
      status: "processing",
      items: 3,
      products: [
        { ...mockProducts[2], quantity: 2 },
        { ...mockProducts[3], quantity: 1 }
      ]
    },
    {
      id: "003",
      date: "2024-03-05",
      total: 199.90,
      status: "delivered",
      items: 1,
      products: [
        { ...mockProducts[4], quantity: 1 }
      ]
    },
    {
      id: "004",
      date: "2024-02-28",
      total: 399.80,
      status: "cancelled",
      items: 2,
      products: [
        { ...mockProducts[5], quantity: 1 },
        { ...mockProducts[6], quantity: 1 }
      ]
    },
    {
      id: "005",
      date: "2024-02-20",
      total: 899.90,
      status: "delivered",
      items: 4,
      products: [
        { ...mockProducts[0], quantity: 2 },
        { ...mockProducts[2], quantity: 2 }
      ]
    },
    {
      id: "006",
      date: "2024-02-15",
      total: 249.90,
      status: "delivered",
      items: 1,
      products: [
        { ...mockProducts[7], quantity: 1 }
      ]
    },
    {
      id: "007",
      date: "2024-02-10",
      total: 679.80,
      status: "delivered",
      items: 3,
      products: [
        { ...mockProducts[1], quantity: 1 },
        { ...mockProducts[3], quantity: 2 }
      ]
    },
    {
      id: "008",
      date: "2024-02-05",
      total: 349.90,
      status: "delivered",
      items: 2,
      products: [
        { ...mockProducts[4], quantity: 1 },
        { ...mockProducts[5], quantity: 1 }
      ]
    }
  ];

  const totalOrdersPages = Math.ceil(allOrders.length / itemsPerPage);
  const orders = allOrders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "secondary" },
      processing: { label: "Em Espera", variant: "default" },
      delivered: { label: "Recebido", variant: "outline" },
      cancelled: { label: "Cancelado", variant: "destructive" }
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
                      <Input id="name" defaultValue={userInfo.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" defaultValue={userInfo.phone} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={userInfo.email} />
                  </div>
                  <Button>Salvar Alterações</Button>
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
                      <div key={product.id} className="flex gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-lg font-bold text-accent mt-1">
                            {product.price.toFixed(2)} MZN
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveFavorite(product.id, product.name)}
                          aria-label="Remover dos favoritos"
                        >
                          <Heart className="h-5 w-5 fill-accent text-accent" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {totalFavoritesPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setFavoritesPage(prev => Math.max(1, prev - 1))}
                            className={favoritesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalFavoritesPages }, (_, i) => i + 1).map((page) => (
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
                            onClick={() => setFavoritesPage(prev => Math.min(totalFavoritesPages, prev + 1))}
                            className={favoritesPage === totalFavoritesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      <div key={order.id} className="p-4 border border-border rounded-lg hover:border-accent transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">Pedido #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {order.items} {order.items === 1 ? 'item' : 'itens'}
                          </div>
                          <div className="text-lg font-bold text-foreground">
                             {order.total.toFixed(2)} MZN
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
                            onClick={() => setOrdersPage(prev => Math.max(1, prev - 1))}
                            className={ordersPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalOrdersPages }, (_, i) => i + 1).map((page) => (
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
                            onClick={() => setOrdersPage(prev => Math.min(totalOrdersPages, prev + 1))}
                            className={ordersPage === totalOrdersPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                    <Input id="street" defaultValue={userInfo.address.street} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" defaultValue={userInfo.address.city} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" defaultValue={userInfo.address.state} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input id="zipCode" defaultValue={userInfo.address.zipCode} />
                    </div>
                  </div>
                  <Button>Salvar Endereço</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alterar Senha */}
            <TabsContent value="password" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Alterar Senha</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => {
        if (!open) {
          setSelectedOrder(null);
          setOrderDetailsPage(1);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder}</DialogTitle>
            <DialogDescription>
              Confira os produtos do seu pedido
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (() => {
            const order = allOrders.find(o => o.id === selectedOrder);
            if (!order) return null;

            const totalProductPages = Math.ceil(order.products.length / orderDetailsItemsPerPage);
            const displayedProducts = order.products.slice(
              (orderDetailsPage - 1) * orderDetailsItemsPerPage,
              orderDetailsPage * orderDetailsItemsPerPage
            );
            
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pedido</p>
                    <p className="font-semibold">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Produtos ({order.products.length})</h3>
                  {displayedProducts.map((product, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-border rounded-lg">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantidade: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {((product.price || 0) * (product.quantity || 1)).toFixed(2)} MZN
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(product.price || 0).toFixed(2)} MZN cada
                        </p>
                      </div>
                    </div>
                  ))}

                  {totalProductPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setOrderDetailsPage(prev => Math.max(1, prev - 1))}
                            className={orderDetailsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((page) => (
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
                            onClick={() => setOrderDetailsPage(prev => Math.min(totalProductPages, prev + 1))}
                            className={orderDetailsPage === totalProductPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                     {order.total.toFixed(2)} MZN
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
