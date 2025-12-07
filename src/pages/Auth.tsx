import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../app/hooks"; // hooks tipados
import {
  loginUser,
  signupUser,
  forgotPassword,
  resetPassword,
} from "../features/user/userActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, User } from "lucide-react";
import InputField from "@/components/ui/input-field";
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

const resetPasswordSchema = z
  .object({
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">(
    "login"
  );
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Extract token from URL on mount
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setActiveTab("reset");
      setShowResetPassword(true);
    }
  }, [searchParams]);

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

  const handleResetSubmit = async (email: string) => {
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error || "Erro ao enviar recuperação",
        variant: "destructive",
      });
    }
  };

  const handleResetPasswordSubmit = async (
    password: string,
    confirmPassword: string
  ) => {
    try {
      resetPasswordSchema.parse({ password, confirmPassword });

      if (!resetToken) {
        toast({
          title: "Erro",
          description:
            "Token de recuperação não encontrado. Solicite um novo email.",
          variant: "destructive",
        });
        return;
      }

      setLoadingReset(true);
      await dispatch(
        resetPassword({
          token: resetToken,
          payload: {
            password,
            passwordConfirm: confirmPassword,
          },
        })
      ).unwrap();
      setLoadingReset(false);

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso.",
      });
      setShowResetPassword(false);
      setResetToken(null);
      setActiveTab("login");
      navigate("/auth");
    } catch (error: any) {
      setLoadingReset(false);
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: error || "Erro ao redefinir senha",
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
            {activeTab === "reset"
              ? "Recupere o acesso à sua conta"
              : "Entre na sua conta ou crie uma nova"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  label="Email"
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Informe o seu email"
                  required
                  disabled={isLoading}
                  icon={Mail}
                  iconPosition="right"
                />

                <InputField
                  label="Senha"
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  icon={Lock}
                  iconPosition="right"
                />
                <div className="flex justify-end  text-sm ">
                  <Button
                    onClick={() => setActiveTab("reset")}
                    className="font-medium hover:bg-transparent hover:text-current "
                    variant="ghost"
                  >
                    Esquece a senha?
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <InputField
                  label="Nome"
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Informe o seu nome"
                  required
                  disabled={isLoading}
                  icon={User}
                  iconPosition="right"
                />

                <InputField
                  label="Email"
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="Informe o seu email"
                  required
                  disabled={isLoading}
                  icon={Mail}
                  iconPosition="right"
                />

                <InputField
                  label="Senha"
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  icon={Lock}
                  iconPosition="right"
                />

                <InputField
                  label="Confirmar Senha"
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  icon={Lock}
                  iconPosition="right"
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>

            {/* Reset password tab */}
            <TabsContent value="reset">
              {!showResetPassword ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(
                      e.currentTarget as HTMLFormElement
                    );
                    const email = (formData.get("email") as string) || "";
                    setLoadingReset(true);
                    await handleResetSubmit(email);
                    setLoadingReset(false);
                  }}
                  className="space-y-4"
                >
                  <InputField
                    label="Email"
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="Informe o seu email"
                    required
                    disabled={loadingReset}
                    icon={Mail}
                    iconPosition="right"
                  />

                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      className="font-medium hover:bg-transparent hover:text-current"
                      onClick={() => setActiveTab("login")}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="ml-auto"
                      disabled={loadingReset}
                    >
                      {loadingReset ? "Enviando..." : "Enviar recuperação"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(
                      e.currentTarget as HTMLFormElement
                    );
                    const password = (formData.get("password") as string) || "";
                    const confirmPassword =
                      (formData.get("confirmPassword") as string) || "";
                    setLoadingReset(true);
                    await handleResetPasswordSubmit(password, confirmPassword);
                    setLoadingReset(false);
                  }}
                  className="space-y-4"
                >
                  <InputField
                    label="Nova Senha"
                    id="reset-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loadingReset}
                    icon={Lock}
                    iconPosition="right"
                  />

                  <InputField
                    label="Confirmar Senha"
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loadingReset}
                    icon={Lock}
                    iconPosition="right"
                  />

                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      className="font-medium hover:bg-transparent hover:text-current"
                      onClick={() => {
                        setShowResetPassword(false);
                        setActiveTab("login");
                      }}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="ml-auto"
                      disabled={loadingReset}
                    >
                      {loadingReset ? "Atualizando..." : "Redefinir Senha"}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
