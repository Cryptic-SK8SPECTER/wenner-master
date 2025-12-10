import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: "admin" | "client" | "manager";
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
    } else if (requiredRole && user?.role !== requiredRole) {
      toast({
        title: "Acesso negado",
        description: `Você não tem permissão para acessar esta página. Apenas usuários com role "${requiredRole}" podem acessar.`,
        variant: "destructive",
      });
    }
  }, [isAuthenticated, user?.role, requiredRole, toast]);

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Se tiver role requerido e o usuário não tiver esse role, redirecionar
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

