import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { fetchProductBySlug, fetchRelatedProducts } from "../features/product/productActions";
import { clearCurrentProduct } from "../features/product/productSlice";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { productionUrl } from "@/lib/utils";

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
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
  };
}

interface Variant {
  _id: string;
  product: string;
  color: string;
  size: string;
  price: number;
  image: string;
  stock: number;
}

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast: showToast } = useToast();

  const { currentProduct, relatedProducts, loading, error } = useAppSelector(
    (state) => state.product
  );

  const { user, requireAuth } = useRequireAuth();
  const { addItem } = useCart();

  // Estados locais
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

  // Buscar detalhes do produto pelo slug
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }

    // Limpar produto atual ao desmontar
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  // Buscar produtos relacionados quando o produto atual for carregado
  useEffect(() => {
    if (currentProduct?.category) {
      dispatch(
        fetchRelatedProducts({
          category: currentProduct.category,
          excludeId: currentProduct._id,
        })
      );
    }
  }, [dispatch, currentProduct?._id, currentProduct?.category]);

  // Tratar erros
  useEffect(() => {
    if (error) {
      showToast({
        variant: "destructive",
        title: "Erro ao carregar produto",
        description: error,
      });
    }
  }, [error, showToast]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-20 text-center">
          <div className="flex justify-center items-center">
            <p className="text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state ou produto não encontrado
  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Produto não encontrado"}
          </h1>
          <Button onClick={() => navigate("/")}>Voltar para a loja</Button>
        </div>
      </div>
    );
  }

  const product = currentProduct;


  const productImages = [
    ...(product.variants?.map((variant) => variant.image) || []),
    ...(product.images || []),
  ];

  // Variantes do produto (garanta que vem populado com .populate('variants') no backend)
  const variants: Variant[] = product.variants || [];

  // === FUNÇÕES DE SINCRONIZAÇÃO AUTOMÁTICA ===
  const getAvailableSizesForColor = (color: string) => {
    if (!color) return Array.from(new Set(variants.map((v) => v.size)));
    return Array.from(
      new Set(variants.filter((v) => v.color === color).map((v) => v.size))
    );
  };

  const getAvailableColorsForSize = (size: string) => {
    if (!size) return Array.from(new Set(variants.map((v) => v.color)));
    return Array.from(
      new Set(variants.filter((v) => v.size === size).map((v) => v.color))
    );
  };

  // Cores e tamanhos disponíveis baseados na seleção atual
  const availableColors = selectedSize
    ? getAvailableColorsForSize(selectedSize)
    : Array.from(new Set(variants.map((v) => v.color)));

  const availableSizes = selectedColor
    ? getAvailableSizesForColor(selectedColor)
    : Array.from(new Set(variants.map((v) => v.size)));

  // Handlers com sincronização automática
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    
    // Se um tamanho já está selecionado, verificar se ainda é válido para a nova cor
    if (selectedSize) {
      const validSizesForColor = getAvailableSizesForColor(color);
      if (!validSizesForColor.includes(selectedSize)) {
        setSelectedSize(""); // Limpar tamanho se não for compatível
      }
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Se uma cor já está selecionada, verificar se ainda é válida para o novo tamanho
    if (selectedColor) {
      const validColorsForSize = getAvailableColorsForSize(size);
      if (!validColorsForSize.includes(selectedColor)) {
        setSelectedColor(""); // Limpar cor se não for compatível
      }
    }
  };

  const reviews = product.reviews || [];
  const averageRating = product.ratingsAverage || 0;
  const totalReviews = product.ratingsQuantity || 0;

  // Calcular distribuição de ratings
  const calculateRatingDistribution = (reviews: Review[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = calculateRatingDistribution(reviews);

  // Calcular preço final com desconto
  const calculateFinalPrice = () => {
    const basePrice = (product.priceDiscount || product.price) * quantity;
    if (!appliedCoupon) return basePrice;
    if (appliedCoupon.type === "percentage") {
      return basePrice * (1 - appliedCoupon.discount / 100);
    } else {
      return Math.max(0, basePrice - appliedCoupon.discount);
    }
  };

  const finalPrice = calculateFinalPrice();
  const savings = appliedCoupon ? product.price * quantity - finalPrice : 0;

  // Paginação de reviews
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handleAddToCart = () => {
    if (!selectedColor) {
      showToast({
        title: "Selecione uma cor",
        description:
          "Por favor, escolha uma cor antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    requireAuth(() => {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product._id,
          name: product.name,
          price: finalPrice / quantity,
          image: product.imageCover,
          size: selectedSize,
          color: selectedColor,
        });
      }

      showToast({
        title: "Produto adicionado!",
        description: `${quantity}x ${product.name} adicionado ao carrinho.`,
      });
    });
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      showToast({
        title: "Selecione uma cor",
        description: "Por favor, escolha uma cor antes de comprar.",
        variant: "destructive",
      });
      return;
    }

    requireAuth(() => {
      showToast({
        title: "Processando compra...",
        description: "Redirecionando para o checkout.",
      });
    });
  };

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
        showToast({
          title: "Cupom aplicado!",
          description: `Você ganhou ${
            coupon.type === "percentage"
              ? `${coupon.discount}%`
              : `$${coupon.discount}`
          } de desconto.`,
        });
      } else {
        showToast({
          title: "Cupom inválido",
          description: "Este cupom não existe ou expirou.",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        showToast({
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
    showToast({
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
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/images/product-placeholder.jpg";
                }}
              />

              {product.priceDiscount &&
                product.priceDiscount < product.price && (
                  <Badge className="absolute top-4 left-4 bg-sale text-sale-foreground font-semibold z-10">
                    -
                    {Math.round(
                      ((product.price - product.priceDiscount) /
                        product.price) *
                        100
                    )}
                    %
                  </Badge>
                )}

              {/* Carousel Navigation */}
              {productImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? productImages.length - 1 : prev - 1
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
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {productImages.map((_, idx) => (
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
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img, idx) => (
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
                      src={`${productionUrl}/img/variants/${img}`}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg";
                      }}
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
                  ({totalReviews} avaliações)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-foreground">
                  {finalPrice.toFixed(2)} MZN
                </span>
                {product.priceDiscount &&
                  product.priceDiscount < product.price && (
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
              <h3 className="font-semibold mb-3">Cor: {selectedColor || "Selecione"}</h3>
              <div className="flex gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
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
              <h3 className="font-semibold mb-3">Tamanho: {selectedSize || "Selecione"}</h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
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
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
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
              onClick={handleBuyNow}
            >
              Comprar Agora
            </Button>
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
                      const percentage =
                        totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-16 text-right">
                            {stars} Estrelas
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
                      key={review._id}
                      className="bg-card rounded-lg p-6 shadow-card border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {review.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {review.user.name}
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
                              {new Date(review.createdAt).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mt-3">
                            {review.review}
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
                      {availableColors.length} opções
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
                      PRD-{product._id.slice(-6)}
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
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
