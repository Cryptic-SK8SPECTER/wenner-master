import { useAppSelector } from "../../app/hooks";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useRequireAuth = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const { toast } = useToast();
  const navigate = useNavigate();

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast({
        title: "É necessário estar logado",
        description: "Faça login para executar esta ação.",
        variant: "destructive",
      });
      navigate("/auth"); 
      return;
    }
    action();
  };

  return { user, isAuthenticated, requireAuth };
};
