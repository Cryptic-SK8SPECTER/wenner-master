import { useState, useMemo, useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createOrder } from "@/features/order/orderActions";
import { useToast } from "@/hooks/use-toast";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet = ({ open, onOpenChange }: CartSheetProps) => {
  // Redux hooks
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.order);
  const { toast } = useToast();

  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCart();

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar.",
      });
      return;
    }

    // Reconhecer priceDiscount: se o preço do item for menor que o preço original,
    // significa que há desconto aplicado. O priceDiscount é o preço final após desconto.
    const payload = {
      products: items.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        price: item.price, // Este é o priceDiscount (preço com desconto já aplicado)
        color: item.color,
        size: item.size,
      })),
      discount: 0, // Desconto adicional (cupom) se houver
      paymentMethod: "cartao",
      totalPrice: totalPrice,
      notes: "",
    };

    try {
      const resultAction = await dispatch(createOrder(payload as any));
      // handle both fulfilled and rejected shapes
      // RTK returns an action; check for `payload` and `error`
      if (createOrder.fulfilled.match(resultAction)) {
        toast({
          title: "Pedido realizado",
          description: "Seu pedido foi criado com sucesso.",
        });
        clearCart();
        onOpenChange(false);
      } else {
        const apiPayload: any = (resultAction as any).payload;
        const msg =
          apiPayload?.message ||
          (resultAction as any).error?.message ||
          "Erro ao criar pedido";
        toast({ title: "Erro", description: msg });
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Erro ao criar pedido",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-6 h-[calc(100vh-250px)]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-4 py-4 border-b border-border"
                  >
                    <img
                      src={
                        item.image ||
                        "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg"
                      }
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {/* Adicionando cor e tamanho */}
                          <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                            {item.color && (
                              <span className="flex items-center gap-1">
                                Cor:
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: item.color }}
                                />
                              </span>
                            )}
                            |{item.size && <span>Tamanho: {item.size}</span>}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        {item.price.toFixed(2)} MZN
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} MZN</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processando..." : "Finalizar Compra"}
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
