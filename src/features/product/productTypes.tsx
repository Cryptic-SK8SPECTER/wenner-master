export interface Color {
  _id: string;
  product: string;
  color: string; // O valor hexadecimal da cor
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageCover: string;
  category: string;
  gender: string;
  colors?: Color[];
  sizes?: string[];
  rating: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  description: string;
  priceDiscount?: number;
  slug: string;
  createdAt: string;
  updatedAt?: string;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  _id: string;
  product: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image: string;
}

export interface Filters {
  gender: string[];
  categories: string[];
  colors: string[];
  priceRange: [number, number];
  rating: number[];
}

export interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  searchQuery: string;
}

export interface ApiResponse<T = any> {
  status?: string;
  message?: string;
  data?: T;
  results?: number;
}

export interface ProductsResponse {
  status: string;
  results?: number;
  data: {
    products: Product[];
  };
}

export interface ProductResponse {
  status: string;
  data: {
    product: Product;
  };
}
