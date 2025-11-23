import { Heart, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../features/product/productTypes";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

   const uniqueColors = useMemo(() => {
     if (!product.colors) return [];

     const colorValues = product.colors.map((colorObj) => colorObj.color);
     // Remover cores duplicadas
     return [...new Set(colorValues)];
   }, [product.colors]);

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
    >
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
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
            isFavorite
              ? "bg-sale text-sale-foreground"
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-sale"
          )}
        >
          <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-4">
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
                key={`${color}-${index}`} // Chave única baseada na cor e índice
                className="w-5 h-5 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {uniqueColors.length > 3 && (
              <div className="w-5 h-5 rounded-full border-2 border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                +{uniqueColors.length - 3}
              </div>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
