import Header from "../components/Header";
import { Package, Tag, Box, Star, Bell, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const initialNotifications = [
  {
    id: 1,
    title: "Pedido enviado",
    message:
      "Seu pedido #1234 foi enviado e está a caminho. Acompanhe o rastreamento pelo código BR123456789.",
    time: "Há 5 min",
    unread: true,
    icon: Package,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    title: "Promoção especial",
    message:
      "50% de desconto em tênis selecionados! Aproveite essa oferta por tempo limitado.",
    time: "Há 1 hora",
    unread: true,
    icon: Tag,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    id: 3,
    title: "Produto disponível",
    message:
      "O item da sua lista de desejos voltou ao estoque. Garanta o seu antes que acabe!",
    time: "Há 2 horas",
    unread: false,
    icon: Box,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    id: 4,
    title: "Avaliação pendente",
    message:
      "Avalie sua última compra e ganhe 50 pontos no programa de fidelidade.",
    time: "Ontem",
    unread: false,
    icon: Star,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    id: 5,
    title: "Pedido entregue",
    message: "Seu pedido #1198 foi entregue com sucesso. Esperamos que goste!",
    time: "2 dias atrás",
    unread: false,
    icon: Package,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 6,
    title: "Cupom de desconto",
    message:
      "Você ganhou um cupom de 15% de desconto! Use o código WENNER15 na sua próxima compra.",
    time: "3 dias atrás",
    unread: false,
    icon: Tag,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Notificações
                </h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {notifications.map((notification, index) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`flex items-start gap-4 p-5 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                    notification.unread ? "bg-primary/[0.02]" : ""
                  } ${
                    index !== notifications.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full ${notification.iconBg} flex items-center justify-center`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${notification.iconColor}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`font-semibold ${
                          notification.unread
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.unread && (
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        notification.unread
                          ? "text-muted-foreground"
                          : "text-muted-foreground/70"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
