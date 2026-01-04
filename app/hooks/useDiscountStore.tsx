"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface ProductWithSales {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  category: string | null;
  categoryId: number | null;
  totalSold: number;
  orderCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: number[] | null;
  status: "scheduled" | "active" | "ended";
}

interface DiscountStoreContextType {
  products: ProductWithSales[];
  promotions: Promotion[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  sortBy: "low" | "high" | "all";
  setSortBy: (sort: "low" | "high" | "all") => void;
  fetchProducts: () => Promise<void>;
  fetchPromotions: () => Promise<void>;
  refreshAll: () => Promise<void>;
  deletePromotion: (id: number) => Promise<boolean>;
  applyPromotions: () => Promise<{ success: boolean; message: string; updated: number }>;
}

const DiscountStoreContext = createContext<DiscountStoreContextType | undefined>(undefined);

export function DiscountStoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductWithSales[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"low" | "high" | "all">("low");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/sales-stats?sort=${sortBy === "all" ? "low" : sortBy}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    }
  }, [sortBy]);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Failed to fetch promotions");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProducts(), fetchPromotions()]);
      setIsLoaded(true);
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts, fetchPromotions]);

  const deletePromotion = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting promotion:", err);
      return false;
    }
  }, []);

  const applyPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions/apply", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await fetchProducts();
      }
      return { success: res.ok, message: data.message || "Error", updated: data.updated || 0 };
    } catch (err) {
      return { success: false, message: "Failed to apply promotions", updated: 0 };
    }
  }, [fetchProducts]);

  // Fetch when sortBy changes
  useEffect(() => {
    fetchProducts();
  }, [sortBy, fetchProducts]);

  // Initial load
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      refreshAll();
    }
  }, [isLoaded, isLoading, refreshAll]);

  return (
    <DiscountStoreContext.Provider
      value={{
        products,
        promotions,
        isLoading,
        isLoaded,
        error,
        sortBy,
        setSortBy,
        fetchProducts,
        fetchPromotions,
        refreshAll,
        deletePromotion,
        applyPromotions,
      }}
    >
      {children}
    </DiscountStoreContext.Provider>
  );
}

export function useDiscountStore() {
  const context = useContext(DiscountStoreContext);
  if (!context) {
    throw new Error("useDiscountStore must be used within a DiscountStoreProvider");
  }
  return context;
}
