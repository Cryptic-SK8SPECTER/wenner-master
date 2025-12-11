import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Header from "./Header";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Log to error reporting service in production
    // Example: logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Reload the page to reset the application state
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-2xl mx-auto">
              <Card className="border-destructive/50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">
                    Oops! Algo deu errado
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base mt-2">
                    Ocorreu um erro inesperado. Por favor, tente novamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {process.env.NODE_ENV === "development" && this.state.error && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs sm:text-sm font-mono text-destructive break-all">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <details className="mt-2">
                          <summary className="text-xs sm:text-sm cursor-pointer text-muted-foreground">
                            Detalhes do erro
                          </summary>
                          <pre className="mt-2 text-xs overflow-auto max-h-48 p-2 bg-background rounded border">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={this.handleReset}
                      variant="default"
                      className="gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Voltar para Home
                    </Button>
                    <Button
                      onClick={this.handleReload}
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Recarregar Página
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

