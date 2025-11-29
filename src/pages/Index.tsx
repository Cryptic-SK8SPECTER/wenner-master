import { FilterSidebar, type Filters } from "@/components/FilterSidebar";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { fetchProducts } from "@/features/product/productActions";
import { useToast } from "@/hooks/use-toast";
import { clearError } from "@/features/product/productSlice";

const Index = () => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Redux hooks
  const dispatch = useAppDispatch();
  const { products, loading, error, searchQuery } = useAppSelector(
    (state) => state.product
  );

  const maxPrice =
    products.length > 0
      ? Math.max(...products.map((product) => product.price))
      : 200;

  const [filters, setFilters] = useState<Filters>({
    gender: [],
    categories: [],
    colors: [],
    priceRange: [0, maxPrice],
    rating: [],
  });

  const ITEMS_PER_PAGE = 6;

  const { toast } = useToast();

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: error,
      });
      // Clear error after showing
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  // Apply filters and search to products from Redux state
  const appliedFiltersProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter((product) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesDescription = product.description
          ?.toLowerCase()
          .includes(query);

        if (!matchesName && !matchesCategory && !matchesDescription) {
          return false;
        }
      }

      // Filter by gender
      if (
        filters.gender.length > 0 &&
        !filters.gender.includes(product.gender)
      ) {
        return false;
      }

      // Filter by category
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Filter by colors - CORRIGIDO
      if (filters.colors.length > 0) {
        const productColorValues =
          product.colors?.map((colorObj) => colorObj.color.toLowerCase()) || [];
        const hasMatchingColor = productColorValues.some((productColor) =>
          filters.colors.some(
            (filterColor) => productColor === filterColor.toLowerCase()
          )
        );
        if (!hasMatchingColor) return false;
      }

      // Filter by price range
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Filter by rating
      if (filters.rating.length > 0) {
        const meetsRating = filters.rating.some(
          (minRating) => product.rating >= minRating
        );
        if (!meetsRating) return false;
      }
      return true;
    });
  }, [products, filters, searchQuery]);

  const totalPages = Math.ceil(appliedFiltersProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return appliedFiltersProducts.slice(startIndex, endIndex);
  }, [appliedFiltersProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleClearFilters = () => {
    setFilters({
      gender: [],
      categories: [],
      colors: [],
      priceRange: [0, 200],
      rating: [],
    });
    setCurrentPage(1);
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 md:px-6 py-12">
          <div className="flex justify-center items-center">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Home
          </span>
          <span>/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">
            E-commerce
          </span>
          <span>/</span>
          <span className="text-foreground font-medium">Produtos</span>
        </div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Main Content */}
          <main className="flex-1 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Produtos
                </h1>
                <p className="text-muted-foreground">
                  Exibindo {appliedFiltersProducts.length} de {products.length}{" "}
                  produtos
                </p>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtro
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {appliedFiltersProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Nenhum produto encontrado com os filtros selecionados
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {appliedFiltersProducts.length > 0 && totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
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
                                className="cursor-pointer"
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
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
