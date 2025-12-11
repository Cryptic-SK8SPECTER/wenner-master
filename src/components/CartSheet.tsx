import React from "react";
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
import { createNotification } from "@/features/notification/notificationActions";
import { useToast } from "@/hooks/use-toast";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet = ({ open, onOpenChange }: CartSheetProps) => {
  // Redux hooks
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.user);
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
        const order = resultAction.payload;
        const orderId = order?._id || order?.id;

        // Criar notificação após pedido criado com sucesso
        if (user?._id && orderId) {
          try {
            await dispatch(
              createNotification({
                title: "Pedido Realizado",
                message: `Seu pedido #${orderId.slice(-6)} foi criado com sucesso. Total: ${totalPrice.toFixed(2)} MZN`,
                type: "Pedido",
                user: user._id,
                order: orderId,
              })
            ).unwrap();
          } catch (notificationError) {
            // Não bloquear o fluxo se a notificação falhar
            console.error("Erro ao criar notificação:", notificationError);
          }
        }

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
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <SheetTitle className="text-lg sm:text-xl">Carrinho de Compras</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground px-4">
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 sm:px-6 -mx-4 sm:-mx-6">
              <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 sm:gap-4 py-3 sm:py-4 border-b border-border"
                  >
                    <img
                      src={
                        item.image ||
                        "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg"
                      }
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                          {/* Adicionando cor e tamanho - Só mostra se houver */}
                          {(item.color || item.size) && (
                            <div className="flex gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                              {item.color && (
                                <span className="flex items-center gap-1">
                                  Cor:
                                  <div
                                    className="w-3 h-3 rounded-full border flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </span>
                              )}
                              {item.color && item.size && <span>|</span>}
                              {item.size && <span>Tamanho: {item.size}</span>}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                          onClick={() => removeItem(item.key)}
                        >
                          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <p className="text-sm sm:text-base font-semibold">
                        {item.price.toFixed(2)} MZN
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-6 border-t border-border bg-background">
              <div className="flex justify-between text-base sm:text-lg font-semibold">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} MZN</span>
              </div>
              <Button
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processando..." : "Finalizar Compra"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 sm:h-11 text-sm sm:text-base" 
                onClick={clearCart}
              >
                Limpar Carrinho
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
