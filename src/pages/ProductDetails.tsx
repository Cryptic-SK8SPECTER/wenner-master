import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockProducts } from "@/data/products";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, {
      message: "Cupom deve ter pelo menos 3 caracteres",
    })
    .max(20, {
      message: "Cupom muito longo",
    })
    .regex(/^[A-Z0-9]+$/, {
      message: "Cupom deve conter apenas letras maiúsculas e números",
    }),
});

// Mock coupons
const validCoupons = {
  SAVE10: {
    discount: 10,
    type: "percentage" as const,
  },
  SAVE20: {
    discount: 20,
    type: "percentage" as const,
  },
  FLAT5: {
    discount: 5,
    type: "fixed" as const,
  },
  WELCOME15: {
    discount: 15,
    type: "percentage" as const,
  },
};
interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}
const mockReviews: Review[] = [
  {
    id: "1",
    author: "Maria Silva",
    rating: 5,
    date: "2024-01-15",
    comment:
      "Produto excepcional! A qualidade é incrível e o caimento perfeito.",
  },
  {
    id: "2",
    author: "João Santos",
    rating: 4,
    date: "2024-01-10",
    comment: "Muito bom, recomendo. Chegou rápido e bem embalado.",
  },
  {
    id: "3",
    author: "Ana Costa",
    rating: 5,
    date: "2024-01-05",
    comment: "Adorei! Superou minhas expectativas. Vou comprar mais cores.",
  },
  {
    id: "4",
    author: "Pedro Oliveira",
    rating: 3,
    date: "2024-01-03",
    comment: "Bom produto, mas esperava mais pela descrição.",
  },
  {
    id: "5",
    author: "Carla Ferreira",
    rating: 5,
    date: "2024-01-01",
    comment: "Perfeito! Exatamente como na foto. Super recomendo!",
  },
  {
    id: "6",
    author: "Lucas Rodrigues",
    rating: 4,
    date: "2023-12-28",
    comment: "Qualidade boa, entrega dentro do prazo.",
  },
  {
    id: "7",
    author: "Juliana Alves",
    rating: 5,
    date: "2023-12-25",
    comment: "Amei! Já comprei outros produtos da marca.",
  },
  {
    id: "8",
    author: "Roberto Santos",
    rating: 2,
    date: "2023-12-20",
    comment: "Não atendeu minhas expectativas. Tamanho veio diferente.",
  },
];

