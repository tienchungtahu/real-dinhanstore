"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/app/hooks/useDebounce";

interface ProductResult {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  brand: string;
  category?: {
    name: string;
    slug: string;
  };
  purchaseCount?: number;
}

export function SearchBar({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [isOpen, setIsOpen] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState<ProductResult[]>([]);
  const [apiResults, setApiResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch purchased products when search is focused (only once)
  const fetchPurchaseHistory = async () => {
    if (hasFetchedHistory) return;
    try {
      const res = await fetch("/api/users/purchase-history");
      const data = await res.json();
      setPurchasedProducts(data.products || []);
      setHasFetchedHistory(true);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  // Fetch API results when debounced query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery.trim()) {
        setApiResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        setApiResults(data.products || []);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    if (!query) fetchPurchaseHistory();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const displayProducts = query.trim() ? apiResults : purchasedProducts;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={t("search") + "..."}
          className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setApiResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Header */}
              {(displayProducts.length > 0 || !query) && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{query ? t("searchResults") || "Kết quả" : t("recentPurchases") || "Sản phẩm đã mua"}</span>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="max-h-[400px] overflow-y-auto">
                {displayProducts.length > 0 ? (
                  displayProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🏸
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{product.brand}</span>
                          {product.category && (
                            <>
                              <span>•</span>
                              <span>{product.category.name}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {product.salePrice && Number(product.salePrice) > 0 ? (
                            <>
                              <span className="text-sm font-bold text-emerald-600">
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-emerald-600">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      {product.purchaseCount && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>x{product.purchaseCount}</span>
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p className="text-sm">
                      {query
                        ? t("noResults") || "Không tìm thấy sản phẩm"
                        : t("noPurchaseHistory") || "Chưa có lịch sử mua hàng"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {query && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={handleSearch}
                    className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {t("searchAll") || `Tìm kiếm "${query}" trong tất cả sản phẩm`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
