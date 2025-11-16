import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  ShoppingBag,
  Plus,
  Filter,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Users,
  BarChart3,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { mockProducts } from "@/data/products";
import { Product } from "@/features/products/productTypes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch } from "@/app/hooks";
import { createProduct } from "@/features/products/productActions";

type ProductVariant = {
  id: string;
  color: string;
  size: string;
  quantity: number;
  image: string;
  imageFile?: File;
};

// Validation schema for new products
const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  price: z.number().positive("Preço deve ser positivo"),
  category: z.string().trim().min(1, "Selecione uma categoria"),
  gender: z.string().trim().min(1, "Selecione um gênero"),
  description: z
    .string()
    .trim()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(500, "Descrição muito longa"),
  imageCover: z.string().url("URL da imagem inválida"),
});

const Admin = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [productImage, setProductImage] = useState<string>("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 5;
  const [editingProduct, setEditingProduct] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVariants, setEditingVariants] = useState<ProductVariant[]>([]);

  // Mock customers data
  const allCustomers = [
    {
      id: "C001",
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123 - São Paulo, SP",
      joinDate: "2024-01-15",
      totalOrders: 5,
      totalSpent: 2499.5,
      lastOrder: "2024-03-15",
    },
    {
      id: "C002",
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "(21) 97654-3210",
      address: "Av. Atlântica, 456 - Rio de Janeiro, RJ",
      joinDate: "2024-02-01",
      totalOrders: 3,
      totalSpent: 1549.7,
      lastOrder: "2024-03-14",
    },
    {
      id: "C003",
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(31) 96543-2109",
      address: "Praça da Liberdade, 789 - Belo Horizonte, MG",
      joinDate: "2024-01-20",
      totalOrders: 2,
      totalSpent: 399.8,
      lastOrder: "2024-03-13",
    },
    {
      id: "C004",
      name: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "(47) 95432-1098",
      address: "Rua XV de Novembro, 321 - Curitiba, PR",
      joinDate: "2024-02-10",
      totalOrders: 4,
      totalSpent: 1799.6,
      lastOrder: "2024-03-12",
    },
    {
      id: "C005",
      name: "Carla Ferreira",
      email: "carla.ferreira@email.com",
      phone: "(51) 94321-0987",
      address: "Av. Ipiranga, 654 - Porto Alegre, RS",
      joinDate: "2024-01-05",
      totalOrders: 8,
      totalSpent: 4299.2,
      lastOrder: "2024-03-11",
    },
  ];

  // Mock orders data (reusing from Profile page)
  const allOrders = [
    {
      id: "001",
      customerName: "Maria Silva",
      date: "2024-03-15",
      total: 299.9,
      status: "pending",
      items: 2,
    },
    {
      id: "002",
      customerName: "João Santos",
      date: "2024-03-14",
      total: 549.8,
      status: "processing",
      items: 3,
    },
    {
      id: "003",
      customerName: "Ana Costa",
      date: "2024-03-13",
      total: 199.9,
      status: "delivered",
      items: 1,
    },
    {
      id: "004",
      customerName: "Pedro Oliveira",
      date: "2024-03-12",
      total: 399.8,
      status: "cancelled",
      items: 2,
    },
    {
      id: "005",
      customerName: "Carla Ferreira",
      date: "2024-03-11",
      total: 899.9,
      status: "delivered",
      items: 4,
    },
    {
      id: "006",
      customerName: "Lucas Rodrigues",
      date: "2024-03-10",
      total: 249.9,
      status: "pending",
      items: 1,
    },
    {
      id: "007",
      customerName: "Juliana Alves",
      date: "2024-03-09",
      total: 679.8,
      status: "processing",
      items: 3,
    },
    {
      id: "008",
      customerName: "Roberto Santos",
      date: "2024-03-08",
      total: 349.9,
      status: "delivered",
      items: 2,
    },
  ];

  // Filter orders
  const filteredOrders = allOrders.filter((order) => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Filter products
  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customers
  const filteredCustomers = allCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.id.includes(customerSearchTerm)
  );

  // Pagination calculations
  const totalOrdersPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const totalCustomersPages = Math.ceil(
    filteredCustomers.length / itemsPerPage
  );
  const totalProductsPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedOrders = filteredOrders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );

  const paginatedCustomers = filteredCustomers.slice(
    (customersPage - 1) * itemsPerPage,
    customersPage * itemsPerPage
  );

  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );

  // Sales statistics
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = allOrders.length;
  const averageOrderValue = totalRevenue / totalOrders;
  const deliveredOrders = allOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const deliveryRate = (deliveredOrders / totalOrders) * 100;

  const handleRemoveCustomer = (customerId: string) => {
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso.",
    });
  };

  // Reset pagination when filters change
  const handleOrderFilterChange = (filter: string) => {
    setOrderFilter(filter);
    setOrdersPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setOrdersPage(1);
    setProductsPage(1);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearchTerm(value);
    setCustomersPage(1);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Simulate loading existing variants (in a real app, these would come from the database)
    const mockVariants: ProductVariant[] = [
      {
        id: "1",
        color: (product.colors && product.colors[0]) || "Preto",
        size: (product.sizes && product.sizes[0]) || "M",
        quantity: 10,
        image: product.image,
      },
    ];
    setEditingVariants(mockVariants);
    setIsEditDialogOpen(true);
  };

  const addEditingVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      color: "",
      size: "",
      quantity: 0,
      image: "",
    };
    setEditingVariants([...editingVariants, newVariant]);
  };

  const removeEditingVariant = (id: string) => {
    setEditingVariants(editingVariants.filter((v) => v.id !== id));
  };

  const updateEditingVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setEditingVariants(
      editingVariants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleEditingVariantImageUpload = (
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingVariants(
          editingVariants.map((v) =>
            v.id === variantId ? { ...v, image: reader.result as string } : v
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (editingVariants.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma variante do produto",
        variant: "destructive",
      });
      return;
    }

    const incompleteVariant = editingVariants.find(
      (v) => !v.color || !v.size || v.quantity <= 0
    );
    if (incompleteVariant) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos das variantes",
        variant: "destructive",
      });
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      gender: formData.get("gender") as string,
    };

    toast({
      title: "Produto atualizado!",
      description: `${updatedProduct.name} foi atualizado com ${editingVariants.length} variante(s).`,
    });

    setIsEditDialogOpen(false);
    setEditingProduct(null);
    setEditingVariants([]);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pendente", variant: "secondary" },
      processing: { label: "Confirmado", variant: "default" },
      delivered: { label: "Entregue", variant: "outline" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return allOrders.length;
    return allOrders.filter((order) => order.status === status).length;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // keep file for upload
      setProductImageFile(file);

      // create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantImageUpload = (
    variantId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // store preview (we keep using base64 preview for variants)
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariants(
          variants.map((v) =>
            v.id === variantId
              ? {
                  ...v,
                  image: reader.result as string,
                  imageFile: file as File,
                }
              : v
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      color: "",
      size: "",
      quantity: 0,
      image: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        category: formData.get("category") as string,
        gender: formData.get("gender") as string,
        description: formData.get("description") as string,
        imageCover: productImageFile,
      };


      // Validar dados com schema
      // productSchema.parse(productData);

      // Despache thunk para criar produto usando FormData (multipart)
      const form = new FormData();
      form.append("name", productData.name);
      form.append("price", String(productData.price));
      form.append("category", productData.category);
      form.append("gender", productData.gender);
      form.append("description", productData.description);

      // Main image file (prefer file; fallback to nothing)
      if (productImageFile) {
        form.append("imageCover", productImageFile);
      }

     

      await dispatch(createProduct(form)).unwrap();

      toast({
        title: "Produto cadastrado!",
        description: `${productData.name} foi adicionado com sucesso.`,
      });

      e.currentTarget.reset();
      setProductImage("");
    } catch (error) {

      console.log('resposta   :' , error)
      const errorMsg =
        error instanceof Error ? error.message : "Erro ao cadastrar produto";
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie pedidos e produtos da loja
            </p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="add-product" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Gestão de Pedidos</CardTitle>
                      <CardDescription>
                        {filteredOrders.length} pedidos encontrados
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por cliente ou ID..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={orderFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleOrderFilterChange("all")}
                    >
                      Todos ({getStatusCount("all")})
                    </Button>
                    <Button
                      variant={
                        orderFilter === "pending" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleOrderFilterChange("pending")}
                    >
                      Pendentes ({getStatusCount("pending")})
                    </Button>
                    <Button
                      variant={
                        orderFilter === "processing" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleOrderFilterChange("processing")}
                    >
                      Confirmados ({getStatusCount("processing")})
                    </Button>
                    <Button
                      variant={
                        orderFilter === "delivered" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleOrderFilterChange("delivered")}
                    >
                      Entregues ({getStatusCount("delivered")})
                    </Button>
                    <Button
                      variant={
                        orderFilter === "cancelled" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleOrderFilterChange("cancelled")}
                    >
                      Cancelados ({getStatusCount("cancelled")})
                    </Button>
                  </div>

                  <Separator />

                  {/* Orders List */}
                  <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">
                                Pedido #{order.id}
                              </h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Cliente: {order.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Data:{" "}
                              {new Date(order.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {order.items} itens
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {order.total.toFixed(2)} MZN
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum pedido encontrado
                      </div>
                    )}
                  </div>

                  {/* Pagination for Orders */}
                  {filteredOrders.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {(ordersPage - 1) * itemsPerPage + 1} a{" "}
                        {Math.min(
                          ordersPage * itemsPerPage,
                          filteredOrders.length
                        )}{" "}
                        de {filteredOrders.length} pedidos
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOrdersPage((p) => Math.max(1, p - 1))
                          }
                          disabled={ordersPage === 1}
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalOrdersPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                page === ordersPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setOrdersPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOrdersPage((p) =>
                              Math.min(totalOrdersPages, p + 1)
                            )
                          }
                          disabled={ordersPage === totalOrdersPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Gestão de Clientes</CardTitle>
                      <CardDescription>
                        {filteredCustomers.length} clientes cadastrados
                      </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={customerSearchTerm}
                        onChange={(e) =>
                          handleCustomerSearchChange(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paginatedCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {customer.name}
                              </h3>
                              <Badge variant="outline">ID: {customer.id}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {customer.email}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {customer.phone}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {customer.address}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Cliente desde:{" "}
                                {new Date(customer.joinDate).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4 hidden md:block">
                              <p className="text-sm text-muted-foreground">
                                {customer.totalOrders} pedidos
                              </p>
                              <p className="text-lg font-bold text-foreground">
                                {customer.totalSpent.toFixed(2)} MZN
                              </p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">
                                    Detalhes
                                  </span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Cliente</DialogTitle>
                                  <DialogDescription>
                                    Informações completas sobre {customer.name}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCustomer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-muted-foreground">
                                          ID do Cliente
                                        </Label>
                                        <p className="font-semibold">
                                          {selectedCustomer.id}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Nome Completo
                                        </Label>
                                        <p className="font-semibold">
                                          {selectedCustomer.name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Email
                                        </Label>
                                        <p className="font-semibold">
                                          {selectedCustomer.email}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Telefone
                                        </Label>
                                        <p className="font-semibold">
                                          {selectedCustomer.phone}
                                        </p>
                                      </div>
                                      <div className="col-span-2">
                                        <Label className="text-muted-foreground">
                                          Endereço
                                        </Label>
                                        <p className="font-semibold">
                                          {selectedCustomer.address}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Cliente desde
                                        </Label>
                                        <p className="font-semibold">
                                          {new Date(
                                            selectedCustomer.joinDate
                                          ).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Último Pedido
                                        </Label>
                                        <p className="font-semibold">
                                          {new Date(
                                            selectedCustomer.lastOrder
                                          ).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Total de Pedidos
                                        </Label>
                                        <p className="font-semibold text-accent">
                                          {selectedCustomer.totalOrders} pedidos
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">
                                          Total Gasto
                                        </Label>
                                        <p className="font-semibold text-accent">
                                          {selectedCustomer.totalSpent.toFixed(
                                            2
                                          )}{" "}
                                          MZN
                                        </p>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Histórico de Pedidos Recentes
                                      </h4>
                                      <div className="space-y-2">
                                        {allOrders
                                          .filter(
                                            (order) =>
                                              order.customerName ===
                                              selectedCustomer.name
                                          )
                                          .map((order) => (
                                            <div
                                              key={order.id}
                                              className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                              <div>
                                                <p className="font-medium">
                                                  Pedido #{order.id}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  {new Date(
                                                    order.date
                                                  ).toLocaleDateString("pt-BR")}
                                                </p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                {getStatusBadge(order.status)}
                                                <p className="font-bold">
                                                  {order.total.toFixed(2)} MZN
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum cliente encontrado
                      </div>
                    )}
                  </div>

                  {/* Pagination for Customers */}
                  {filteredCustomers.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {(customersPage - 1) * itemsPerPage + 1} a{" "}
                        {Math.min(
                          customersPage * itemsPerPage,
                          filteredCustomers.length
                        )}{" "}
                        de {filteredCustomers.length} clientes
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCustomersPage((p) => Math.max(1, p - 1))
                          }
                          disabled={customersPage === 1}
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalCustomersPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                page === customersPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCustomersPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCustomersPage((p) =>
                              Math.min(totalCustomersPages, p + 1)
                            )
                          }
                          disabled={customersPage === totalCustomersPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-6">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Receita Total
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalRevenue.toFixed(2)} MZN
                      </div>
                      <p className="text-xs text-muted-foreground">
                        De {totalOrders} pedidos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Ticket Médio
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {averageOrderValue.toFixed(2)} MZN
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Por pedido
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de Pedidos
                      </CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalOrders}</div>
                      <p className="text-xs text-muted-foreground">
                        {deliveredOrders} entregues
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Taxa de Entrega
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {deliveryRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        De todos os pedidos
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Status</CardTitle>
                    <CardDescription>
                      Distribuição de pedidos por status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">
                            Quantidade
                          </TableHead>
                          <TableHead className="text-right">
                            Valor Total
                          </TableHead>
                          <TableHead className="text-right">
                            Percentual
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          "pending",
                          "processing",
                          "delivered",
                          "cancelled",
                        ].map((status) => {
                          const ordersWithStatus = allOrders.filter(
                            (o) => o.status === status
                          );
                          const total = ordersWithStatus.reduce(
                            (sum, o) => sum + o.total,
                            0
                          );
                          const percentage =
                            (ordersWithStatus.length / totalOrders) * 100;
                          const statusLabels: Record<string, string> = {
                            pending: "Pendente",
                            processing: "Confirmado",
                            delivered: "Entregue",
                            cancelled: "Cancelado",
                          };

                          return (
                            <TableRow key={status}>
                              <TableCell>{getStatusBadge(status)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {ordersWithStatus.length}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {total.toFixed(2)} MZN
                              </TableCell>
                              <TableCell className="text-right">
                                {percentage.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Top Customers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Principais Clientes</CardTitle>
                    <CardDescription>
                      Clientes com maior volume de compras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Pedidos</TableHead>
                          <TableHead className="text-right">
                            Total Gasto
                          </TableHead>
                          <TableHead className="text-right">
                            Último Pedido
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCustomers
                          .sort((a, b) => b.totalSpent - a.totalSpent)
                          .slice(0, 5)
                          .map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">
                                {customer.name}
                              </TableCell>
                              <TableCell className="text-right">
                                {customer.totalOrders}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-accent">
                                {customer.totalSpent.toFixed(2)} MZN
                              </TableCell>
                              <TableCell className="text-right">
                                {new Date(
                                  customer.lastOrder
                                ).toLocaleDateString("pt-BR")}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Produtos Cadastrados</CardTitle>
                      <CardDescription>
                        {filteredProducts.length} produtos no catálogo
                      </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-4 p-4 border border-border rounded-lg hover:border-accent transition-colors"
                      >
                        <img
                          src={product.imageCover}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {product.category} • {product.gender}
                              </p>
                              <p className="text-lg font-bold text-accent mt-1">
                                {product.price.toFixed(2)} MZN
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        Nenhum produto encontrado
                      </div>
                    )}
                  </div>

                  {/* Pagination for Products */}
                  {filteredProducts.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {(productsPage - 1) * itemsPerPage + 1} a{" "}
                        {Math.min(
                          productsPage * itemsPerPage,
                          filteredProducts.length
                        )}{" "}
                        de {filteredProducts.length} produtos
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProductsPage((p) => Math.max(1, p - 1))
                          }
                          disabled={productsPage === 1}
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalProductsPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                page === productsPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setProductsPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProductsPage((p) =>
                              Math.min(totalProductsPages, p + 1)
                            )
                          }
                          disabled={productsPage === totalProductsPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add Product Tab */}
            <TabsContent value="add-product" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastrar Novo Produto</CardTitle>
                  <CardDescription>
                    Adicione um novo produto ao catálogo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Ex: Camiseta Premium"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (MZN) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Camisetas">Camisetas</SelectItem>
                            <SelectItem value="Vestidos">Vestidos</SelectItem>
                            <SelectItem value="Casacos">Casacos</SelectItem>
                            <SelectItem value="Calças">Calças</SelectItem>
                            <SelectItem value="Blazers">Blazers</SelectItem>
                            <SelectItem value="Sapatos">Sapatos</SelectItem>
                            <SelectItem value="Carteiras">Carteiras</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gênero *</Label>
                        <Select name="gender" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                            <SelectItem value="Unissex">Unissex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Descreva o produto..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Imagem Principal do Produto *</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Clique para fazer upload da imagem
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        {productImage && (
                          <div className="relative">
                            <img
                              src={productImage}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => setProductImage("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />
                    {/* 
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Variantes do Produto *</Label>
                          <p className="text-sm text-muted-foreground">
                            Adicione as variantes com cor, tamanho, quantidade e imagem
                          </p>
                        </div>
                        <Button type="button" onClick={addVariant} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Variante
                        </Button>
                      </div>

                      {variants.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                          Nenhuma variante adicionada ainda
                        </div>
                      )}

                      <div className="space-y-4">
                        {variants.map((variant, index) => (
                          <Card key={variant.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold">Variante {index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeVariant(variant.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label>Cor *</Label>
                                    <Input
                                      placeholder="Ex: Preto"
                                      value={variant.color}
                                      onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Tamanho *</Label>
                                    <Input
                                      placeholder="Ex: M"
                                      value={variant.size}
                                      onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Quantidade *</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      value={variant.quantity}
                                      onChange={(e) => updateVariant(variant.id, "quantity", parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Imagem da Variante</Label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                                      <div className="flex flex-col items-center justify-center">
                                        <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Upload da imagem</p>
                                      </div>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleVariantImageUpload(variant.id, e)}
                                      />
                                    </label>
                                    {variant.image && (
                                      <div className="relative">
                                        <img
                                          src={variant.image}
                                          alt="Variante"
                                          className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute -top-2 -right-2 h-6 w-6"
                                          onClick={() => updateVariant(variant.id, "image", "")}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Separator /> */}

                    <div className="flex gap-3">
                      <Button type="submit" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Cadastrar Produto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setProductImage("");
                          setVariants([]);
                        }}
                      >
                        Limpar Formulário
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto e suas variantes
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingProduct.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (MZN) *</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.price}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria *</Label>
                  <Select
                    name="category"
                    defaultValue={editingProduct.category}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T-Shirts">Camisetas</SelectItem>
                      <SelectItem value="Dresses">Vestidos</SelectItem>
                      <SelectItem value="Jackets">Jaquetas</SelectItem>
                      <SelectItem value="Pants">Calças</SelectItem>
                      <SelectItem value="Blazers">Blazers</SelectItem>
                      <SelectItem value="Shoes">Calçados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gênero *</Label>
                  <Select
                    name="gender"
                    defaultValue={editingProduct.gender}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Masculino</SelectItem>
                      <SelectItem value="Women">Feminino</SelectItem>
                      <SelectItem value="Unisex">Unissex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Variantes do Produto *</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerencie as variantes de cor, tamanho e estoque
                    </p>
                  </div>
                  <Button type="button" onClick={addEditingVariant} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Variante
                  </Button>
                </div>

                {editingVariants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    Nenhuma variante adicionada ainda
                  </div>
                )}

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {editingVariants.map((variant, index) => (
                    <Card key={variant.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">
                              Variante {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEditingVariant(variant.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Cor *</Label>
                              <Input
                                placeholder="Ex: Preto"
                                value={variant.color}
                                onChange={(e) =>
                                  updateEditingVariant(
                                    variant.id,
                                    "color",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tamanho *</Label>
                              <Input
                                placeholder="Ex: M"
                                value={variant.size}
                                onChange={(e) =>
                                  updateEditingVariant(
                                    variant.id,
                                    "size",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Quantidade *</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={variant.quantity}
                                onChange={(e) =>
                                  updateEditingVariant(
                                    variant.id,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Imagem da Variante</Label>
                            <div className="flex items-center gap-4">
                              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                                <div className="flex flex-col items-center justify-center">
                                  <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Upload da imagem
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleEditingVariantImageUpload(
                                      variant.id,
                                      e
                                    )
                                  }
                                />
                              </label>
                              {variant.image && (
                                <div className="relative">
                                  <img
                                    src={variant.image}
                                    alt="Variante"
                                    className="w-24 h-24 object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6"
                                    onClick={() =>
                                      updateEditingVariant(
                                        variant.id,
                                        "image",
                                        ""
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProduct(null);
                    setEditingVariants([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Pencil className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