// Calculate rating distribution
const calculateRatingDistribution = (reviews: Review[]) => {
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };
  reviews.forEach((review) => {
    const rating = Math.floor(review.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution]++;
    }
  });
  return distribution;
};
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { user, requireAuth } = useRequireAuth();

  const product = mockProducts.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar para a loja</Button>
        </div>
      </div>
    );
  }
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const handleAddToCart = () => {
    if (!selectedColor) {
      toast({
        title: "Selecione uma cor",
        description:
          "Por favor, escolha uma cor antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedSize) {
      toast({
        title: "Selecione um tamanho",
        description:
          "Por favor, escolha um tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: finalPrice / quantity,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
      });
    }

    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} adicionado ao carrinho.`,
    });
  };
  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Selecione cor e tamanho",
        description: "Por favor, escolha cor e tamanho antes de comprar.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Processando compra...",
      description: "Redirecionando para o checkout.",
    });
  };
  const averageRating =
    mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;
  const ratingDistribution = calculateRatingDistribution(mockReviews);
  const totalReviews = mockReviews.length;

  // Calculate final price with coupon
  const calculateFinalPrice = () => {
    const basePrice = product.price * quantity;
    if (!appliedCoupon) return basePrice;
    if (appliedCoupon.type === "percentage") {
      return basePrice * (1 - appliedCoupon.discount / 100);
    } else {
      return Math.max(0, basePrice - appliedCoupon.discount);
    }
  };
  const finalPrice = calculateFinalPrice();
  const savings = appliedCoupon ? product.price * quantity - finalPrice : 0;

  // Pagination
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = mockReviews.slice(startIndex, endIndex);
  const handleApplyCoupon = () => {
    try {
      const validated = couponSchema.parse({
        code: couponCode.toUpperCase(),
      });
      const coupon = validCoupons[validated.code as keyof typeof validCoupons];
      if (coupon) {
        setAppliedCoupon({
          code: validated.code,
          ...coupon,
        });
        toast({
          title: "Cupom aplicado!",
          description: `Você ganhou ${
            coupon.type === "percentage"
              ? `${coupon.discount}%`
              : `$${coupon.discount}`
          } de desconto.`,
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: "Este cupom não existe ou expirou.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Cupom inválido",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do seu pedido.",
    });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/")}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <span>/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">
            {product.category}
          </span>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container px-4 md:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/3] bg-muted rounded-lg overflow-hidden group">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-sale text-sale-foreground font-semibold z-10">
                  -{product.discount}%
                </Badge>
              )}

              {/* Carousel Navigation */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          selectedImage === idx
                            ? "bg-primary w-6"
                            : "bg-background/60 hover:bg-background/80"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-all hover-scale",
                      selectedImage === idx
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < Math.floor(averageRating)
                          ? "fill-accent text-accent"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({mockReviews.length} avaliações)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-foreground">
                  {finalPrice.toFixed(2)} MZN
                </span>
                {(product.originalPrice || appliedCoupon) && (
                  <span className="text-xl text-muted-foreground line-through">
                    {(product.price * quantity).toFixed(2)} MZN
                  </span>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-accent"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {appliedCoupon.code}
                  </Badge>
                  <span className="text-sm text-accent font-medium">
                    Você economiza {savings.toFixed(2)} MZN!
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-6 text-xs"
                  >
                    Remover
                  </Button>
                </div>
              )}

              {/* Coupon Input */}
              {!appliedCoupon && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleApplyCoupon()
                      }
                      className="pl-10 uppercase"
                      maxLength={20}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <Separator />

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Cor: {selectedColor}</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                      selectedColor === color
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    )}
                    style={{
                      backgroundColor: color,
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Tamanho: {selectedSize}</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-6 py-2 rounded-md border-2 font-medium transition-all hover:border-primary",
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-card-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Quantidade</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => requireAuth(handleAddToCart)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => requireAuth(() => setIsFavorite(!isFavorite))}
                className={cn(
                  isFavorite && "border-sale text-sale hover:text-sale"
                )}
              >
                <Heart
                  className={cn("w-5 h-5", isFavorite && "fill-current")}
                />
              </Button>
            </div>

            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => requireAuth(handleBuyNow)}
            >
              Comprar Agora
            </Button>

            {/* Features */}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
              <TabsTrigger
                value="reviews"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Avaliações
                <Badge variant="secondary" className="ml-2">
                  {totalReviews}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Descrição Detalhada
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Especificações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-8 pt-8">
              {/* Rating Overview */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="bg-card rounded-lg p-8 shadow-card text-center">
                  <div className="text-6xl font-bold text-foreground mb-2">
                    {averageRating.toFixed(1)}
                    <span className="text-3xl text-muted-foreground">/5</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-6 h-6",
                          i < Math.floor(averageRating)
                            ? "fill-accent text-accent"
                            : i < averageRating
                            ? "fill-accent/50 text-accent"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    Baseado em {totalReviews} avaliações
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="bg-card rounded-lg p-8 shadow-card">
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count =
                        ratingDistribution[
                          stars as keyof typeof ratingDistribution
                        ];
                      const percentage = (count / totalReviews) * 100;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-16 text-right">
                            {stars} Stars
                          </span>
                          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Comentários dos Clientes
                </h3>
                <div className="space-y-4">
                  {currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-card rounded-lg p-6 shadow-card border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {review.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {review.author}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-4 h-4",
                                        i < review.rating
                                          ? "fill-accent text-accent"
                                          : "text-muted"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-
                      {Math.min(endIndex, totalReviews)} de {totalReviews}{" "}
                      avaliações
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          // Show first page, last page, current page and adjacent pages
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-2 text-muted-foreground"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="description" className="pt-8">
              <div className="bg-card rounded-lg p-8 shadow-card border border-border">
                <h3 className="text-xl font-semibold mb-4">Sobre o Produto</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Características Principais:
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>
                        Material de alta qualidade com tecnologia de ponta
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>Conforto excepcional para uso prolongado</span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>
                        Design moderno e elegante que se adapta a qualquer
                        estilo
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>
                        Durabilidade garantida com materiais resistentes
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>Fácil manutenção e cuidados simples</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="pt-8">
              <div className="bg-card rounded-lg p-8 shadow-card border border-border">
                <h3 className="text-xl font-semibold mb-6">
                  Especificações Técnicas
                </h3>
                <div className="grid gap-4">
                  <div className="flex py-3 border-b border-border">
                    <span className="font-medium w-48">Categoria:</span>
                    <span className="text-muted-foreground">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex py-3 border-b border-border">
                    <span className="font-medium w-48">Gênero:</span>
                    <span className="text-muted-foreground">
                      {product.gender}
                    </span>
                  </div>
                  <div className="flex py-3 border-b border-border">
                    <span className="font-medium w-48">Cores disponíveis:</span>
                    <span className="text-muted-foreground">
                      {product.colors.length} opções
                    </span>
                  </div>
                  <div className="flex py-3 border-b border-border">
                    <span className="font-medium w-48">Tamanhos:</span>
                    <span className="text-muted-foreground">
                      {product.sizes.join(", ")}
                    </span>
                  </div>
                  <div className="flex py-3 border-b border-border">
                    <span className="font-medium w-48">Avaliação:</span>
                    <span className="text-muted-foreground">
                      {averageRating.toFixed(1)}/5.0 estrelas
                    </span>
                  </div>
                  <div className="flex py-3">
                    <span className="font-medium w-48">SKU:</span>
                    <span className="text-muted-foreground">
                      PRD-{product.id.padStart(6, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetails;
