import { FilterSidebar, type Filters } from "@/components/FilterSidebar";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
const Index = () => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    gender: [],
    categories: [],
    colors: [],
    priceRange: [0, 200],
    rating: []
  });
  const ITEMS_PER_PAGE = 6;
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product: Product) => {
      // Filter by gender
      if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
        return false;
      }

      // Filter by category
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }

      // Filter by colors
      if (filters.colors.length > 0) {
        const hasMatchingColor = product.colors.some(color => filters.colors.some(filterColor => color.toLowerCase() === filterColor.toLowerCase()));
        if (!hasMatchingColor) return false;
      }

      // Filter by price range
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Filter by rating
      if (filters.rating.length > 0) {
        const meetsRating = filters.rating.some(minRating => product.rating >= minRating);
        if (!meetsRating) return false;
      }
      return true;
    });
  }, [filters]);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
          <span>/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">E-commerce</span>
          <span>/</span>
          <span className="text-foreground font-medium">Products</span>
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
                  Products
                </h1>
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {mockProducts.length} products
                </p>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <FilterSidebar filters={filters} onFilterChange={setFilters} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? paginatedProducts.map(product => <ProductCard key={product.id} product={product} />) : <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Nenhum produto encontrado com os filtros selecionados
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                setFilters({
                  gender: [],
                  categories: [],
                  colors: [],
                  priceRange: [0, 200],
                  rating: []
                });
                setCurrentPage(1);
              }}>
                    Limpar filtros
                  </Button>
                </div>}
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                    
                    {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  if (page === 1 || page === totalPages || page >= currentPage - 1 && page <= currentPage + 1) {
                    return <PaginationItem key={page}>
                            <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
                              {page}
                            </PaginationLink>
                          </PaginationItem>;
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>;
                  }
                  return null;
                })}

                    <PaginationItem>
                      <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>}
          </main>
        </div>
      </div>

      {/* Produtos Relacionados */}
      
    </div>;
};
export default Index;