import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks"; // hooks tipados
import { loginUser, signupUser } from "../features/user/userActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Logo from "@/components/Logo";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

const signupSchema = z
  .object({
    email: z.string().trim().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      loginSchema.parse({ email, password });
      setIsLoading(true);

      await dispatch(loginUser({ email, password })).unwrap();

      toast({
        title: "Login realizado com sucesso",
        variant: "default",
      });

      setIsLoading(false);
      navigate("/");
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        // Trata erro como um objeto com possível message
        const errorObj = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        let description = "Ocorreu um erro";

        if (typeof error === "string") {
          description = error;
        } else if (errorObj?.response?.data?.message) {
          description = errorObj.response.data.message;
        } else if (errorObj?.message) {
          description = errorObj.message;
        }

        toast({
          title: "Erro no login",
          description,
          variant: "destructive",
        });
      }
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
      signupSchema.parse({ email, password, confirmPassword });
      setIsLoading(true);

      await dispatch(
        signupUser({ name, email, password, passwordConfirm: confirmPassword })
      ).unwrap();

      toast({
        title: "Cadastro realizado com sucesso",
        variant: "default",
      });

      setIsLoading(false);
      navigate("/");
    } catch (error: unknown) {
      setIsLoading(false);
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        // Trata erro como um objeto com possível message
        const errorObj = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        let description = "Ocorreu um erro ao cadastrar";

        if (typeof error === "string") {
          description = error;
        } else if (errorObj?.response?.data?.message) {
          description = errorObj.response.data.message;
        } else if (errorObj?.message) {
          description = errorObj.message;
        }

        toast({
          title: "Erro no cadastro",
          description,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <Logo />
          <CardDescription className="text-center">
            Entre na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Informe o seu nome"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        {/* <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => navigate("/")}
          >
            Voltar para a loja
          </Button>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default Auth;
