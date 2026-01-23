"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  RefreshCw,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  Pencil,
} from "lucide-react";
import { ProductCard } from "@/app/components/ui/ProductCard";
import { useProductStore } from "@/app/hooks/useProductStore";

const ITEMS_PER_PAGE = 12;

const categoryIcons: Record<string, string> = {
  vot: "🏸",
  giay: "👟",
  ao: "👕",
  balo: "🎒",
  phukien: "🔧",
  may: "⚙️",
};

export default function ProductsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const brandParam = searchParams.get("brand") || "";

  const {
    categories,
    brands: allBrands,
    isLoaded,
    isLoading,
    error,
    refreshData,
    getFilteredProducts,
    getBrandsByCategory,
  } = useProductStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandParam ? [brandParam] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  useEffect(() => {
    if (brandParam) {
      setSelectedBrands([brandParam]);
      setCurrentPage(1);
    }
  }, [brandParam]);

  const filteredProducts = useMemo(() => {
    return getFilteredProducts({
      category: selectedCategory,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      search: search || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    });
  }, [getFilteredProducts, selectedCategory, selectedBrands, search, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setPriceRange([0, 10000000]);
    setSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000000;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("error")}</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {t("tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
              <p className="text-white/80">{t("subtitle")}</p>
            </div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all lg:hidden ${showFilters ? "bg-emerald-600 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-500"
                }`}
            >
              <Filter className="w-5 h-5" />
              {t("filters")}
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
                {t("clearFilters")}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {t("productCount", { count: filteredProducts.length })}
            </span>

            {/* Grid toggle */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 rounded-lg transition-colors ${gridCols === 3 ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 rounded-lg transition-colors ${gridCols === 4 ? "bg-emerald-100 text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-emerald-600 hover:border-emerald-500 transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "fixed inset-0 z-50 bg-white overflow-y-auto" : "hidden"} lg:block lg:static lg:w-72 lg:flex-shrink-0`}>
            <div className="lg:sticky lg:top-36 p-6 lg:p-0">
              {/* Mobile header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-xl font-bold">{t("filters")}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    {t("categories")}
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all ${selectedCategory === "all"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span className="text-lg">✨</span>
                      <span className="font-medium">{t("allCategories")}</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all ${selectedCategory === cat.slug
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                          : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span className="text-lg">{categoryIcons[cat.slug] || "📁"}</span>
                        <span className="font-medium">{t(`categoryNames.${cat.slug}`) || cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands/Subcategories */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">{t("subcategories")}</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pt-2">
                    {getBrandsByCategory(selectedCategory).map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={`
                          w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                          ${selectedBrands.includes(brand)
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300 bg-white group-hover:border-emerald-500"}
                        `}>
                          {selectedBrands.includes(brand) && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                        />
                        <span className={`text-sm ${selectedBrands.includes(brand) ? "font-medium text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">{t("priceRange")}</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= priceRange[0]) {
                          setPriceRange([priceRange[0], val]);
                          setCurrentPage(1);
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg group hover:bg-white hover:ring-2 hover:ring-emerald-500/20 transition-all min-w-0">
                        <input
                          type="text"
                          value={priceRange[0].toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/\D/g, ""));
                            if (val <= priceRange[1]) {
                              setPriceRange([val, priceRange[1]]);
                            }
                          }}
                          onBlur={() => setCurrentPage(1)}
                          className="w-full bg-transparent text-sm font-medium text-gray-600 focus:outline-none min-w-[20px]"
                        />
                        <span className="text-gray-400 text-xs shrink-0">{tCommon("currency")}</span>
                        <Pencil className="w-3 h-3 text-gray-400 group-hover:text-emerald-500 shrink-0" />
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg group hover:bg-white hover:ring-2 hover:ring-emerald-500/20 transition-all min-w-0">
                        <input
                          type="text"
                          value={priceRange[1].toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/\D/g, ""));
                            // Allow typing but clamp logic usually handled on blur or strict check
                            // Here we strictly check to keep state valid
                            if (val >= priceRange[0] && val <= 10000000) {
                              setPriceRange([priceRange[0], val]);
                            }
                          }}
                          onBlur={() => setCurrentPage(1)}
                          className="w-full bg-transparent text-sm font-medium text-emerald-700 focus:outline-none min-w-[20px]"
                        />
                        <span className="text-emerald-600 text-xs shrink-0">{tCommon("currency")}</span>
                        <Pencil className="w-3 h-3 text-emerald-600/50 group-hover:text-emerald-600 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile apply button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30 lg:hidden"
                >
                  {t("viewProducts", { count: filteredProducts.length })}
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {!isLoaded || isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 shadow-sm">
                    <div className="aspect-square bg-gray-100 rounded-2xl mb-4 shimmer" />
                    <div className="h-4 bg-gray-100 rounded-full mb-3 shimmer" />
                    <div className="h-4 bg-gray-100 rounded-full w-2/3 shimmer" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${gridCols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                  {paginatedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="stagger-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        salePrice={product.salePrice}
                        image={product.images?.[0] || ""}
                        brand={product.brand}
                        stock={product.stock}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-emerald-500 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-12 h-12 rounded-xl font-semibold transition-all ${currentPage === pageNum
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-500"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-emerald-500 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noProducts")}</h3>
                <p className="text-gray-500 mb-6">{t("noProductsDesc")}</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  {t("clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
