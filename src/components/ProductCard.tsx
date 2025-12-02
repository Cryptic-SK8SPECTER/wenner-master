import { Heart, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../features/product/productTypes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn, productionUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addToFavorites,
  removeFromFavorites,
} from "@/features/favorite/favoriteActions";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.favorites);
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      if (error?.includes("já está nos favoritos") || error?.includes("já existe")) {
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageCover,
    });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
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
    </div>
  );
};