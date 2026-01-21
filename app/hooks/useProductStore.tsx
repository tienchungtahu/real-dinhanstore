"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: string[];
}

interface ProductStoreContextType {
  products: Product[];
  categories: Category[];
  brands: string[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  getProductsByCategory: (categorySlug: string) => Product[];
  getProductsByBrand: (brand: string) => Product[];
  getProductsBySearch: (search: string) => Product[];
  getFilteredProducts: (filters: ProductFilters) => Product[];
  getFeaturedProducts: () => Product[];
  getBrandsByCategory: (categorySlug: string) => string[];
}

interface ProductFilters {
  category?: string;
  brands?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

const ProductStoreContext = createContext<ProductStoreContextType | undefined>(undefined);

export function ProductStoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Skip if already loaded
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch products and categories in parallel
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?limit=1000"),
        fetch("/api/categories"),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.products || []);
      setCategories(categoriesData || []);

      // Extract unique brands
      const uniqueBrands = [
        ...new Set(
          (productsData.products || [])
            .map((p: Product) => p.brand)
            .filter(Boolean)
        ),
      ] as string[];
      setBrands(uniqueBrands);

      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching product data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  // Force refresh data
  const refreshData = useCallback(async () => {
    setIsLoaded(false);
    setIsLoading(true);
    setError(null);

    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?limit=1000"),
        fetch("/api/categories"),
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.products || []);
      setCategories(categoriesData || []);

      const uniqueBrands = [
        ...new Set(
          (productsData.products || [])
            .map((p: Product) => p.brand)
            .filter(Boolean)
        ),
      ] as string[];
      setBrands(uniqueBrands);

      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter functions
  const getProductsByCategory = useCallback(
    (categorySlug: string) => {
      if (categorySlug === "all") return products;
      return products.filter((p) => p.category?.slug === categorySlug);
    },
    [products]
  );

  const getProductsByBrand = useCallback(
    (brand: string) => {
      return products.filter((p) => p.brand === brand);
    },
    [products]
  );

  const getProductsBySearch = useCallback(
    (search: string) => {
      const searchLower = search.toLowerCase();
      return products.filter(

        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.slug.toLowerCase().includes(searchLower) ||
          p.category?.name.toLowerCase().includes(searchLower) ||
          p.category?.slug.toLowerCase().includes(searchLower)
      );
    },
    [products]
  );

  const getFilteredProducts = useCallback(
    (filters: ProductFilters) => {
      let filtered = [...products];

      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter((p) => p.category?.slug === filters.category);
      }

      if (filters.brands && filters.brands.length > 0) {
        filtered = filtered.filter((p) => filters.brands!.includes(p.brand));
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.brand?.toLowerCase().includes(searchLower) ||
            p.slug.toLowerCase().includes(searchLower) ||
            p.category?.name.toLowerCase().includes(searchLower) ||
            p.category?.slug.toLowerCase().includes(searchLower)
        );
      }

      if (filters.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
      }

      return filtered;
    },
    [products]
  );

  const getFeaturedProducts = useCallback(() => {
    return products.filter((p) => p.isFeatured);
  }, [products]);

  const getBrandsByCategory = useCallback(
    (categorySlug: string) => {
      const categoryProducts = categorySlug === "all"
        ? products
        : products.filter((p) => p.category?.slug === categorySlug);
      return [...new Set(categoryProducts.map((p) => p.brand).filter(Boolean))] as string[];
    },
    [products]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProductStoreContext.Provider
      value={{
        products,
        categories,
        brands,
        isLoaded,
        isLoading,
        error,
        fetchData,
        refreshData,
        getProductsByCategory,
        getProductsByBrand,
        getProductsBySearch,
        getFilteredProducts,
        getFeaturedProducts,
        getBrandsByCategory,
      }}
    >
      {children}
    </ProductStoreContext.Provider>
  );
}

export function useProductStore() {
  const context = useContext(ProductStoreContext);
  if (!context) {
    throw new Error("useProductStore must be used within a ProductStoreProvider");
  }
  return context;
}
