// features/products/productTypes.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  gender: string;
  colors: string[];
  sizes: string[];
  rating: number;
  description: string;
  discount?: number;
}

export interface ProductFilters {
  gender: string[];
  categories: string[];
  colors: string[];
  priceRange: [number, number];
  rating: number[];
}

export interface CreateProductPayload {
  name: string;
  price: number;
  originalPrice?: number;
  imageCover: string;
  category: string;
  gender: string;
  description: string;
  discount?: number;
}

export interface ProductsState {
  items: Product[];
  filteredItems: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  searchQuery: string;
}
