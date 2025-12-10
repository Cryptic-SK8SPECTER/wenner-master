import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, CheckCircle2, ArrowLeft, Filter, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getAllReviews, createReview } from "@/features/reviews/reviewActions";
import { fetchProductBySlug } from "@/features/product/productActions";
import { fetchOrderById, fetchOrders } from "@/features/order/orderActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useToast } from "@/hooks/use-toast";

// Função para formatar data relativa
const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return "Data inválida";
  }
};

const AllReviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const productId = searchParams.get("productId");
  const productSlug = searchParams.get("slug");
  const orderId = searchParams.get("orderId");
  
  // DEBUG: Log dos parâmetros da URL
  console.log("🔍 [AllReviews] Parâmetros da URL:", {
    productId,
    productSlug,
    orderId,
    allParams: Object.fromEntries(searchParams.entries()),
  });
  
  const { reviews, loading } = useAppSelector((state) => state.review);
  const { currentProduct } = useAppSelector((state) => state.product);
  const { currentOrder, orders } = useAppSelector((state) => state.order);
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  
  // DEBUG: Log do estado inicial
  console.log("🔍 [AllReviews] Estado inicial:", {
    isAuthenticated,
    userId: user?._id,
    hasCurrentProduct: !!currentProduct,
    currentProductId: currentProduct?._id,
    hasCurrentOrder: !!currentOrder,
    currentOrderId: currentOrder?._id,
    ordersCount: orders.length,
    reviewsCount: reviews.length,
    loading,
  });
  
  const [filter, setFilter] = useState<"all" | number>("all");
  const [sort, setSort] = useState<"recent" | "helpful">("recent");
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();

  // Buscar pedidos do usuário para verificar se pode avaliar
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      console.log("🔍 [AllReviews] Buscando pedidos do usuário:", user._id);
      dispatch(fetchOrders(user._id));
    } else {
      console.log("⚠️ [AllReviews] Não autenticado ou sem userId, não buscando pedidos");
    }
  }, [isAuthenticated, user?._id, dispatch]);

  // Buscar pedido se tiver orderId
  useEffect(() => {
    if (orderId) {
      console.log("🔍 [AllReviews] Buscando pedido por orderId:", orderId);
      dispatch(fetchOrderById(orderId));
    } else {
      console.log("ℹ️ [AllReviews] Sem orderId na URL");
    }
  }, [orderId, dispatch]);

  // Normalizar currentOrder para lidar com estrutura aninhada (como no Admin.tsx)
  const actualOrder = useMemo(() => {
    if (!currentOrder) return null;
    
    // Se currentOrder tem uma propriedade 'data', usar ela (estrutura aninhada da API)
    const order = (currentOrder as any)?.data || currentOrder;
    
    console.log("🔍 [AllReviews] Normalizando currentOrder:", {
      hasData: !!(currentOrder as any)?.data,
      orderId: order._id || order.id,
      hasProducts: !!order.products,
      productsType: Array.isArray(order.products) ? "array" : typeof order.products,
      productsLength: Array.isArray(order.products) ? order.products.length : "N/A",
    });
    
    return order;
  }, [currentOrder]);

  // DEBUG: Monitorar mudanças no currentOrder
  useEffect(() => {
    if (currentOrder) {
      const order = actualOrder || currentOrder;
      console.log("🔍 [AllReviews] currentOrder atualizado:", {
        orderId: order._id || order.id,
        hasProducts: !!order.products,
        productsType: Array.isArray(order.products) ? "array" : typeof order.products,
        productsLength: Array.isArray(order.products) ? order.products.length : "N/A",
        productsStructure: order.products ? JSON.stringify(order.products, null, 2) : "null/undefined",
        fullOrderStructure: JSON.stringify(currentOrder, null, 2),
        normalizedOrderStructure: JSON.stringify(order, null, 2),
      });
      
      // Verificar estrutura de cada produto se existir
      if (Array.isArray(order.products) && order.products.length > 0) {
        console.log("🔍 [AllReviews] Estrutura do primeiro produto:", {
          firstProduct: order.products[0],
          firstProductKeys: Object.keys(order.products[0] || {}),
          firstProductProduct: order.products[0]?.product,
          firstProductProductType: typeof order.products[0]?.product,
          firstProductProductIsObject: typeof order.products[0]?.product === "object",
          firstProductProductId: (order.products[0]?.product as any)?._id,
        });
      }
    } else {
      console.log("ℹ️ [AllReviews] currentOrder ainda não disponível");
    }
  }, [currentOrder, actualOrder]);

  // Buscar produto se tiver slug
  useEffect(() => {
    if (productSlug) {
      console.log("🔍 [AllReviews] Buscando produto por slug:", productSlug);
      dispatch(fetchProductBySlug(productSlug));
    } else {
      console.log("ℹ️ [AllReviews] Sem productSlug na URL");
    }
  }, [productSlug, dispatch]);

  // Obter produtos únicos do pedido se tiver orderId
  const orderProducts = useMemo(() => {
    // Usar actualOrder (normalizado) em vez de currentOrder diretamente
    const order = actualOrder || currentOrder;
    
    console.log("🔍 [AllReviews] useMemo orderProducts executado:", {
      hasOrderId: !!orderId,
      orderId,
      hasCurrentOrder: !!currentOrder,
      hasActualOrder: !!actualOrder,
      currentOrderId: currentOrder?._id || currentOrder?.id,
      actualOrderId: order?._id || order?.id,
      hasProducts: !!order?.products,
      productsIsArray: Array.isArray(order?.products),
      productsLength: Array.isArray(order?.products) ? order?.products.length : "N/A",
      productsType: typeof order?.products,
    });
    
    if (!orderId) {
      console.log("❌ [AllReviews] Sem orderId, retornando array vazio");
      return [];
    }
    
    if (!order) {
      console.log("❌ [AllReviews] Sem order (actualOrder/currentOrder), retornando array vazio");
      return [];
    }
    
    if (!order.products) {
      console.log("❌ [AllReviews] order.products é null/undefined:", {
        orderKeys: Object.keys(order),
        orderStructure: JSON.stringify(order, null, 2),
      });
      return [];
    }
    
    if (!Array.isArray(order.products)) {
      console.log("❌ [AllReviews] order.products não é um array:", {
        type: typeof order.products,
        value: order.products,
      });
      return [];
    }
    
    if (order.products.length === 0) {
      console.log("⚠️ [AllReviews] order.products é um array vazio");
      return [];
    }
    
    console.log("✅ [AllReviews] Processando produtos do pedido:", {
      orderId,
      productsCount: order.products.length,
      products: order.products,
    });
    
    // Obter produtos únicos (por productId)
    const uniqueProducts = new Map<string, any>();
    order.products.forEach((orderProduct, index) => {
      console.log(`🔍 [AllReviews] Processando orderProduct[${index}]:`, {
        orderProduct,
        orderProductKeys: Object.keys(orderProduct || {}),
        hasProduct: !!orderProduct.product,
        productType: typeof orderProduct.product,
        productIsObject: typeof orderProduct.product === "object" && orderProduct.product !== null,
        productValue: orderProduct.product,
      });
      
      let productId: string | null = null;
      
      if (typeof orderProduct.product === "string") {
        productId = orderProduct.product;
        console.log(`✅ [AllReviews] orderProduct[${index}].product é string:`, productId);
      } else if (orderProduct.product && typeof orderProduct.product === "object") {
        productId = (orderProduct.product as any)?._id || (orderProduct.product as any)?.id || null;
        console.log(`✅ [AllReviews] orderProduct[${index}].product é objeto:`, {
          productId,
          productObject: orderProduct.product,
          productObjectKeys: Object.keys(orderProduct.product),
        });
      } else {
        console.log(`❌ [AllReviews] orderProduct[${index}].product tem tipo inválido:`, {
          type: typeof orderProduct.product,
          value: orderProduct.product,
        });
      }
      
      if (productId && !uniqueProducts.has(productId)) {
        const productData = {
          _id: productId,
          name: orderProduct.name || (orderProduct.product as any)?.name || "Produto",
          imageCover: orderProduct.imageCover || orderProduct.image || (orderProduct.product as any)?.imageCover || "",
          slug: (orderProduct.product as any)?.slug || "",
        };
        
        console.log(`✅ [AllReviews] Adicionando produto único:`, productData);
        uniqueProducts.set(productId, productData);
      } else if (!productId) {
        console.log(`⚠️ [AllReviews] orderProduct[${index}] não tem productId válido, pulando`);
      } else {
        console.log(`ℹ️ [AllReviews] orderProduct[${index}] já foi adicionado (duplicado)`);
      }
    });
    
    const uniqueProductsArray = Array.from(uniqueProducts.values());
    console.log("✅ [AllReviews] Produtos únicos extraídos:", {
      count: uniqueProductsArray.length,
      products: uniqueProductsArray,
    });
    
    return uniqueProductsArray;
  }, [orderId, currentOrder, actualOrder]);

  // Produto atual para avaliação (do pedido ou do productId)
  const currentProductForReview = useMemo(() => {
    console.log("🔍 [AllReviews] Determinando produto atual para avaliação:", {
      orderId,
      orderProductsCount: orderProducts.length,
      selectedProductIndex,
      hasCurrentProduct: !!currentProduct,
      currentProductId: currentProduct?._id,
      productId,
    });
    
    if (orderId && orderProducts.length > 0) {
      const selectedProduct = orderProducts[selectedProductIndex] || orderProducts[0];
      console.log("✅ [AllReviews] Produto selecionado do pedido:", selectedProduct);
      return selectedProduct;
    }
    if (currentProduct) {
      console.log("✅ [AllReviews] Usando currentProduct do Redux:", currentProduct);
      return currentProduct;
    }
    if (productId) {
      const fallbackProduct = {
        _id: productId,
        id: productId,
        name: "Produto",
        imageCover: "",
        slug: "",
      } as any;
      console.log("✅ [AllReviews] Usando productId como fallback:", fallbackProduct);
      return fallbackProduct;
    }
    console.log("⚠️ [AllReviews] Nenhum produto encontrado, retornando null");
    return null;
  }, [orderId, orderProducts, selectedProductIndex, currentProduct, productId]);

  const product = currentProductForReview;
  
  // DEBUG: Log do produto final
  useEffect(() => {
    console.log("🔍 [AllReviews] Produto final determinado:", {
      product,
      productId: product?._id,
      productName: product?.name,
      isValidObjectId: product?._id && product._id !== "1" && product._id.length > 10,
    });
  }, [product]);

  // Verificar se o usuário tem um pedido entregue com este produto
  const canReviewProduct = useMemo(() => {
    console.log("🔍 [AllReviews] Verificando se pode avaliar produto:", {
      isAuthenticated,
      userId: user?._id,
      productId: product?._id,
      ordersCount: orders.length,
    });
    
    if (!isAuthenticated || !user?._id || !product?._id) {
      console.log("❌ [AllReviews] Não pode avaliar - faltam dados básicos");
      return false;
    }
    
    // Verificar se há algum pedido entregue com este produto
    const hasDeliveredOrder = orders.some((order) => {
      // Normalizar order (pode ter estrutura aninhada)
      const normalizedOrder = (order as any)?.data || order;
      
      if (normalizedOrder.status !== "entregue") return false;
      
      // Verificar se o pedido pertence ao usuário
      const orderUserId = typeof normalizedOrder.user === "string" 
        ? normalizedOrder.user 
        : normalizedOrder.user?._id;
      if (orderUserId !== user._id) return false;
      
      // Verificar se o pedido contém o produto
      const orderProducts = normalizedOrder.products || [];
      const hasProduct = orderProducts.some((orderProduct: any) => {
        const orderProductId = typeof orderProduct.product === "string"
          ? orderProduct.product
          : (orderProduct.product as any)?._id || orderProduct.product;
        return orderProductId === product?._id;
      });
      
      if (hasProduct) {
        console.log("✅ [AllReviews] Pedido entregue encontrado com o produto:", {
          orderId: normalizedOrder._id || normalizedOrder.id,
          orderStatus: normalizedOrder.status,
          productId: product._id,
        });
      }
      
      return hasProduct;
    });
    
    console.log(hasDeliveredOrder 
      ? "✅ [AllReviews] Usuário PODE avaliar o produto" 
      : "❌ [AllReviews] Usuário NÃO PODE avaliar o produto"
    );
    
    return hasDeliveredOrder;
  }, [isAuthenticated, user?._id, product?._id, orders]);

  // Verificar se o usuário já avaliou este produto
  const hasUserReviewed = useMemo(() => {
    if (!isAuthenticated || !user?._id) {
      console.log("ℹ️ [AllReviews] Não autenticado, não verificando reviews existentes");
      return false;
    }
    
    const userHasReviewed = reviews.some((review) => {
      const reviewUserId = typeof review.user === "string"
        ? review.user
        : (review.user as any)?._id || review.user;
      const reviewProductId = typeof review.product === "string"
        ? review.product
        : (review.product as any)?._id || review.product;
      
      const matchesUser = reviewUserId === user._id;
      const matchesProduct = product?._id && reviewProductId === product._id;
      
      if (matchesUser && matchesProduct) {
        console.log("✅ [AllReviews] Usuário já avaliou este produto:", {
          reviewId: review._id,
          reviewRating: review.rating,
        });
      }
      
      return matchesUser && matchesProduct;
    });
    
    console.log(userHasReviewed 
      ? "✅ [AllReviews] Usuário JÁ AVALIOU este produto" 
      : "ℹ️ [AllReviews] Usuário ainda NÃO AVALIOU este produto"
    );
    
    return userHasReviewed;
  }, [isAuthenticated, user?._id, reviews, product?._id]);

  // Buscar reviews quando tiver productId ou quando o produto for carregado
  useEffect(() => {
    console.log("🔍 [AllReviews] Verificando se deve buscar reviews:", {
      isAuthenticated,
      hasProduct: !!product,
      productId: product?._id,
      productIdFromUrl: productId,
      selectedProductIndex,
    });
    
    if (isAuthenticated && product?._id) {
      // Verificar se o _id é um ObjectId válido (não pode ser "1" ou valores inválidos)
      const idToFetch = product._id;
      const isValidObjectId = idToFetch && idToFetch !== "1" && idToFetch.length > 10;
      
      console.log("🔍 [AllReviews] Validação do productId:", {
        idToFetch,
        isValidObjectId,
        length: idToFetch?.length,
        isNotOne: idToFetch !== "1",
      });
      
      if (isValidObjectId) {
        console.log("✅ [AllReviews] Buscando reviews para productId:", idToFetch);
        dispatch(getAllReviews(idToFetch));
      } else {
        console.log("❌ [AllReviews] productId inválido, não buscando reviews:", {
          idToFetch,
          reason: idToFetch === "1" ? "É '1'" : idToFetch?.length <= 10 ? "Muito curto" : "Vazio",
        });
      }
    } else if (isAuthenticated && productId && productId !== "1" && productId.length > 10) {
      console.log("✅ [AllReviews] Buscando reviews para productId da URL:", productId);
      dispatch(getAllReviews(productId));
    } else {
      console.log("⚠️ [AllReviews] Não buscando reviews:", {
        reason: !isAuthenticated ? "Não autenticado" : !product?._id && !productId ? "Sem productId" : "productId inválido",
      });
    }
  }, [isAuthenticated, productId, product?._id, selectedProductIndex, dispatch]);

  // Filtrar e ordenar reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews.filter((review) => {
      // Filtrar por produto
      if (product?._id) {
        let reviewProductId: string = "";
        if (typeof review.product === "string") {
          reviewProductId = review.product;
        } else if (review.product && typeof review.product === "object") {
          reviewProductId = (review.product as any)._id || "";
        }
        if (reviewProductId && reviewProductId !== product?._id) return false;
      }
      
      // Filtrar por rating
      if (filter !== "all" && review.rating !== filter) return false;
      
      return true;
    });

    // Ordenar
    if (sort === "recent") {
      filtered = filtered.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sort === "helpful") {
      // Como não temos campo helpful na API, ordenar por rating e data
      filtered = filtered.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return filtered;
  }, [reviews, filter, sort, productId, product?._id]);

  // Calcular média de ratings
  const averageRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((acc, r) => acc + r.rating, 0) / filteredReviews.length).toFixed(1)
    : "0.0";

  // Função para submeter avaliação
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para avaliar o produto.",
        variant: "destructive",
      });
      return;
    }

    if (!canReviewProduct) {
      toast({
        title: "Avaliação não permitida",
        description: "Você precisa ter comprado e recebido este produto para avaliá-lo.",
        variant: "destructive",
      });
      return;
    }

    if (hasUserReviewed) {
      toast({
        title: "Avaliação já realizada",
        description: "Você já avaliou este produto.",
        variant: "destructive",
      });
      return;
    }

    if (reviewRating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Comentário necessário",
        description: "Por favor, escreva um comentário sobre o produto.",
        variant: "destructive",
      });
      return;
    }

    if (!product?._id) {
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await dispatch(
        createReview({
          product: product._id,
          rating: reviewRating,
          review: reviewText.trim(),
        })
      ).unwrap();

      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi publicada com sucesso.",
      });

      // Limpar formulário
      setReviewRating(0);
      setReviewText("");
      setShowReviewForm(false);

      // Recarregar avaliações
      if (product._id && product._id !== "1" && product._id.length > 10) {
        dispatch(getAllReviews(product._id));
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error || "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Se não houver produto, mostrar mensagem
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2 hover:bg-transparent hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Produto não encontrado.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Se tiver orderId, mostrar seletor de produtos do pedido */}
        {orderId && orderProducts.length > 1 && (
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Produtos do pedido:
                </span>
                {orderProducts.map((prod, idx) => (
                  <Button
                    key={prod._id}
                    variant={selectedProductIndex === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProductIndex(idx)}
                    className="whitespace-nowrap"
                  >
                    {prod.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Info */}
        <Card className="border-0 shadow-lg mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={product.imageCover || product.image || "https://i.pinimg.com/1200x/a7/2f/db/a72fdbea7e86c3fb70a17c166a36407b.jpg"}
                alt={product.name || "Produto"}
                className="w-20 h-20 object-cover rounded-xl shadow-md"
              />
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground mb-1">
                  {product.name || "Produto"}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(Number(averageRating))
                          ? ""
                          : "text-muted-foreground/20"
                      }`}
                      style={star <= Math.round(Number(averageRating)) ? { fill: "#0DA2E7", color: "#0DA2E7" } : undefined}
                    />
                  ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating} ({filteredReviews.length} avaliações)
                  </span>
                </div>
              </div>
              {canReviewProduct && !hasUserReviewed ? (
                <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Cancelar Avaliação" : "Avaliar Produto"}
                </Button>
              ) : hasUserReviewed ? (
                <Button variant="outline" disabled>
                  Você já avaliou este produto
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Compre e receba o produto para avaliar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Summary */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground">{averageRating}</div>
                <div className="flex gap-0.5 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5"
                      style={
                        star <= Math.round(Number(averageRating))
                          ? { fill: "#0DA2E7", color: "#0DA2E7" }
                          : { fill: "rgba(13, 162, 231, 0.3)", color: "rgba(13, 162, 231, 0.3)" }
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredReviews.length} avaliações
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = filteredReviews.filter((r) => r.rating === stars).length;
                  const percentage = filteredReviews.length > 0 ? (count / filteredReviews.length) * 100 : 0;
                  return (
                    <button
                      key={stars}
                      onClick={() => setFilter(filter === stars ? "all" : stars)}
                      className={`flex items-center gap-3 w-full group transition-colors rounded-lg p-1 -m-1 ${
                        filter === stars ? "" : "hover:bg-muted/50"
                      }`}
                      style={filter === stars ? { backgroundColor: "rgba(13, 162, 231, 0.1)" } : undefined}
                    >
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium text-foreground">{stars}</span>
                        <Star className="h-3.5 w-3.5" style={{ fill: "#0DA2E7", color: "#0DA2E7" }} />
                      </div>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: "#0DA2E7" }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Avaliação */}
        {showReviewForm && canReviewProduct && !hasUserReviewed && (
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Avaliar Produto</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label className="mb-2 block">Sua avaliação (1-5 estrelas)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= reviewRating
                              ? ""
                              : "text-muted-foreground/30"
                          }`}
                          style={star <= reviewRating ? { fill: "#0DA2E7", color: "#0DA2E7" } : undefined}
                        />
                      </button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {reviewRating} {reviewRating === 1 ? "estrela" : "estrelas"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="review-text" className="mb-2 block">
                    Seu comentário
                  </Label>
                  <Textarea
                    id="review-text"
                    placeholder="Compartilhe sua experiência com este produto..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingReview || reviewRating === 0 || !reviewText.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingReview ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewRating(0);
                      setReviewText("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filter === "all" 
                ? `Mostrando todas as ${filteredReviews.length} avaliações`
                : `Mostrando ${filteredReviews.length} avaliações com ${filter} estrelas`
              }
            </span>
            {filter !== "all" && (
              <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="h-6 px-2 text-xs">
                Limpar filtro
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sort === "recent" ? "Mais recentes" : "Mais úteis"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("recent")}>
                Mais recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("helpful")}>
                Mais úteis
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Carregando avaliações...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => {
              const user = typeof review.user === "object" ? review.user : null;
              const userName = user?.name || "Usuário";
              const userPhoto = user?.photo;
              
              return (
                <Card
                  key={review._id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-muted">
                        <AvatarImage src={userPhoto} alt={userName} />
                        <AvatarFallback>{userName[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {userName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="gap-1 text-xs bg-emerald-500/10 text-emerald-600 border-0"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Verificado
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? ""
                                  : "text-muted-foreground/20"
                              }`}
                              style={star <= review.rating ? { fill: "#0DA2E7", color: "#0DA2E7" } : undefined}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.review}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredReviews.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma avaliação encontrada com este filtro.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
                Ver todas as avaliações
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllReviews;
