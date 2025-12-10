import { Heart, ShoppingCart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../features/product/productTypes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn, productionUrl } from "@/lib/utils";
import { useCart, CartItem } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import {
  addToFavorites,
  removeFromFavorites,
} from "@/features/favorite/favoriteActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.favorites);
  const { user, requireAuth } = useRequireAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Faça login para favoritar",
        description: "Entre na sua conta para salvar produtos favoritos.",
        variant: "destructive",
      });
      return;
    }

    const productId = product.id ?? product._id;
    if (!productId) return;

    if (loading || isLoading) return;

    setIsLoading(true);

    try {
      // SEMPRE tenta adicionar - o backend vai validar se já existe
      await dispatch(addToFavorites({ productId })).unwrap();
      toast({
        title: "Adicionado aos favoritos!",
        description: `${product.name} foi adicionado.`,
      });
    } catch (error: any) {
      // Se o erro for que o produto JÁ ESTÁ nos favoritos, então remove
      if (
        error?.includes("já está nos favoritos") ||
        error?.includes("já existe")
      ) {
        try {
          await dispatch(removeFromFavorites({ productId })).unwrap();
          toast({
            title: "Removido dos favoritos",
            description: `${product.name} foi removido.`,
          });
        } catch (removeError) {
          toast({
            title: "Erro",
            description: "Erro ao remover dos favoritos",
            variant: "destructive",
          });
        }
      } else {
        // Outros erros (auth, network, etc)
        toast({
          title: "Erro",
          description: error?.message || "Erro ao processar favorito",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  // Obter cores e tamanhos únicos das variantes
  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    if (product.variants) {
      product.variants.forEach((v) => v.color && colorsSet.add(v.color));
    }
    if (product.variations) {
      product.variations.forEach((v) => v.color && colorsSet.add(v.color));
    }
    if (product.colors) {
      product.colors.forEach((c) => colorsSet.add(c.color));
    }
    return Array.from(colorsSet);
  }, [product]);

  // Tamanhos disponíveis para TODAS as cores (fallback se não houver variantes)
  const allAvailableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    if (product.variants) {
      product.variants.forEach((v) => v.size && sizesSet.add(v.size));
    }
    if (product.variations) {
      product.variations.forEach((v) => v.size && sizesSet.add(v.size));
    }
    // Verificar também em product.colors
    if (product.colors) {
      product.colors.forEach((c) => {
        if (c.size) {
          sizesSet.add(c.size);
        }
      });
    }
    if (product.sizes) {
      product.sizes.forEach((s) => sizesSet.add(s));
    }
    return Array.from(sizesSet);
  }, [product]);

  // Verificar se o produto tem variantes (cores ou tamanhos)
  const hasVariants = useMemo(() => {
    const hasColors = availableColors.length > 0;
    const hasSizes = allAvailableSizes.length > 0;
    return hasColors || hasSizes;
  }, [availableColors, allAvailableSizes]);

  // Tamanhos disponíveis para a cor selecionada
  const availableSizes = useMemo(() => {
    // Se não há cor selecionada, retornar todos os tamanhos
    if (!selectedColor) {
      return allAvailableSizes;
    }

    // Filtrar tamanhos que existem para a cor selecionada
    const sizesSet = new Set<string>();
    
    // Verificar em variants/variations
    const variants = product.variants || product.variations || [];
    variants.forEach((v) => {
      if (v.color === selectedColor && v.size) {
        sizesSet.add(v.size);
      }
    });

    // Verificar em product.colors (estrutura onde cada item tem color e size)
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach((c) => {
        // Verificar se o objeto tem a propriedade color e size
        if (c.color === selectedColor && c.size) {
          sizesSet.add(c.size);
        }
      });
    }

    // Se não encontrou tamanhos nas variantes/colors mas há sizes no produto, usar eles
    if (sizesSet.size === 0 && product.sizes) {
      product.sizes.forEach((s) => sizesSet.add(s));
    }

    return Array.from(sizesSet);
  }, [selectedColor, product, allAvailableSizes]);

  // Resetar tamanho quando a cor mudar e o tamanho atual não estiver disponível para a nova cor
  useEffect(() => {
    if (selectedColor && selectedSize) {
      let sizeAvailableForColor = false;
      
      // Verificar em variants/variations
      const variants = product.variants || product.variations || [];
      sizeAvailableForColor = variants.some(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      
      // Se não encontrou, verificar em product.colors
      if (!sizeAvailableForColor && product.colors) {
        sizeAvailableForColor = product.colors.some(
          (c) => c.color === selectedColor && c.size === selectedSize
        );
      }
      
      if (!sizeAvailableForColor) {
        setSelectedSize("");
      }
    }
  }, [selectedColor, selectedSize, product]);

  // Obter preço e imagem da variante selecionada
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    
    // Primeiro tentar em variants/variations
    const variants = product.variants || product.variations || [];
    let variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
    
    // Se não encontrou, tentar em product.colors
    if (!variant && product.colors) {
      const colorVariant = product.colors.find(
        (c) => c.color === selectedColor && c.size === selectedSize
      );
      // Se encontrou em colors, criar um objeto compatível
      if (colorVariant) {
        variant = {
          color: colorVariant.color,
          size: colorVariant.size,
          price: product.priceDiscount || product.price,
          image: product.imageCover,
        } as any;
      }
    }
    
    return variant;
  }, [selectedColor, selectedSize, product]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      // Se o produto tem variantes, abrir modal de seleção
      if (hasVariants) {
        setIsVariantDialogOpen(true);
        return;
      }

      // Se não tem variantes, adicionar diretamente
      const productId = product.id || product._id;
      if (!productId) return;
      
      addItem({
        id: productId,
        name: product.name,
        price: product.priceDiscount || product.price,
        image: product.imageCover,
      });
      toast({
        title: "Adicionado ao carrinho!",
        description: `${product.name} foi adicionado ao carrinho.`,
      });
    });
  };

  const handleConfirmAddToCart = () => {
    if (hasVariants) {
      // Validar se cor foi selecionada (se houver cores disponíveis)
      if (availableColors.length > 0 && !selectedColor) {
        toast({
          title: "Selecione uma cor",
          description: "Por favor, escolha uma cor antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }
      // Validar se tamanho foi selecionado (se houver tamanhos disponíveis)
      // Se há cor selecionada, validar tamanho apenas se houver tamanhos para essa cor
      if (selectedColor && availableSizes.length > 0 && !selectedSize) {
        toast({
          title: "Selecione um tamanho",
          description: "Por favor, escolha um tamanho antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }
      // Se não há cor mas há tamanhos disponíveis, validar tamanho
      if (!selectedColor && allAvailableSizes.length > 0 && !selectedSize) {
        toast({
          title: "Selecione um tamanho",
          description: "Por favor, escolha um tamanho antes de adicionar ao carrinho.",
          variant: "destructive",
        });
        return;
      }
    }

    // Usar preço e imagem da variante se disponível, senão usar do produto
    const price = selectedVariant?.price || product.priceDiscount || product.price;
    const image = selectedVariant?.image || product.imageCover;
    const productId = product.id || product._id;
    
    if (!productId) return;

    addItem({
      id: productId,
      name: product.name,
      price: price,
      image: image,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });

    // Limpar seleções e fechar modal
    setIsVariantDialogOpen(false);
    setSelectedColor("");
    setSelectedSize("");
  };

  const uniqueColors = useMemo(() => {
    if (!product.colors) return [];

    const colorValues = product.colors.map((colorObj) => colorObj.color);
    return [...new Set(colorValues)];
  }, [product.colors]);

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[3/3] overflow-hidden bg-muted">
        <img
          src={
            product.imageCover ||
            "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.priceDiscount &&
          product.price > 0 &&
          product.priceDiscount < product.price && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold">
              -{Math.round((1 - product.priceDiscount / product.price) * 100)}%
            </Badge>
          )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={loading || isLoading}
          className={cn(
            "absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-sale"
          )}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all",
              (loading || isLoading) && "animate-pulse"
            )}
          />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div onClick={handleCardClick} className="p-4">
        <h3 className="font-medium text-card-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {product.priceDiscount ? (
            <>
              <span className="text-lg font-bold text-card-foreground">
                {product.priceDiscount.toFixed(2)} MZN
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {product.price.toFixed(2)} MZN
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-card-foreground">
              {product.price.toFixed(2)} MZN
            </span>
          )}
        </div>

        {/* Colors and Add to Cart */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {uniqueColors.slice(0, 3).map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="w-5 h-5 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
            {uniqueColors.length > 3 && (
              <div
                className="w-5 h-5 rounded-full border-2 border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                +{uniqueColors.length - 3}
              </div>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAddToCart}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal de Seleção de Variantes */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header Fixo */}
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              {hasVariants
                ? availableColors.length > 0 && allAvailableSizes.length > 0
                  ? "Selecione a cor e o tamanho desejados"
                  : availableColors.length > 0
                  ? "Selecione a cor desejada"
                  : "Selecione o tamanho desejado"
                : "Confirme os detalhes do produto"}
            </DialogDescription>
          </DialogHeader>

          {/* Conteúdo com Scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-6">
              {/* Seleção de Cor */}
              {availableColors.length > 0 && (
                <div className="space-y-3">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          // Resetar tamanho quando mudar a cor, pois os tamanhos podem ser diferentes
                          setSelectedSize("");
                        }}
                        className={cn(
                          "w-12 h-12 rounded-full border-2 transition-all",
                          selectedColor === color
                            ? "border-primary scale-110 ring-2 ring-primary ring-offset-2"
                            : "border-border hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Seleção de Tamanho - Só mostra se houver tamanhos disponíveis */}
              {allAvailableSizes.length > 0 && (
                <>
                  {availableSizes.length > 0 ? (
                    <div className="space-y-3">
                      <Label>
                        Tamanho
                        {selectedColor && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (disponíveis para esta cor)
                          </span>
                        )}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "px-4 py-2 rounded-md border-2 transition-all text-sm font-medium",
                              selectedSize === size
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : selectedColor ? (
                    <div className="space-y-3">
                      <Label>Tamanho</Label>
                      <p className="text-sm text-muted-foreground">
                        Nenhum tamanho disponível para esta cor.
                      </p>
                    </div>
                  ) : null}
                </>
              )}

              {/* Preview do Preço */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-lg font-bold">
                    {(selectedVariant?.price || product.priceDiscount || product.price).toFixed(2)} MZN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Fixo */}
          <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsVariantDialogOpen(false);
                setSelectedColor("");
                setSelectedSize("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmAddToCart}>
              Adicionar ao Carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
