import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "../features/product/productActions";
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
import { validateCoupon, clearValidatedCoupon } from "@/features/coupon/cupomActions";
import { clearCouponError } from "@/features/coupon/cupomSlice";
import {
  addToFavorites,
  removeFromFavorites,
  fetchFavorites,
} from "@/features/favorite/favoriteActions";
import { selectIsFavorite } from "@/features/favorite/favoriteSlice";

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
  } | null;
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

  const {
    validatedCoupon,
    loading: couponLoading,
    error: couponError,
  } = useAppSelector((state) => state.coupon);

  const { favorites, loading: favoritesLoading } = useAppSelector(
    (state) => state.favorites
  );

  const { user, requireAuth } = useRequireAuth();
  const { addItem } = useCart();

  // Estados locais
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
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

  // Buscar favoritos quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

  // Verificar se o produto está nos favoritos
  const isFavorite = useAppSelector((state) => {
    if (!currentProduct?._id) return false;
    return selectIsFavorite(currentProduct._id)(state);
  });

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

  // Atualize o useEffect para limpar erros de cupom:
  useEffect(() => {
    if (couponError) {
      showToast({
        variant: "destructive",
        title: "Erro no cupom",
        description: couponError,
      });
      dispatch(clearCouponError());
    }
  }, [couponError, showToast, dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumb Skeleton */}
        <div className="container px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="container px-3 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-[3/3] w-full rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Skeleton className="h-8 sm:h-10 w-3/4 mb-2" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-4 sm:h-5 sm:w-5 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Price Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 sm:h-12 w-40" />
                  <Skeleton className="h-6 sm:h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              <Skeleton className="h-20 w-full" />

              <Separator />

              {/* Color Selection Skeleton */}
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Size Selection Skeleton */}
              <div>
                <Skeleton className="h-5 w-32 mb-3" />
                <div className="flex gap-2 flex-wrap">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-9 sm:h-10 w-12 sm:w-16 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Quantity Skeleton */}
              <div>
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-md" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-md" />
                </div>
              </div>

              <Separator />

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Skeleton className="h-12 sm:h-14 flex-1 w-full sm:w-auto" />
                <Skeleton className="h-12 sm:h-14 w-full sm:w-14" />
              </div>
              <Skeleton className="h-12 sm:h-14 w-full" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            <div className="flex gap-4 border-b border-border mb-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </div>
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
    if (!validatedCoupon) return basePrice;

    // Usar os valores retornados pela API
    return validatedCoupon.finalPrice * quantity;
  };

  const finalPrice = calculateFinalPrice();
  const savings = validatedCoupon
    ? (product.priceDiscount || product.price) * quantity - finalPrice
    : 0;

  // Paginação de reviews
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handleAddToCart = () => {
    requireAuth(() => {
      if (!selectedColor) {
        showToast({
          title: "Selecione uma cor",
          description:
            "Por favor, escolha uma cor antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }
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
    requireAuth(() => {
      if (!selectedColor) {
        showToast({
          title: "Selecione uma cor",
          description: "Por favor, escolha uma cor antes de comprar.",
          variant: "destructive",
        });
        return;
      }
      showToast({
        title: "Processando compra...",
        description: "Redirecionando para o checkout.",
      });
    });
  };

  // Substitua a função handleApplyCoupon por:
  const handleApplyCoupon = async () => {
    try {
      // Validar formato do cupom localmente
      const validated = couponSchema.parse({
        code: couponCode.toUpperCase(),
      });

      // Chamar a API para validar o cupom
      const result = await dispatch(
        validateCoupon({
          code: validated.code,
          userId: user?._id,
          totalPrice: (product.priceDiscount || product.price) * quantity,
        })
      ).unwrap();

      showToast({
        title: "Cupom aplicado!",
        description: `Você ganhou ${result.discountValue.toFixed(
          2
        )} MZN de desconto.`,
      });
    } catch (error: any) {
      showToast({
        title: "Cupom inválido",
        description: error || "Este cupom não pode ser aplicado.",
        variant: "destructive",
      });
    }
  };

  //  handleRemoveCoupon
  const handleRemoveCoupon = () => {
    dispatch(clearValidatedCoupon());
    setCouponCode("");
    showToast({
      title: "Cupom removido",
      description: "O desconto foi removido do seu pedido.",
    });
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = async () => {
    requireAuth(async () => {
      if (!currentProduct?._id) return;

      setIsFavoriteLoading(true);
      const productId = currentProduct._id;

      try {
        if (isFavorite) {
          // Remover dos favoritos
          await dispatch(removeFromFavorites({ productId })).unwrap();
          showToast({
            title: "Removido dos favoritos",
            description: `${currentProduct.name} foi removido dos favoritos.`,
          });
        } else {
          // Adicionar aos favoritos
          await dispatch(addToFavorites({ productId })).unwrap();
          showToast({
            title: "Adicionado aos favoritos!",
            description: `${currentProduct.name} foi adicionado aos favoritos.`,
          });
        }
      } catch (error: any) {
        // Se o erro for que o produto já está nos favoritos, então remove
        const errorMessage = error?.message || error || "";
        if (
          errorMessage.includes("já está nos favoritos") ||
          errorMessage.includes("já existe")
        ) {
          try {
            await dispatch(removeFromFavorites({ productId })).unwrap();
            showToast({
              title: "Removido dos favoritos",
              description: `${currentProduct.name} foi removido dos favoritos.`,
            });
          } catch (removeError) {
            showToast({
              title: "Erro",
              description: "Erro ao remover dos favoritos",
              variant: "destructive",
            });
          }
        } else {
          // Outros erros (auth, network, etc)
          showToast({
            title: "Erro",
            description: error?.message || "Erro ao processar favorito",
            variant: "destructive",
          });
        }
      } finally {
        setIsFavoriteLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
          <button
            onClick={() => navigate("/")}
            className="hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Voltar
          </button>
          <span className="hidden xs:inline">/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors whitespace-nowrap hidden sm:inline">
            {product.category}
          </span>
          <span className="hidden sm:inline">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container px-3 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
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
                        e.currentTarget.src =
                          "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        i < Math.floor(averageRating)
                          ? "fill-accent text-accent"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ({totalReviews} avaliações)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  {finalPrice.toFixed(2)} MZN
                </span>
                {((product.priceDiscount &&
                  product.priceDiscount < product.price) ||
                  validatedCoupon) && (
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    {(product.price * quantity).toFixed(2)} MZN
                  </span>
                )}
              </div>

              {validatedCoupon && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent border-accent"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {validatedCoupon.coupon.code}
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
              {!validatedCoupon && (
                <div className="flex flex-col sm:flex-row gap-2">
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
                        e.key === "Enter" &&
                        !couponLoading &&
                        handleApplyCoupon()
                      }
                      className="pl-10 uppercase text-sm"
                      maxLength={20}
                      disabled={couponLoading}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="w-full sm:w-auto"
                  >
                    {couponLoading ? "Validando..." : "Aplicar"}
                  </Button>
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground">{product.description}</p>

            <Separator />

            {/* Color Selection */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
                Cor: {selectedColor || "Selecione"}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all hover:scale-110",
                      selectedColor === color
                        ? "border-primary ring-2 ring-primary ring-offset-1 sm:ring-offset-2"
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
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
                Tamanho: {selectedSize || "Selecione"}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={cn(
                      "px-4 sm:px-6 py-1.5 sm:py-2 rounded-md border-2 text-sm sm:text-base font-medium transition-all hover:border-primary",
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

            {/* Reset Selection Button */}
            {(selectedColor || selectedSize) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedColor("");
                  setSelectedSize("");
                }}
                className="w-full"
              >
                Limpar Seleção
              </Button>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Quantidade</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg sm:text-xl font-semibold w-10 sm:w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button size="lg" className="flex-1 w-full sm:w-auto p-3" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Adicionar ao Carrinho</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading || favoritesLoading}
                className={cn(
                  "w-full sm:w-auto",
                  isFavorite && "border-sale text-sale hover:text-sale"
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5",
                    isFavorite && "fill-current",
                    (isFavoriteLoading || favoritesLoading) && "animate-pulse"
                  )}
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
        <div className="mb-8 sm:mb-12 md:mb-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 overflow-x-auto">
              <TabsTrigger
                value="reviews"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Avaliações
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  {totalReviews}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Descrição Detalhada
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
              >
                Especificações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4 sm:space-y-6 md:space-y-8 pt-4 sm:pt-6 md:pt-8">
              {/* Rating Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Average Rating */}
                <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-card text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2">
                    {averageRating.toFixed(1)}
                    <span className="text-2xl sm:text-3xl text-muted-foreground">/5</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6",
                          i < Math.floor(averageRating)
                            ? "fill-accent text-accent"
                            : i < averageRating
                            ? "fill-accent/50 text-accent"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Baseado em {totalReviews} avaliações
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-card">
                  <div className="space-y-2 sm:space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count =
                        ratingDistribution[
                          stars as keyof typeof ratingDistribution
                        ];
                      const percentage =
                        totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-medium w-12 sm:w-16 text-right">
                            {stars} Estrelas
                          </span>
                          <div className="flex-1 h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              {currentReviews.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Comentários dos Clientes
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {currentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-card rounded-lg p-4 sm:p-6 shadow-card border border-border"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-base sm:text-lg">
                            {review.user?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                                {review.user?.name || "Usuário Anônimo"}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-3 h-3 sm:w-4 sm:h-4",
                                        i < review.rating
                                          ? "fill-accent text-accent"
                                          : "text-muted"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(review.createdAt).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2 sm:mt-3">
                            {review.review}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-border">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Mostrando {startIndex + 1}-
                      {Math.min(endIndex, totalReviews)} de {totalReviews}{" "}
                      avaliações
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden xs:inline">Anterior</span>
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
                                className="w-8 h-8 sm:w-10 sm:h-9 text-xs sm:text-sm"
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
                                className="px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground"
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
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <span className="hidden xs:inline">Próxima</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="description" className="pt-4 sm:pt-6 md:pt-8">
              <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-card border border-border">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Sobre o Produto</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                  {product.description}
                </p>
                <Separator className="my-4 sm:my-6" />
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-base sm:text-lg">
                    Características Principais:
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>
                        Material de alta qualidade com tecnologia de ponta
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>Conforto excepcional para uso prolongado</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>
                        Design moderno e elegante que se adapta a qualquer
                        estilo
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="pt-4 sm:pt-6 md:pt-8">
              <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-card border border-border">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                  Especificações Técnicas
                </h3>
                <div className="grid gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row py-2 sm:py-3 border-b border-border">
                    <span className="font-medium w-full sm:w-48 text-sm sm:text-base mb-1 sm:mb-0">Categoria:</span>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 sm:py-3 border-b border-border">
                    <span className="font-medium w-full sm:w-48 text-sm sm:text-base mb-1 sm:mb-0">Gênero:</span>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {product.gender}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 sm:py-3 border-b border-border">
                    <span className="font-medium w-full sm:w-48 text-sm sm:text-base mb-1 sm:mb-0">Cores disponíveis:</span>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {availableColors.length} opções
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 sm:py-3 border-b border-border">
                    <span className="font-medium w-full sm:w-48 text-sm sm:text-base mb-1 sm:mb-0">Avaliação:</span>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {averageRating.toFixed(1)}/5.0 estrelas
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row py-2 sm:py-3">
                    <span className="font-medium w-full sm:w-48 text-sm sm:text-base mb-1 sm:mb-0">SKU:</span>
                    <span className="text-sm sm:text-base text-muted-foreground">
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
          <div className="mt-8 sm:mt-12 md:mt-16 pt-8 sm:pt-12 md:pt-16 border-t border-border">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-foreground">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
