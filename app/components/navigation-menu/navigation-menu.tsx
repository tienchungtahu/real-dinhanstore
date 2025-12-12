"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  MoreHorizontal,
  Loader2,
  Sparkles,
} from "lucide-react";
import { LocaleDropdown } from "@/app/components/features/i18n/locale-dropdown";
import { UserButton } from "@/app/components/auth/UserButton";
import { useProductStore } from "@/app/hooks/useProductStore";
import { useCart } from "@/app/hooks/useCartStore";
import { SearchBar } from "@/app/components/ui/SearchBar";

const categoryIcons: Record<string, string> = {
  vot: "🏸",
  giay: "👟",
  ao: "👕",
  balo: "🎒",
  phukien: "🔧",
  may: "⚙️",
};

export function NavigationMenuDemo() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tProducts = useTranslations("products");
  const { categories, isLoaded, isLoading, getBrandsByCategory } = useProductStore();
  const { itemCount, openCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showOthers, setShowOthers] = useState(false);
  const [selectedOtherCategory, setSelectedOtherCategory] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getCategoryName = (slug: string, fallbackName: string) => {
    try {
      return tProducts(`categoryNames.${slug}`);
    } catch {
      return fallbackName;
    }
  };

  const categoriesWithData = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      title: getCategoryName(cat.slug, cat.name),
      icon: categoryIcons[cat.slug] || "📁",
      items: getBrandsByCategory(cat.slug),
    }));
  }, [categories, getBrandsByCategory, tProducts]);

  const firstThree = categoriesWithData.slice(0, 3);
  const otherCategories = categoriesWithData.slice(3);

  const closeAll = () => {
    setActiveCategory(null);
    setShowOthers(false);
    setSelectedOtherCategory(null);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-white/80 backdrop-blur-sm"
    }`}>
      {/* Main Navigation */}
      <div className="border-b border-gray-100/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <ellipse cx="12" cy="9" rx="5" ry="6" />
                  <rect x="11" y="14" width="2" height="7" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dinhan Store
                </span>
                <span className="block text-xs text-emerald-600 font-medium -mt-0.5">Badminton Pro Shop</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <SearchBar className="w-full" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <UserButton />
              </div>
              <LocaleDropdown />
              
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-3 bg-gray-50 hover:bg-emerald-50 rounded-2xl text-gray-600 hover:text-emerald-600 transition-all duration-300 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg badge-pulse">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Categories Bar - Desktop */}
      <div className="hidden lg:block bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14 relative">
            {isLoading && !isLoaded ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">{tCommon("loading")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* All Products */}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-gray-600 hover:bg-white hover:text-emerald-600 hover:shadow-md transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4" />
                  {tCommon("all")}
                </Link>

                {/* First 3 categories */}
                {firstThree.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      setShowOthers(false);
                      setSelectedOtherCategory(null);
                      setActiveCategory(activeCategory === category.slug ? null : category.slug);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      activeCategory === category.slug
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-gray-600 hover:bg-white hover:text-emerald-600 hover:shadow-md"
                    }`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.title}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeCategory === category.slug ? "rotate-180" : ""}`} />
                  </button>
                ))}

                {/* Other categories */}
                {otherCategories.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setShowOthers(!showOthers);
                      if (!showOthers) setSelectedOtherCategory(otherCategories[0]?.slug || null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      showOthers
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                        : "text-gray-600 hover:bg-white hover:text-emerald-600 hover:shadow-md"
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span>{tCommon("viewMore")}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showOthers ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            )}

            {/* Category Dropdown */}
            {activeCategory && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 min-w-[320px] max-w-md">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoriesWithData.find((c) => c.slug === activeCategory)?.icon}</span>
                        <h3 className="font-bold text-gray-900">
                          {categoriesWithData.find((c) => c.slug === activeCategory)?.title}
                        </h3>
                      </div>
                      <button onClick={closeAll} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Link
                      href={`/products?category=${activeCategory}`}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 rounded-xl mb-3 transition-colors"
                      onClick={closeAll}
                    >
                      <RotateCcw className="w-4 h-4" />
                      {tCommon("all")}
                    </Link>
                    <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto">
                      {categoriesWithData
                        .find((c) => c.slug === activeCategory)
                        ?.items?.map((item) => (
                          <Link
                            key={item}
                            href={`/products?category=${activeCategory}&brand=${encodeURIComponent(item)}`}
                            onClick={closeAll}
                            className="px-4 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all truncate"
                          >
                            {item}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Other Categories Dropdown */}
            {showOthers && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeAll} />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="flex">
                      {/* Left panel */}
                      <div className="w-52 border-r border-gray-100 bg-gray-50/50 p-3">
                        <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("products")}</p>
                        {otherCategories.map((category) => (
                          <button
                            key={category.slug}
                            onClick={() => setSelectedOtherCategory(category.slug)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all ${
                              selectedOtherCategory === category.slug
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-white hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span className="truncate font-medium">{category.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          </button>
                        ))}
                      </div>

                      {/* Right panel */}
                      <div className="w-72 max-h-[50vh] overflow-y-auto p-3">
                        {selectedOtherCategory && (
                          <>
                            <div className="px-3 py-2 mb-2 flex items-center gap-2">
                              <span className="text-xl">{categoriesWithData.find((c) => c.slug === selectedOtherCategory)?.icon}</span>
                              <p className="font-bold text-gray-900">
                                {categoriesWithData.find((c) => c.slug === selectedOtherCategory)?.title}
                              </p>
                            </div>
                            <Link
                              href={`/products?category=${selectedOtherCategory}`}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 rounded-xl mb-2"
                              onClick={closeAll}
                            >
                              <RotateCcw className="w-4 h-4" />
                              {tCommon("all")}
                            </Link>
                            <div className="space-y-1">
                              {categoriesWithData
                                .find((c) => c.slug === selectedOtherCategory)
                                ?.items?.map((item) => (
                                  <Link
                                    key={item}
                                    href={`/products?category=${selectedOtherCategory}&brand=${encodeURIComponent(item)}`}
                                    onClick={closeAll}
                                    className="block px-4 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all"
                                  >
                                    {item}
                                  </Link>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                      <button onClick={closeAll} className="w-full px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all">
                        {tCommon("close")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100">
            <SearchBar />
          </div>

          {/* Mobile Auth */}
          <div className="p-4 border-b border-gray-100">
            <UserButton />
          </div>

          {/* Mobile Links */}
          <div className="p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              🏠 {t("home")}
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl font-medium transition-all"
              onClick={() => setIsOpen(false)}
            >
              <Sparkles className="w-5 h-5" /> {t("products")}
            </Link>
          </div>

          {/* Mobile Categories */}
          <div className="p-4 border-t border-gray-100">
            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("products")}</p>
            {isLoading && !isLoaded ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="space-y-1">
                {categoriesWithData.map((category) => (
                  <div key={category.slug}>
                    <button
                      className={`flex items-center justify-between w-full p-4 rounded-2xl text-left transition-all ${
                        mobileExpanded === category.slug
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileExpanded(mobileExpanded === category.slug ? null : category.slug)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.title}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileExpanded === category.slug ? "rotate-180" : ""}`} />
                    </button>
                    {mobileExpanded === category.slug && (
                      <div className="pl-6 pr-2 py-2 space-y-1 animate-in slide-in-from-top duration-200">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="flex items-center gap-2 py-3 px-4 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 rounded-xl"
                          onClick={() => setIsOpen(false)}
                        >
                          <RotateCcw className="w-4 h-4" />
                          {tCommon("all")}
                        </Link>
                        {category.items.map((item) => (
                          <Link
                            key={item}
                            href={`/products?category=${category.slug}&brand=${encodeURIComponent(item)}`}
                            className="block py-3 px-4 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
