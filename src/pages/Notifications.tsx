import Header from "../components/Header";
import { Package, Tag, Box, Star, Bell, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getAllNotifications, updateNotification } from "@/features/notification/notificationActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useNavigate } from "react-router-dom";

// Função para obter ícone baseado no tipo de notificação
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "Pedido":
      return Package;
    case "Entregue":
      return Package;
    case "Avaliação":
      return Star;
    case "Promoção":
      return Tag;
    case "Reserva":
      return Box;
    case "Sistema":
      return Bell;
    default:
      return Bell;
  }
};

// Função para obter estilos do ícone baseado no tipo
const getNotificationIconStyles = (type: string) => {
  switch (type) {
    case "Pedido":
      return {
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
      };
    case "Entregue":
      return {
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500",
      };
    case "Avaliação":
      return {
        iconBg: "bg-yellow-500/10",
        iconColor: "text-yellow-500",
      };
    case "Promoção":
      return {
        iconBg: "bg-green-500/10",
        iconColor: "text-green-500",
      };
    case "Reserva":
      return {
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-500",
      };
    case "Sistema":
      return {
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
      };
    default:
      return {
        iconBg: "bg-gray-500/10",
        iconColor: "text-gray-500",
      };
  }
};

// Função para formatar data relativa
const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

const Notifications = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, loading } = useAppSelector(
    (state) => state.notification
  );
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Buscar todas as notificações quando a página for aberta
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(getAllNotifications());
    }
  }, [isAuthenticated, user?._id, dispatch]);

  // Filtrar notificações do usuário logado
  const userNotifications = useMemo(() => {
    if (!user?._id) return [];
    return notifications.filter((notification) => {
      // O campo user pode ser string (ObjectId) ou objeto populado
      const notificationUserId = typeof notification.user === "string" 
        ? notification.user 
        : (notification.user as any)?._id || notification.user;
      return notificationUserId === user._id;
    });
  }, [notifications, user?._id]);

  // Ordenar notificações: não lidas primeiro, depois por data (mais recentes primeiro)
  const sortedNotifications = useMemo(() => {
    return [...userNotifications].sort((a, b) => {
      // Primeiro ordena por não lidas
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      // Depois ordena por data (mais recentes primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [userNotifications]);

  // Calcular paginação
  const totalPages = Math.ceil(sortedNotifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNotifications = sortedNotifications.slice(startIndex, endIndex);

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = userNotifications.filter((n) => !n.isRead);
    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          dispatch(
            updateNotification({
              id: notification._id,
              data: { isRead: true, readAt: new Date().toISOString() },
            })
          ).unwrap()
        )
      );
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await dispatch(
        updateNotification({
          id: notificationId,
          data: { isRead: true, readAt: new Date().toISOString() },
        })
      ).unwrap();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Função para lidar com clique em notificação
  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida se não estiver lida
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Se for notificação de pedido entregue ou avaliação, navegar para página de avaliações
    if (notification.order) {
      // Verificar se é notificação de entrega ou avaliação
      const isDeliveryNotification = 
        notification.type === "Entregue" ||
        notification.type === "Avaliação" ||
        (notification.type === "Pedido" && 
         (notification.title.toLowerCase().includes("entregue") ||
          notification.title.toLowerCase().includes("avalie") ||
          notification.message.toLowerCase().includes("avaliar")));

      if (isDeliveryNotification) {
        // Navegar para a página de avaliações com o orderId
        navigate(`/avaliacoes?orderId=${notification.order}`);
        return;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Notificações
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
              >
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Marcar todas</span>
              </Button>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Carregando notificações...
                </p>
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              paginatedNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconStyles = getNotificationIconStyles(notification.type);
                const isUnread = !notification.isRead;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-200 hover:bg-muted/50 active:bg-muted/70 ${
                      isUnread ? "bg-primary/[0.02]" : ""
                    } ${
                      index !== paginatedNotifications.length - 1
                        ? "border-b border-border/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${iconStyles.iconBg} flex items-center justify-center`}
                    >
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${iconStyles.iconColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                        <span
                          className={`text-sm sm:text-base font-semibold break-words ${
                            isUnread
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          {isUnread && (
                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-pulse"></span>
                          )}
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed break-words ${
                          isUnread
                            ? "text-muted-foreground"
                            : "text-muted-foreground/70"
                        }`}
                      >
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6 flex justify-center">
              <Pagination>
                <PaginationContent className="flex-wrap gap-1 sm:gap-0">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={`text-xs sm:text-sm ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>

                  {/* Primeira página */}
                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(1)}
                          className="cursor-pointer text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-8 w-8 sm:h-10 sm:w-10" />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Páginas ao redor da atual */}
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis className="h-8 w-8 sm:h-10 sm:w-10" />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  {/* Última página */}
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis className="h-8 w-8 sm:h-10 sm:w-10" />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={`text-xs sm:text-sm ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Informação de paginação */}
          {sortedNotifications.length > 0 && (
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground px-2">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, sortedNotifications.length)} de{" "}
              {sortedNotifications.length} notificações
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
